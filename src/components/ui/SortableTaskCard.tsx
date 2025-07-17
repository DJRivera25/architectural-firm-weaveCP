"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskWithDetails, Project } from "@/types";

interface SortableTaskCardProps {
  task: TaskWithDetails;
  projectMap: Record<string, Project>;
  isUpdating: boolean;
}

export default function SortableTaskCard({ task, projectMap, isUpdating }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
  const projectName =
    typeof task.projectId === "object" && task.projectId !== null && "name" in task.projectId
      ? task.projectId.name
      : projectMap[typeof task.projectId === "string" ? task.projectId : ""]?.name || "-";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-all ${
        isUpdating ? "opacity-50" : ""
      } ${isOverdue ? "border-red-300 bg-red-50" : ""} ${isDragging ? "opacity-50 scale-105 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{task.name}</h4>
        {isOverdue && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
            Overdue
          </span>
        )}
      </div>

      <div className="text-xs text-blue-700 font-medium mb-2">{projectName}</div>

      {task.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
        <span>
          {task.assignees.length} assignee{task.assignees.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isUpdating && <div className="mt-2 text-xs text-blue-600 animate-pulse">Updating...</div>}

      {isDragging && <div className="mt-2 text-xs text-blue-600">Moving...</div>}
    </div>
  );
}
