"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTasks, updateTask, getTask } from "@/utils/api";
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
import { TimerProviderWithCallbacks } from "@/components/providers/TimerProvider";
import { formatTimeHuman } from "@/utils/timerUtils";

interface KanbanBoardProps {
  projectId: string;
  onTaskCountsChange?: (counts: { total: number; assigned: number }) => void;
}

const STATUS_COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const EmployeeKanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, onTaskCountsChange }) => {
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
        const fetchedTasks = res.data || [];
        setTasks(fetchedTasks);

        // Calculate task counts
        const totalTasks = fetchedTasks.length;
        const assignedTasks = fetchedTasks.filter((task) => task.assignees?.includes(session?.user?.id || "")).length;

        onTaskCountsChange?.({ total: totalTasks, assigned: assignedTasks });
      } catch (err) {
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchTasks();
  }, [projectId, session?.user?.id, onTaskCountsChange]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeTask = tasks.find((t) => t._id === active.id);
    const overColumn = STATUS_COLUMNS.find((col) => col.key === over.id);
    if (!activeTask || !overColumn) return;
    if (activeTask.status === overColumn.key) return;

    // Check if employee is assigned to this task - only allow drag for assigned tasks
    if (!activeTask.assignees?.includes(session?.user?.id || "")) {
      setError("You can only move tasks assigned to you");
      return;
    }

    // Update status in backend
    try {
      await updateTask(activeTask._id, { status: overColumn.key as Task["status"] });
      setTasks((prev) =>
        prev.map((t) => (t._id === activeTask._id ? { ...t, status: overColumn.key as Task["status"] } : t))
      );
      setError(null); // Clear any previous errors
    } catch (err) {
      setError("Failed to update task status");
    }
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...updates } : t)));
  };

  const handleViewTask = async (task: Task) => {
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

  const isAssignedToTask = (task: Task) => {
    return task.assignees?.includes(session?.user?.id || "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <TimerProviderWithCallbacks onTaskUpdate={handleTaskUpdate}>
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
              onViewTask={handleViewTask}
              onTaskUpdate={handleTaskUpdate}
              isAssignedToTask={isAssignedToTask}
            />
          ))}
        </div>
        <TaskModal
          open={modalOpen}
          mode={"edit"} // Use edit mode but TaskModal will be read-only for employees
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
  );
};

interface KanbanColumnProps {
  columnKey: string;
  label: string;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  projectId: string;
  onViewTask: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  isAssignedToTask: (task: Task) => boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnKey,
  label,
  tasks,
  loading,
  error,
  projectId,
  onViewTask,
  onTaskUpdate,
  isAssignedToTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnKey });

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
                onView={() => onViewTask(task)}
                onTaskUpdate={onTaskUpdate}
                isAssigned={isAssignedToTask(task)}
              />
            ))}
          </div>
        )}
      </div>
      {/* Employee version doesn't have "Add a card" button */}
    </div>
  );
};

interface DraggableTaskCardProps {
  task: Task;
  projectId: string;
  onView?: () => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  isAssigned: boolean;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ task, projectId, onView, onTaskUpdate, isAssigned }) => {
  const { data: session } = useSession();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    disabled: !isAssigned, // Only allow drag if assigned to task
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: isAssigned ? "grab" : "pointer",
      }}
      className={`bg-white rounded shadow p-2 mb-1 relative group ${
        !isAssigned ? "opacity-75 border-l-4 border-gray-300" : "border-l-4 border-blue-500"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (onView) onView();
      }}
      {...attributes}
      {...listeners}
    >
      <div className="font-semibold">{task.name}</div>
      <div className="text-xs text-gray-500">
        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
        {task.totalTime && task.totalTime > 0 && (
          <span className="ml-2 text-blue-600">• {formatTimeHuman(task.totalTime)}</span>
        )}
        {!isAssigned && <span className="ml-2 text-gray-400 italic">(View only)</span>}
        {isAssigned && <span className="ml-2 text-green-600 font-medium">(Assigned to you)</span>}
      </div>

      {/* Time Tracking Controls - Show only for assigned tasks */}
      {isAssigned && (
        <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <Timer projectId={projectId} taskId={task._id} taskName={task.name} compact={true} className="text-xs" />
        </div>
      )}
    </div>
  );
};

export default EmployeeKanbanBoard;
