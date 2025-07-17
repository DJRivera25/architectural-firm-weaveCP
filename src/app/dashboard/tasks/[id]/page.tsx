"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { getTask, getTaskComments, addTaskComment } from "@/utils/api";
import { useRouter, useParams } from "next/navigation";
import { Project, User, TaskWithDetails } from "@/types";

interface Comment {
  user: string | { _id: string; name: string };
  text: string;
  createdAt: string;
}

export default function TaskDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await getTask(params.id?.toString() || "");
        let project: Project = { _id: "", name: "-" };
        if (
          typeof res.data.projectId === "object" &&
          res.data.projectId !== null &&
          "_id" in res.data.projectId &&
          "name" in res.data.projectId
        ) {
          project = res.data.projectId as Project;
        } else if (typeof res.data.projectId === "string") {
          project = { _id: res.data.projectId, name: "-" };
        }
        type ApiUser = { _id: string; name: string } | string;
        let assignees: User[] = [];
        if (Array.isArray(res.data.assignees)) {
          assignees = (res.data.assignees as unknown as ApiUser[]).map((a) => {
            if (typeof a === "object" && a !== null && "_id" in a && "name" in a) {
              return { _id: (a as { _id: string })._id, name: (a as { name: string }).name };
            } else if (typeof a === "string") {
              return { _id: a, name: "-" };
            } else {
              return { _id: "", name: "-" };
            }
          });
        }
        setTask({ ...res.data, projectId: project, assignees });
      } catch {
        setError("Task not found or access denied");
      } finally {
        setLoading(false);
      }
    };
    const fetchComments = async () => {
      try {
        const res = await getTaskComments(params.id?.toString() || "");
        setComments(res.data);
      } catch {
        setComments([]);
      }
    };
    fetchTask();
    fetchComments();
  }, [session, router, params.id]);

  const canComment = useCallback(() => {
    if (!session?.user || !task) return false;
    if (session.user.role === "admin" || session.user.role === "manager") return true;
    return (
      Array.isArray(task.assignees) &&
      task.assignees.some((u) =>
        typeof u === "object" && u !== null && "_id" in u ? u._id === session.user.id : u === session.user.id
      )
    );
  }, [session, task]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentLoading(true);
    setCommentError("");
    try {
      await addTaskComment(params.id?.toString() || "", { text: commentText });
      setCommentText("");
      const res = await getTaskComments(params.id?.toString() || "");
      setComments(res.data);
    } catch {
      setCommentError("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading)
    return <div className="text-center text-blue-600 py-12 text-xl font-semibold animate-pulse">Loading...</div>;
  if (error || !task)
    return <div className="text-center text-red-600 py-12 text-xl font-semibold">{error || "Task not found"}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 animate-fadeInSlow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{task.name}</h1>
        {session?.user && (session.user.role === "admin" || session.user.role === "manager") && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
            onClick={() => router.push(`/dashboard/tasks/edit/${task._id}`)}
          >
            Edit
          </button>
        )}
      </div>
      <div className="mb-4">
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
        <span className="text-gray-500 text-xs">
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
        </span>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Project: </span>
        <span className="text-blue-600">
          {typeof task.projectId === "object" && task.projectId !== null && "name" in task.projectId
            ? task.projectId.name
            : "-"}
        </span>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Assignees: </span>
        {Array.isArray(task.assignees) && task.assignees.length === 0 ? (
          <span className="text-gray-400">None</span>
        ) : (
          <span className="text-blue-600">
            {Array.isArray(task.assignees)
              ? task.assignees
                  .map((u) =>
                    typeof u === "object" && u !== null && "name" in u ? u.name : typeof u === "string" ? u : "-"
                  )
                  .join(", ")
              : "-"}
          </span>
        )}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Description:</span>
        <div className="mt-1 text-gray-700 whitespace-pre-line">
          {task.description || <span className="text-gray-400">No description</span>}
        </div>
      </div>
      <div className="mb-4 text-xs text-gray-400">
        <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
        <div>Last Updated: {new Date(task.updatedAt).toLocaleString()}</div>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Comments</h2>
        <div className="space-y-4 mb-4">
          {comments.length === 0 ? (
            <div className="text-gray-400">No comments yet.</div>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-lg px-4 py-2">
                <div className="text-sm font-semibold text-blue-600">
                  {typeof c.user === "object" && c.user !== null && "name" in c.user ? c.user.name : "User"}
                  <span className="text-xs text-gray-400 ml-2">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-gray-700 mt-1 whitespace-pre-line">{c.text}</div>
              </div>
            ))
          )}
        </div>
        {canComment() && (
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-end">
            <textarea
              className="flex-1 border rounded px-3 py-2"
              rows={2}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
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
        )}
        {commentError && <div className="text-red-600 font-semibold mt-2">{commentError}</div>}
      </div>
    </div>
  );
}
