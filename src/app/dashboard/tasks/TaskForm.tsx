import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import type { Task, User, Project } from "@/types";

export type TaskFormMode = "add" | "edit" | "view";

export interface TaskFormValues {
  name: string;
  projectId: string;
  description?: string;
  assignees: string[];
  status: "todo" | "in-progress" | "done" | "active" | "completed" | "paused";
  dueDate?: string;
  isActive: boolean;
}

interface TaskFormProps {
  open: boolean;
  mode: TaskFormMode;
  initialValues?: Task;
  onSubmit?: (data: TaskFormValues) => void;
  onClose: () => void;
  users: User[];
  projects: Project[];
  loading?: boolean;
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "done", label: "Done" },
];

export default function TaskForm({
  open,
  mode,
  initialValues,
  onSubmit,
  onClose,
  users,
  projects,
  loading = false,
}: TaskFormProps) {
  const [form, setForm] = useState<TaskFormValues>({
    name: initialValues?.name || "",
    projectId: initialValues?.projectId || (projects[0]?._id ?? ""),
    description: initialValues?.description || "",
    assignees: initialValues?.assignees || [],
    status: initialValues?.status || "todo",
    dueDate: initialValues?.dueDate || "",
    isActive: initialValues?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        projectId: initialValues.projectId || (projects[0]?._id ?? ""),
        description: initialValues.description || "",
        assignees: initialValues.assignees || [],
        status: initialValues.status || "todo",
        dueDate: initialValues.dueDate || "",
        isActive: initialValues.isActive ?? true,
      });
    }
  }, [initialValues, projects]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [e.target.name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleAssigneesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setForm((prev) => ({ ...prev, assignees: selected }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Task name is required.");
      return;
    }
    if (!form.projectId) {
      setError("Project is required.");
      return;
    }
    if (form.assignees.length === 0) {
      setError("At least one assignee is required.");
      return;
    }
    if (onSubmit) {
      onSubmit({ ...form });
    }
  };

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-blue-100/80 relative overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-blue-100/60 bg-gradient-to-r from-blue-50/80 via-white/80 to-indigo-50/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold tracking-tight text-blue-900 font-archivo">
              {isAdd && "Create Task"}
              {isEdit && "Edit Task"}
              {isView && "Task Details"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-full p-1 hover:bg-blue-100 transition"
            onClick={onClose}
            tabIndex={0}
          >
            <XMarkIcon className="w-6 h-6 text-blue-700" />
          </button>
        </div>
        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Task Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="Enter task name"
                disabled={isView || loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Project *</label>
              <select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                disabled={isView || loading}
                required
              >
                <option value="" disabled>
                  Select project
                </option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-blue-900 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="Describe the task (optional)"
                rows={3}
                disabled={isView || loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Assignees *</label>
              <select
                name="assignees"
                value={form.assignees}
                onChange={handleAssigneesChange}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                multiple
                disabled={isView || loading}
                required
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                disabled={isView || loading}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate ? form.dueDate.slice(0, 10) : ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                disabled={isView || loading}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-600"
                disabled={isView || loading}
              />
              <label className="text-sm font-bold text-blue-900">Active</label>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm font-semibold mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm font-semibold mt-2">Task saved successfully!</div>}
          {/* Footer moved inside form */}
          <div className="sticky bottom-0 left-0 bg-white/95 pt-2 pb-2 z-20 flex gap-2 justify-end border-t border-blue-100 rounded-b-2xl px-6 backdrop-blur-xl shadow-sm">
            {!isView && (
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-base disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Saving..." : isAdd ? "Create Task" : "Save Changes"}
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-base"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </Dialog>
  );
}
