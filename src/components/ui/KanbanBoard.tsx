"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskWithDetails, Project } from "@/types";
import { updateTask } from "@/utils/api";
import toast from "react-hot-toast";
import SortableTaskCard from "./SortableTaskCard";

interface KanbanColumn {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  color: string;
  tasks: TaskWithDetails[];
}

interface KanbanBoardProps {
  tasks: TaskWithDetails[];
  projectMap: Record<string, Project>;
  onTaskUpdate?: (taskId: string, updates: Partial<TaskWithDetails>) => void;
  loading?: boolean;
}

export default function KanbanBoard({ tasks, projectMap, onTaskUpdate, loading }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize columns
  useEffect(() => {
    const initialColumns: KanbanColumn[] = [
      {
        id: "todo",
        title: "To Do",
        status: "todo",
        color: "bg-blue-50 border-blue-200",
        tasks: [],
      },
      {
        id: "in-progress",
        title: "In Progress",
        status: "in-progress",
        color: "bg-yellow-50 border-yellow-200",
        tasks: [],
      },
      {
        id: "done",
        title: "Done",
        status: "done",
        color: "bg-green-50 border-green-200",
        tasks: [],
      },
    ];

    // Distribute tasks to columns
    initialColumns.forEach((column) => {
      column.tasks = tasks.filter((task) => task.status === column.status);
    });

    setColumns(initialColumns);
  }, [tasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeTaskId = active.id as string;
    const targetColumnId = over.id as string;

    // Find the task and target column
    const activeTask = tasks.find((task) => task._id === activeTaskId);
    const targetColumn = columns.find((col) => col.id === targetColumnId);

    if (!activeTask || !targetColumn) {
      return;
    }

    // Don't update if status is the same
    if (activeTask.status === targetColumn.status) {
      return;
    }

    setUpdating(activeTaskId);

    try {
      // Update task status via API
      await updateTask(activeTaskId, { status: targetColumn.status });

      // Update local state
      const updatedColumns = columns.map((column) => {
        if (column.status === activeTask.status) {
          // Remove from source column
          return {
            ...column,
            tasks: column.tasks.filter((task) => task._id !== activeTaskId),
          };
        } else if (column.status === targetColumn.status) {
          // Add to target column
          const updatedTask = { ...activeTask, status: targetColumn.status };
          return {
            ...column,
            tasks: [...column.tasks, updatedTask],
          };
        }
        return column;
      });

      setColumns(updatedColumns);

      // Call parent callback if provided
      if (onTaskUpdate) {
        onTaskUpdate(activeTaskId, { status: targetColumn.status });
      }

      toast.success(`Task moved to ${targetColumn.title}`);
    } catch (error) {
      toast.error("Failed to update task status");
      console.error("Error updating task:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-600 text-xl font-semibold animate-pulse">Loading Kanban board...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {columns.map((column) => (
            <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4 min-h-[500px]`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">{column.title}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-600">
                  {column.tasks.length}
                </span>
              </div>

              <SortableContext items={column.tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <SortableTaskCard
                      key={task._id}
                      task={task}
                      projectMap={projectMap}
                      isUpdating={updating === task._id}
                    />
                  ))}
                </div>
              </SortableContext>

              {column.tasks.length === 0 && (
                <div className="text-center text-gray-400 py-8">No tasks in {column.title.toLowerCase()}</div>
              )}
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
