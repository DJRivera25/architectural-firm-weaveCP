import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import type { Task, User, Project } from "@/types";
import type { TaskAttachment } from "@/types";
import { getProjectMembers, getProjects, updateTask, addTaskComment } from "@/utils/api";
import { Avatar } from "@/components/ui/Avatar";
import { Timer } from "@/components/ui/Timer";
import { TaskTimeLogs } from "@/components/ui/TaskTimeLogs";
import { TimerProvider, TimerProviderWithCallbacks } from "@/components/providers/TimerProvider";
import {
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

// Import our refactored components and hooks
import { useAssignees } from "./hooks/useAssignees";
import { AssigneesSection } from "./components/AssigneesSection";
import { MembersDropdown } from "./components/MembersDropdown";
import { ActionBar } from "./components/ActionBar";
import type { Assignee } from "./utils/assigneeUtils";

interface TaskModalProps {
  open: boolean;
  mode: "edit";
  initialValues?: Partial<Task>;
  status: Task["status"];
  projectId: string;
  onSave: (values: Partial<Task>) => void;
  onClose: () => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "done", label: "Done" },
];

// Locally extend TaskAttachment for local file handling
interface LocalTaskAttachment extends TaskAttachment {
  file?: File;
  isLocal?: boolean;
}

const normalizeAssignees = (assignees: (string | { _id: string })[] | undefined): string[] => {
  if (!assignees) return [];
  return assignees
    .map((a) => {
      if (typeof a === "string") return a;
      if (typeof a === "object" && a !== null && "_id" in a) return a._id;
      return "";
    })
    .filter(Boolean);
};

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  mode,
  initialValues,
  status,
  projectId,
  onSave,
  onClose,
  onTaskUpdate,
}) => {
  const { data: session } = useSession();
  const [form, setForm] = useState<Partial<Task & { attachments?: LocalTaskAttachment[] }>>({
    name: "",
    description: "",
    dueDate: "",
    assignees: normalizeAssignees(initialValues?.assignees),
    status,
    isActive: true,
    projectId,
    checklist: [],
    activity: [],
    attachments: [],
    comments: [],
    ...initialValues,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Section visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDateSection, setShowDueDateSection] = useState(false);
  const [showAttachmentsSection, setShowAttachmentsSection] = useState(false);
  const [showChecklistSection, setShowChecklistSection] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<null | "members" | "dates" | "checklist" | "attachments">(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  // Use our custom assignees hook
  const assigneesHook = useAssignees({
    users,
    initialAssignees: form.assignees || [],
    onAssigneesChange: (newAssignees) => {
      // Convert Assignee[] back to string[] for the form state
      const stringAssignees = newAssignees.map((assignee) => (typeof assignee === "string" ? assignee : assignee._id));
      setForm((prev) => ({ ...prev, assignees: stringAssignees }));
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown && !showDatePicker) return;
    function handleClick(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown, showDatePicker]);

  // Fetch project members and projects when modal opens
  useEffect(() => {
    if (open) {
      console.log("TaskModal: Fetching project members and projects...");
      getProjectMembers(projectId)
        .then((res) => {
          console.log("TaskModal: Project members API response:", res);
          // Map IUser[] to User[] (using 'unknown' and type guard)
          const mapped = (res.data || []).map((u: unknown) => {
            if (typeof u === "object" && u !== null && "_id" in u) {
              const userObj = u as { [key: string]: unknown };
              return {
                _id:
                  typeof userObj._id === "string"
                    ? userObj._id
                    : typeof userObj._id === "object" && userObj._id !== null && "toString" in userObj._id
                    ? (userObj._id as { toString: () => string }).toString()
                    : "",
                name: typeof userObj.name === "string" ? userObj.name : "",
                email: typeof userObj.email === "string" ? userObj.email : undefined,
                role: typeof userObj.role === "string" ? userObj.role : undefined,
                isActive: typeof userObj.isActive === "boolean" ? userObj.isActive : undefined,
                image: typeof userObj.image === "string" ? userObj.image : undefined,
                position: typeof userObj.position === "string" ? userObj.position : undefined,
                team: typeof userObj.team === "string" ? userObj.team : undefined,
                createdAt: userObj.createdAt
                  ? typeof userObj.createdAt === "string"
                    ? userObj.createdAt
                    : userObj.createdAt instanceof Date
                    ? userObj.createdAt.toISOString()
                    : undefined
                  : undefined,
              };
            }
            return {
              _id: "",
              name: "",
            };
          });
          console.log("TaskModal: Mapped project members:", mapped);
          setUsers(mapped as User[]);
        })
        .catch((error: unknown) => {
          console.error("TaskModal: Failed to fetch project members:", error);
        });
      getProjects()
        .then((res) => {
          console.log("TaskModal: Projects API response:", res);
          setProjects(res.data || []);
        })
        .catch((error: unknown) => {
          console.error("TaskModal: Failed to fetch projects:", error);
        });
    }
  }, [open, projectId]);

  // Update form when initialValues changes
  useEffect(() => {
    if (initialValues) {
      setForm({
        name: "",
        description: "",
        dueDate: "",
        assignees: normalizeAssignees(initialValues.assignees),
        status,
        isActive: true,
        projectId,
        checklist: [],
        activity: [],
        attachments: [],
        comments: [],
        ...initialValues,
      });
    }
  }, [initialValues, status, projectId]);

  // Reset section visibility when modal closes
  useEffect(() => {
    if (!open) {
      setShowDueDateSection(false);
      setShowAttachmentsSection(false);
      setShowChecklistSection(false);
      setShowDatePicker(false);
      setOpenDropdown(null);
    }
  }, [open]);

  // Checklist logic
  const handleAddChecklistItem = () => {
    setForm((prev) => ({
      ...prev,
      checklist: [...(prev.checklist || []), { text: "", checked: false, createdAt: new Date().toISOString() }],
    }));
  };
  const handleChecklistItemChange = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).map((item, i) => (i === idx ? { ...item, text: value } : item)),
    }));
  };
  const handleChecklistItemCheck = (idx: number, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).map((item, i) =>
        i === idx ? { ...item, checked, checkedAt: checked ? new Date().toISOString() : undefined } : item
      ),
    }));
  };
  const handleRemoveChecklistItem = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).filter((_, i) => i !== idx),
    }));
  };

  // Attachments logic (defer upload until save)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleAddAttachment = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      attachments: [
        ...(prev.attachments || []),
        { url, file, uploadedBy: "", uploadedAt: new Date().toISOString(), isLocal: true },
      ],
    }));
  };
  const handleRemoveAttachment = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== idx),
    }));
  };

  // Merge activity and comments for timeline
  const activity = useMemo(() => {
    const acts = (form.activity || []).map((a) => ({ ...a, _type: "activity" }));
    const comments = (form.comments || []).map((c) => ({ ...c, _type: "comment" }));
    return [...acts, ...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [form.activity, form.comments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [e.target.name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name?.trim()) {
      setError("Task name is required.");
      return;
    }
    if (!form.projectId) {
      setError("Project is required.");
      return;
    }

    console.log("TaskModal: Submitting form data:", form);

    try {
      // Upload new attachments (isLocal)
      let uploadedAttachments: LocalTaskAttachment[] = [];
      if (form.attachments && form.attachments.length > 0) {
        uploadedAttachments = (
          await Promise.all(
            form.attachments.map(async (att: LocalTaskAttachment) => {
              if (att.isLocal && att.file) {
                const formData = new FormData();
                formData.append("file", att.file);
                try {
                  const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await res.json();
                  if (data.url) {
                    return { ...att, url: data.url, isLocal: false, file: undefined };
                  }
                } catch {
                  alert("Failed to upload file.");
                }
                return null;
              }
              return att;
            })
          )
        ).filter((a): a is LocalTaskAttachment => !!a);
      }

      const finalData = { ...form, attachments: uploadedAttachments } as Task;
      console.log("TaskModal: Final data being sent to API:", finalData);

      // Call the API directly
      const updatedTask = await updateTask(initialValues?._id || "", finalData);
      console.log("TaskModal: Task updated successfully:", updatedTask.data);

      // Call onSave with the updated task data
      onSave(updatedTask.data);
    } catch (error) {
      console.error("Failed to update task:", error);
      setError("Failed to update task. Please try again.");
    }
  };

  const [showDetails, setShowDetails] = useState(true);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Handle comment submission
  const handleAddComment = async () => {
    if (!comment.trim() || commentLoading) return;

    try {
      setCommentLoading(true);
      const commentText = comment.trim();
      setComment(""); // Clear the input immediately for better UX

      const response = await addTaskComment(initialValues?._id || "", { text: commentText });
      console.log("TaskModal: Comment added successfully:", response.data);

      // Add the new comment to the form state
      setForm((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), response.data],
      }));
    } catch (error) {
      console.error("Failed to add comment:", error);
      setError("Failed to add comment. Please try again.");
      // Restore the comment text if it failed
      setComment(comment);
    } finally {
      setCommentLoading(false);
    }
  };

  if (!open) return null;

  // Debug: Log current form state
  console.log("TaskModal: Current form state:", form);
  console.log("TaskModal: Users loaded:", users.length);
  console.log("TaskModal: Assignees:", form.assignees);
  console.log("TaskModal: Filtered assignees:", assigneesHook.assignedUsers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <TimerProvider>
        <TimerProviderWithCallbacks onTaskUpdate={onTaskUpdate}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-blue-100/60 bg-gradient-to-r from-blue-50/80 via-white/80 to-indigo-50/80 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <select
                  name="status"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Task["status"] }))}
                  className="bg-blue-100 text-blue-900 font-semibold rounded px-2 py-1 text-sm focus:outline-none"
                  style={{ minWidth: 90 }}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-blue-100 transition">
                <span className="sr-only">Close</span>
                <svg
                  className="w-6 h-6 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col md:flex-row sm:max-h-[70vh] max-h-[60vh] `}>
              {/* Left: Task details */}
              <form
                onSubmit={handleSubmit}
                className={`flex flex-col gap-6 px-8 py-8 min-w-[320px] bg-white overflow-y-auto md:border-r md:border-gray-200 ${
                  showDetails ? "flex-1 max-w-[60%]" : "w-full"
                }`}
                style={{ maxHeight: "70vh", minWidth: 0 }}
              >
                {/* Task Title */}
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="text"
                    name="name"
                    value={form.name || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter task name..."
                    className="text-3xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full"
                  />
                </div>

                {/* Action Bar */}
                <div className="relative">
                  <ActionBar
                    assignees={assigneesHook.assignees}
                    dueDate={form.dueDate}
                    attachments={form.attachments}
                    checklist={form.checklist}
                    showDueDateSection={showDueDateSection}
                    showAttachmentsSection={showAttachmentsSection}
                    showChecklistSection={showChecklistSection}
                    onMembersClick={() => setOpenDropdown("members")}
                    onShowDueDateSection={() => setShowDueDateSection(true)}
                    onShowAttachmentsSection={() => setShowAttachmentsSection(true)}
                    onShowChecklistSection={() => setShowChecklistSection(true)}
                  />

                  {/* Members Dropdown */}
                  {openDropdown === "members" && (
                    <MembersDropdown
                      users={users}
                      assignedUsers={assigneesHook.assignedUsers}
                      filteredUnassignedUsers={assigneesHook.filteredUnassignedUsers}
                      memberSearch={assigneesHook.memberSearch}
                      onMemberSearchChange={assigneesHook.setMemberSearch}
                      onAddAssignee={assigneesHook.addAssignee}
                      onRemoveAssignee={assigneesHook.removeAssignee}
                      onClose={() => setOpenDropdown(null)}
                    />
                  )}
                </div>

                {/* Assigned Members Section */}
                <AssigneesSection
                  assignedUsers={assigneesHook.assignedUsers}
                  onRemoveAssignee={assigneesHook.removeAssignee}
                />

                {/* Due Date Section */}
                {(form.dueDate || showDueDateSection) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold">Due Date</label>
                      {form.dueDate && (
                        <button
                          type="button"
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => setForm((prev) => ({ ...prev, dueDate: "" }))}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div
                        className="border rounded px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                      >
                        <span className={form.dueDate ? "text-gray-900" : "text-gray-500"}>
                          {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : "Click to set due date"}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      {showDatePicker && (
                        <div
                          ref={datePickerRef}
                          className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-lg shadow-lg p-4"
                        >
                          <input
                            type="date"
                            name="dueDate"
                            value={form.dueDate || ""}
                            onChange={(e) => {
                              setForm((prev) => ({ ...prev, dueDate: e.target.value }));
                              setShowDatePicker(false);
                            }}
                            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Attachments Section */}
                {((form.attachments && form.attachments.length > 0) || showAttachmentsSection) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold">Attachments</label>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={handleAddAttachment}
                      >
                        + Add attachment
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed,application/octet-stream"
                      />
                    </div>
                    {form.attachments && form.attachments.length > 0 ? (
                      <ul className="space-y-2">
                        {(form.attachments || []).map((att: LocalTaskAttachment, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            {att.file && att.file.type.startsWith("image") ? (
                              <img src={att.url} alt="preview" className="w-10 h-10 object-cover rounded" />
                            ) : null}
                            <input type="text" value={att.url} readOnly className="border rounded px-2 py-1 flex-1" />
                            <button
                              type="button"
                              className="text-gray-400 hover:text-red-500"
                              onClick={() => handleRemoveAttachment(idx)}
                            >
                              &#10005;
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400 text-sm italic">
                        No attachments yet. Click &quot;Add attachment&quot; to upload.
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Add a more detailed description..."
                    className="border rounded px-3 py-2 w-full min-h-[80px] focus:ring-2 focus:ring-blue-200"
                    rows={4}
                  />
                </div>

                {/* Checklist Section */}
                {((form.checklist && form.checklist.length > 0) || showChecklistSection) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold">Checklist</label>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={handleAddChecklistItem}
                      >
                        + Add item
                      </button>
                    </div>
                    {form.checklist && form.checklist.length > 0 ? (
                      <div className="space-y-2">
                        {(form.checklist || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                            <input
                              type="checkbox"
                              checked={!!item.checked}
                              onChange={(e) => handleChecklistItemCheck(idx, e.target.checked)}
                              className="mt-0"
                            />
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => handleChecklistItemChange(idx, e.target.value)}
                              className="border rounded px-2 py-1 flex-1 bg-white"
                              placeholder="Checklist item"
                            />
                            <button
                              type="button"
                              className="text-gray-400 hover:text-red-500"
                              onClick={() => handleRemoveChecklistItem(idx)}
                            >
                              &#10005;
                            </button>
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-1">
                          {form.checklist.filter((i) => i.checked).length} of {form.checklist.length} completed
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm italic">
                        No checklist items yet. Click &quot;Add item&quot; to get started.
                      </div>
                    )}
                  </div>
                )}

                {/* Timer Section - Only show if user is assigned */}
                {initialValues?.assignees?.includes(session?.user?.id || "") && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold">Time Tracking</label>
                    </div>
                    <div className="border rounded p-3 bg-gray-50">
                      <Timer
                        projectId={projectId}
                        taskId={initialValues?._id}
                        taskName={form.name}
                        compact={false}
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Task Time Logs History */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold">Time History</label>
                  </div>
                  <div className="border rounded p-3 bg-gray-50">
                    {initialValues?._id && form.name && (
                      <TaskTimeLogs
                        taskId={initialValues._id}
                        taskName={form.name}
                        className="text-sm"
                        onTaskUpdate={onTaskUpdate}
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1" />
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </form>

              {/* Right: Activity log/comments */}
              {showDetails && (
                <div
                  className="md:w-[380px] flex flex-col p-0 overflow-y-auto min-h-[70vh] max-h-[70vh] bg-gray-50 border-l border-gray-200"
                  style={{ minWidth: 320 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-700" />
                      <span className="font-semibold text-gray-800 text-md">Comments and activity</span>
                    </div>
                    <button
                      className="ml-2 px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium flex items-center gap-1"
                      onClick={() => setShowDetails(false)}
                      type="button"
                    >
                      <EyeSlashIcon className="w-4 h-4" /> Hide details
                    </button>
                  </div>
                  {/* Comment input */}
                  <div className="px-6 pt-4 pb-2 border-b border-gray-200 bg-white">
                    <textarea
                      className="w-full border rounded px-3 py-2 mb-2 resize-none focus:ring-2 focus:ring-blue-200"
                      rows={2}
                      placeholder="Write a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                      className="bg-blue-600 text-white px-4 py-1 rounded font-semibold disabled:bg-gray-300 disabled:text-gray-500"
                      disabled={!comment.trim() || commentLoading}
                      type="button"
                      onClick={handleAddComment}
                    >
                      {commentLoading ? "Saving..." : "Comment"}
                    </button>
                  </div>
                  {/* Activity list */}
                  <ul className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
                    {activity.length === 0 && <li className="text-gray-400 text-sm">No activity yet.</li>}
                    {activity.map((item, idx) => {
                      const isComment = item._type === "comment" && "text" in item;
                      const isActivity = item._type === "activity" && "message" in item;
                      return (
                        <li key={idx} className="flex gap-3 items-start border-b border-gray-100 pb-4 last:border-b-0">
                          <Avatar
                            src={users.find((u) => u._id === item.user)?.image}
                            alt={users.find((u) => u._id === item.user)?.name || "?"}
                            size="sm"
                          />
                          <div>
                            <span className="font-bold text-gray-900">
                              {users.find((u) => u._id === item.user)?.name || "Unknown User"}
                            </span>
                            {isComment ? (
                              <span className="ml-1 text-gray-700">commented:</span>
                            ) : isActivity ? (
                              <span className="ml-1 text-gray-700">{item.message}</span>
                            ) : null}
                            <div>
                              <a href="#" className="text-xs text-blue-600 hover:underline">
                                {new Date(item.createdAt).toLocaleString()}
                              </a>
                            </div>
                            {isComment && (
                              <div className="mt-1 bg-white rounded-lg p-3 shadow-sm">
                                <p className="text-gray-700 text-sm">{item.text}</p>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {!showDetails && (
                <button
                  className="absolute top-6 right-8 px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium flex items-center gap-1 z-50 bg-white"
                  onClick={() => setShowDetails(true)}
                  type="button"
                >
                  <EyeIcon className="w-4 h-4" /> Show details
                </button>
              )}
            </div>
          </div>
        </TimerProviderWithCallbacks>
      </TimerProvider>
    </div>
  );
};

export default TaskModal;
