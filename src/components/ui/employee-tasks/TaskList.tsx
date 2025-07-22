import type { TaskWithDetails, Project } from "@/types";

interface TaskListProps {
  tasks: TaskWithDetails[];
  onView: (task: TaskWithDetails) => void;
  onComplete: (task: TaskWithDetails) => void;
  projectMap: Record<string, Project>;
}

function statusBadge(status: string) {
  if (status === "completed") return "bg-green-100 text-green-700";
  if (status === "paused") return "bg-yellow-100 text-yellow-700";
  return "bg-blue-100 text-blue-700";
}

export default function TaskList({ tasks, onView, onComplete, projectMap }: TaskListProps) {
  return (
    <div className="flex-1 w-full">
      {tasks.length === 0 ? (
        <div className="text-gray-400 text-center py-12">No tasks found.</div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";
            return (
              <li
                key={task._id}
                className="bg-white rounded-xl shadow flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-gray-900 truncate">{task.name}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge(task.status)}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                    {isOverdue && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                        Overdue
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-700 font-semibold">
                    {typeof task.projectId === "object" && task.projectId !== null && "name" in task.projectId
                      ? task.projectId.name
                      : projectMap[typeof task.projectId === "string" ? task.projectId : ""]?.name || "-"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
                    onClick={() => onView(task)}
                  >
                    View
                  </button>
                  {task.status !== "completed" && (
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-800 transition"
                      onClick={() => onComplete(task)}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
