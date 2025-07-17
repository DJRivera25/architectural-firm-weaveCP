import { TaskWithDetails } from "@/types";

interface Comment {
  user: string | { _id: string; name: string };
  text: string;
  createdAt: string;
}

interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  task: TaskWithDetails | null;
  comments: Comment[];
  commentText: string;
  onCommentTextChange: (text: string) => void;
  onAddComment: () => void;
  onMarkComplete: () => void;
  loading: boolean;
  commentLoading: boolean;
}

export default function TaskDetailsModal({
  open,
  onClose,
  task,
  comments,
  commentText,
  onCommentTextChange,
  onAddComment,
  onMarkComplete,
  loading,
  commentLoading,
}: TaskDetailsModalProps) {
  if (!open || !task) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeInSlow">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">{task.name}</h2>
        <div className="mb-2 text-blue-700 font-semibold">
          {typeof task.projectId === "object" && task.projectId !== null && "name" in task.projectId
            ? task.projectId.name
            : "-"}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status: </span>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mr-2
            ${
              task.status === "completed"
                ? "bg-green-100 text-green-700"
                : task.status === "paused"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }
          `}
          >
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
        <div className="mb-2 text-xs text-gray-500">
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Description:</span>
          <div className="mt-1 text-gray-700 whitespace-pre-line">
            {task.description || <span className="text-gray-400">No description</span>}
          </div>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Assignees: </span>
          <span className="text-blue-600">
            {Array.isArray(task.assignees)
              ? task.assignees
                  .map((u) =>
                    typeof u === "object" && u !== null && "name" in u ? u.name : typeof u === "string" ? u : "-"
                  )
                  .join(", ")
              : "-"}
          </span>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Comments</h3>
          <div className="space-y-3 mb-2 max-h-40 overflow-y-auto">
            {comments.length === 0 ? (
              <div className="text-gray-400">No comments yet.</div>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-sm font-semibold text-blue-600">
                    {typeof c.user === "object" && c.user !== null && "name" in c.user ? c.user.name : "User"}
                    <span className="text-xs text-gray-400 ml-2">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-gray-700 mt-1 whitespace-pre-line">{c.text}</div>
                </div>
              ))
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddComment();
            }}
            className="flex gap-2 items-end mt-2"
          >
            <textarea
              className="flex-1 border rounded px-3 py-2"
              rows={2}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => onCommentTextChange(e.target.value)}
              required
              disabled={commentLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
              disabled={commentLoading || !commentText.trim()}
            >
              {commentLoading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
        {task.status !== "completed" && (
          <button
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition w-full"
            onClick={onMarkComplete}
            disabled={loading}
          >
            {loading ? "Marking..." : "Mark as Complete"}
          </button>
        )}
      </div>
    </div>
  );
}
