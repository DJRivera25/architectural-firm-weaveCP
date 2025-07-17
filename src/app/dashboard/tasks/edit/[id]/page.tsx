"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUsers, getProjects, getTask, updateTask } from "@/utils/api";
import { useRouter, useParams } from "next/navigation";
import { isAxiosError } from "axios";
import { Task, Project, User } from "@/types";

export default function EditTaskPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "manager")) {
      router.replace("/dashboard");
      return;
    }
    const fetchData = async () => {
      try {
        const [userRes, projectRes, taskRes] = await Promise.all([
          getUsers("?role=employee"),
          getProjects(),
          getTask(params.id?.toString() || ""),
        ]);
        // Map IUser[] to User[]
        interface IUser {
          _id: string | { toString: () => string };
          name?: string;
        }
        const mappedUsers = (userRes.data as IUser[]).map((u) => ({
          _id: typeof u._id === "string" ? u._id : u._id?.toString?.() ?? "",
          name: u.name ?? "",
        }));
        setUsers(mappedUsers);
        setProjects(projectRes.data);
        setForm(taskRes.data);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, router, params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleAssigneesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!form) return;
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((prev) => (prev ? { ...prev, assignees: options } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    setError("");
    try {
      await updateTask(form._id, {
        ...form,
        dueDate: form.dueDate
          ? typeof form.dueDate === "string"
            ? form.dueDate
            : (form.dueDate as Date).toISOString()
          : undefined,
      });
      router.push("/dashboard/tasks");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to update task");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !form)
    return <div className="text-center text-blue-600 py-12 text-xl font-semibold animate-pulse">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 animate-fadeInSlow">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Task</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Task Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Project</label>
          <select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Assignees</label>
          <select
            name="assignees"
            value={form.assignees}
            onChange={handleAssigneesChange}
            multiple
            required
            className="w-full border rounded px-3 py-2 h-32"
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Due Date</label>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate?.slice(0, 10) || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
