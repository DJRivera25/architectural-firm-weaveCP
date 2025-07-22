import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import type { Team, User } from "@/types";

export type TeamFormMode = "add" | "edit" | "view";

export interface TeamFormValues {
  name: string;
  description?: string;
  members: string[];
  manager?: string;
}

export interface TeamFormProps {
  open: boolean;
  mode: TeamFormMode;
  initialValues?: TeamFormValues;
  onSubmit?: (data: TeamFormValues) => void;
  onCancel: () => void;
  users: { _id: string; name: string }[];
  loading?: boolean;
}

export default function TeamForm({
  open,
  mode,
  initialValues,
  onSubmit,
  onCancel,
  users,
  loading = false,
}: TeamFormProps) {
  const [form, setForm] = useState<TeamFormValues>({
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    members: initialValues?.members || [],
    manager: initialValues?.manager || "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        description: initialValues.description || "",
        members: initialValues.members || [],
        manager: initialValues.manager || "",
      });
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setForm((prev) => ({ ...prev, members: selected }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Team name is required.");
      return;
    }
    if (form.members.length === 0) {
      setError("At least one member is required.");
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
    <Dialog open={open} onOpenChange={onCancel}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-purple-100/80 relative overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-purple-100/60 bg-gradient-to-r from-purple-50/80 via-white/80 to-indigo-50/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold tracking-tight text-purple-900 font-archivo">
              {isAdd && "Create Team"}
              {isEdit && "Edit Team"}
              {isView && "Team Details"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-full p-1 hover:bg-purple-100 transition"
            onClick={onCancel}
            tabIndex={0}
          >
            <XMarkIcon className="w-6 h-6 text-purple-700" />
          </button>
        </div>
        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-1">Team Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                placeholder="Enter team name"
                disabled={isView || loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                placeholder="Describe the team (optional)"
                rows={3}
                disabled={isView || loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-1">Members *</label>
              <select
                name="members"
                value={form.members}
                onChange={handleMembersChange}
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
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
              <label className="block text-sm font-bold text-purple-900 mb-1">Manager</label>
              <select
                name="manager"
                value={form.manager}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                disabled={isView || loading}
              >
                <option value="">No manager</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm font-semibold mt-2">{error}</div>}
          {/* Footer */}
          <div className="sticky bottom-0 left-0 bg-white/95 pt-2 pb-2 z-20 flex gap-2 justify-end border-t border-purple-100 rounded-b-2xl px-6 backdrop-blur-xl shadow-sm">
            {!isView && (
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all text-base disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Saving..." : isAdd ? "Create Team" : "Save Changes"}
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all text-base"
              onClick={onCancel}
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
