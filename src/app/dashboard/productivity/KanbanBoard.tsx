"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTasks, updateTask, createTask, getTask, createNotification } from "@/utils/api";
import type { Task } from "@/types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import TaskModal from "./TaskModal/index";
import { Timer } from "@/components/ui/Timer";
import { TimerProvider, TimerProviderWithCallbacks } from "@/components/providers/TimerProvider";
import { PencilIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { formatTimeHuman } from "@/utils/timerUtils";

interface KanbanBoardProps {
  projectId: string;
}

const STATUS_COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialValues, setModalInitialValues] = useState<Partial<Task> | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Only start drag if mouse moves 5px
      },
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTasks(`?projectId=${projectId}`);
        setTasks(res.data || []);
      } catch (err) {
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchTasks();
  }, [projectId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeTask = tasks.find((t) => t._id === active.id);
    const overColumn = STATUS_COLUMNS.find((col) => col.key === over.id);
    if (!activeTask || !overColumn) return;
    if (activeTask.status === overColumn.key) return;
    // Update status in backend
    try {
      await updateTask(activeTask._id, { status: overColumn.key as Task["status"] });
      setTasks((prev) =>
        prev.map((t) => (t._id === activeTask._id ? { ...t, status: overColumn.key as Task["status"] } : t))
      );
    } catch (err) {
      setError("Failed to update task status");
    }
  };

  const handleAddTask = async (status: Task["status"], name?: string) => {
    if (!name) return;
    try {
      const res = await createTask({ name, status, projectId, assignees: [], isActive: true });
      setTasks((prev) => [...prev, res.data]);
    } catch {
      setError("Failed to create task");
    }
  };

  const handleEditTask = async (task: Task) => {
    // Fetch latest task details from backend
    try {
      const res = await getTask(task._id);
      setModalInitialValues(res.data);
    } catch {
      setModalInitialValues(task); // fallback
    }
    setModalOpen(true);
  };

  const handleSaveTask = async (values: Partial<Task>) => {
    setModalOpen(false);
    if (modalInitialValues?._id) {
      // Update local state with the received data (TaskModal already called the API)
      setTasks((prev) => prev.map((t) => (t._id === modalInitialValues._id ? { ...t, ...values } : t)));
      console.log("Task updated in local state:", values);
    }
  };

  return (
    <TimerProvider>
      <TimerProviderWithCallbacks
        onTaskUpdate={(taskId, updates) => {
          setTasks((prevTasks) => prevTasks.map((task) => (task._id === taskId ? { ...task, ...updates } : task)));
        }}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto items-start">
            {STATUS_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.key}
                columnKey={col.key}
                label={col.label}
                tasks={tasks.filter((task) => task.status === col.key)}
                loading={loading}
                error={error}
                projectId={projectId}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onTaskUpdate={(taskId, updates) => {
                  setTasks((prevTasks) =>
                    prevTasks.map((task) => (task._id === taskId ? { ...task, ...updates } : task))
                  );
                }}
              />
            ))}
          </div>
          <TaskModal
            open={modalOpen}
            mode={"edit"}
            initialValues={modalInitialValues}
            status={modalInitialValues?.status || "todo"}
            projectId={projectId}
            onSave={handleSaveTask}
            onClose={() => setModalOpen(false)}
            onTaskUpdate={(taskId, updates) => {
              setTasks((prevTasks) => prevTasks.map((task) => (task._id === taskId ? { ...task, ...updates } : task)));
            }}
          />
        </DndContext>
      </TimerProviderWithCallbacks>
    </TimerProvider>
  );
};

interface KanbanColumnProps {
  columnKey: string;
  label: string;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  projectId: string;
  onAddTask: (status: Task["status"], name?: string) => void;
  onEditTask: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}
const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnKey,
  label,
  tasks,
  loading,
  error,
  projectId,
  onAddTask,
  onEditTask,
  onTaskUpdate,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnKey });
  const [adding, setAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTaskName.trim()) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await onAddTask(columnKey as Task["status"], newTaskName.trim());
      setNewTaskName("");
      setAdding(false);
    } catch (err) {
      setAddError("Failed to add card");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-[280px] bg-gray-50 rounded p-2 transition ${isOver ? "ring-2 ring-blue-400" : ""}`}
    >
      <h2 className="font-bold mb-2 text-center">{label}</h2>
      <div className={`${tasks.length > 0 ? "min-h-[50px] max-h-[450px]" : ""} overflow-y-auto mb-3`}>
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="">
            {tasks.map((task) => (
              <DraggableTaskCard
                key={task._id}
                task={task}
                projectId={projectId}
                onEdit={() => onEditTask(task)}
                onTaskUpdate={onTaskUpdate}
              />
            ))}
          </div>
        )}
      </div>
      {adding ? (
        <div className="mt-2 bg-white rounded shadow p-2 flex flex-col gap-2">
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter a title or paste a link"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setAdding(false);
            }}
            disabled={addLoading}
          />
          <div className="flex items-center gap-2">
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700"
              onClick={handleAdd}
              disabled={addLoading}
            >
              Add card
            </button>
            <button
              className="text-2xl text-gray-500 hover:text-gray-700"
              onClick={() => {
                setAdding(false);
                setNewTaskName("");
              }}
              type="button"
              aria-label="Cancel"
            >
              &#10005;
            </button>
          </div>
          {addError && <div className="text-red-500 text-xs mt-1">{addError}</div>}
        </div>
      ) : (
        <button
          className="w-full mt-2 py-1 px-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-semibold"
          onClick={() => setAdding(true)}
        >
          + Add a card
        </button>
      )}
    </div>
  );
};

interface DraggableTaskCardProps {
  task: Task;
  projectId: string;
  onEdit?: () => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ task, projectId, onEdit, onTaskUpdate }) => {
  const { data: session } = useSession();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id });

  // Check if current user is assigned to this task
  const isAssigned = task.assignees.includes(session?.user?.id || "");

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
      className="bg-white rounded shadow p-2 mb-1 relative group"
      onClick={(e) => {
        e.stopPropagation();
        if (onEdit) onEdit();
      }}
      {...attributes}
      {...listeners}
    >
      <div className="font-semibold">{task.name}</div>
      <div className="text-xs text-gray-500">
        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
        {isAssigned && task.totalTime && task.totalTime > 0 && (
          <span className="ml-2 text-blue-600">• {formatTimeHuman(task.totalTime)}</span>
        )}
      </div>

      {/* Time Tracking Controls - Show by default for assigned tasks */}
      {isAssigned && (
        <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <Timer projectId={projectId} taskId={task._id} taskName={task.name} compact={true} className="text-xs" />
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
