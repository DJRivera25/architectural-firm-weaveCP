import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { motion } from "framer-motion";
import { FolderIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { createProject } from "@/utils/api";
import type { Project } from "@/types";

interface ProjectFormProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  initialValues?: Project;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ProjectForm({ open, mode, initialValues, onClose, onSuccess }: ProjectFormProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";
  const [form, setForm] = useState({
    name: "",
    client: "",
    description: "",
    status: "active",
    budget: "",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    if (!form.name.trim()) {
      setError("Project name is required.");
      setSubmitting(false);
      return;
    }
    try {
      await createProject({
        name: form.name.trim(),
        client: form.client.trim() || undefined,
        description: form.description.trim() || undefined,
        status: form.status as "active" | "completed" | "on-hold" | "cancelled",
        budget: form.budget ? Number(form.budget) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      let errorMsg = "Failed to create project. Please try again.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { error?: string } } }).response?.data?.error
      ) {
        errorMsg = (err as { response: { data: { error: string } } }).response.data.error;
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      client: "",
      description: "",
      status: "active",
      budget: "",
      startDate: "",
      endDate: "",
    });
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    onClose();
  };

  const getTitle = () => {
    if (isView) return "View Project";
    if (isEdit) return "Edit Project";
    return "Create Project";
  };
  const getSubmitLabel = () => {
    if (isEdit) return "Save Changes";
    return "Create Project";
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-blue-100/70 p-0 max-w-2xl mx-auto my-2 overflow-visible max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent flex flex-col"
        style={{ minWidth: 340 }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-blue-100/60 bg-gradient-to-r from-blue-50/80 via-white/80 to-indigo-50/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-7 h-7 text-blue-700" />
            <span className="text-lg md:text-xl font-bold tracking-tight text-blue-900 font-archivo">{getTitle()}</span>
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
        {/* Watermark logo */}
        <Image
          src="/weave-hsymbol-tri.svg"
          alt="Watermark"
          width={64}
          height={64}
          className="pointer-events-none select-none opacity-10 absolute bottom-1 right-1 z-0 w-16 h-16"
        />
        <form onSubmit={handleSubmit} className="relative z-10 flex-1 px-6 py-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Project Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={isView || submitting}
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Project Name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Client</label>
            <input
              type="text"
              name="client"
              value={form.client}
              onChange={handleChange}
              disabled={isView || submitting}
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="Client Name (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={isView || submitting}
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              rows={3}
              placeholder="Project Description (optional)"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={isView || submitting}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Budget ($)</label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                disabled={isView || submitting}
                min={0}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="Budget (optional)"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                disabled={isView || submitting}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                disabled={isView || submitting}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm font-medium mt-2">{error}</div>}
          {success && (
            <div className="text-green-700 text-sm font-medium flex items-center gap-2 mt-2">
              {/* PlusIcon was removed from imports, so this line will cause a linter error */}
              Project created successfully!
            </div>
          )}
          {/* Sticky Footer */}
          <div className="sticky bottom-0 left-0 bg-white/95 pt-2 pb-2 z-20 flex gap-2 justify-end border-t border-blue-100 rounded-b-2xl px-6 backdrop-blur-xl shadow-sm">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            {!isView && (
              <Button type="submit" disabled={submitting}>
                {submitting ? (isEdit ? "Saving..." : "Creating...") : getSubmitLabel()}
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </Dialog>
  );
}
