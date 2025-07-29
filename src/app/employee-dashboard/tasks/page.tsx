"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTasks, updateTask, createTask, getTask } from "@/utils/api";
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
import { Timer } from "@/components/ui/Timer";
import { TimerProvider } from "@/components/providers/TimerProvider";
import { PencilIcon, Bars3Icon, PlusIcon } from "@heroicons/react/24/outline";
import { formatTimeHuman } from "@/utils/timerUtils";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";

const STATUS_COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const EmployeeKanbanBoard: React.FC = () => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Only start drag if mouse moves 5px
      },
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch tasks assigned to current user
        const res = await getTasks(`?assigneeId=${session.user.id}`);
        setTasks(res.data || []);
      } catch (err) {
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [session?.user?.id]);

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

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...updates } : t)));
  };

  if (loading) {
    return (
      <EmployeeDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  if (error) {
    return (
      <EmployeeDashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  return (
    <EmployeeDashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your assigned tasks</p>
        </div>

        <TimerProvider>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STATUS_COLUMNS.map((column) => {
                const columnTasks = tasks.filter((task) => task.status === column.key);
                return (
                  <KanbanColumn
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    tasks={columnTasks}
                    loading={loading}
                    error={error}
                    projectId=""
                    onAddTask={() => {}} // Employees can't add tasks
                    onEditTask={() => {}} // Employees can't edit tasks
                    onTaskUpdate={handleTaskUpdate}
                  />
                );
              })}
            </div>
          </DndContext>
        </TimerProvider>
      </div>
    </EmployeeDashboardLayout>
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
  const { setNodeRef } = useDroppable({ id: columnKey });

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">{tasks.length}</span>
      </div>

      <div ref={setNodeRef} className="space-y-3">
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-4 shadow-sm border cursor-move hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.name}</h4>
        <div className="flex items-center gap-1">
          {task.totalTime && task.totalTime > 0 && (
            <span className="text-xs text-blue-600 font-medium">{formatTimeHuman(task.totalTime)}</span>
          )}
        </div>
      </div>

      {task.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              task.status === "todo"
                ? "bg-gray-100 text-gray-700"
                : task.status === "in-progress"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {task.status}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Timer projectId={task.projectId} taskId={task._id} taskName={task.name} compact={true} className="text-xs" />
        </div>
      </div>
    </div>
  );
};

export default EmployeeKanbanBoard;
