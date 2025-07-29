import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { motion } from "framer-motion";
import {
  FolderIcon,
  XMarkIcon,
  PaperClipIcon,
  CheckCircleIcon,
  UserGroupIcon,
  UserIcon,
  PlusIcon,
  XMarkIcon as XMarkIconSolid,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { createProject, updateProject, uploadImage, getTeams, getUsers, getUsersByIds } from "@/utils/api";
import type { Project } from "@/types";
import type { ITeam } from "@/models/Team";
import type { IUser } from "@/models/User";

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
    photo: "",
    members: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Member assignment states
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch teams and users
  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        setLoadingTeams(true);
        setLoadingUsers(true);
        try {
          const [teamsResponse, usersResponse] = await Promise.all([getTeams(), getUsers()]);
          setTeams(teamsResponse.data);
          setUsers(usersResponse.data);
        } catch (err) {
          console.error("Error fetching teams/users:", err);
        } finally {
          setLoadingTeams(false);
          setLoadingUsers(false);
        }
      }
    };
    fetchData();
  }, [open]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".member-dropdown-container")) {
        setShowMemberDropdown(false);
      }
    };

    if (showMemberDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMemberDropdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Validate file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      setError("File size must be less than 25MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create local preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setForm((prev) => ({ ...prev, photo: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Member assignment functions
  const addMember = (userId: string) => {
    if (!form.members.includes(userId)) {
      setForm((prev) => ({
        ...prev,
        members: [...prev.members, userId],
      }));
    }
  };

  const removeMember = (userId: string) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((id) => id !== userId),
    }));
  };

  const addTeamMembers = async (teamId: string) => {
    const team = teams.find((t) => String(t._id) === teamId);
    if (team) {
      // Handle both string and ObjectId members
      const teamMemberIds = team.members.map((member) => {
        if (typeof member === "string") return member;
        if (typeof member === "object" && member._id) return String(member._id);
        return String(member);
      });

      const newMembers = [...new Set([...form.members, ...teamMemberIds])];
      setForm((prev) => ({
        ...prev,
        members: newMembers,
      }));
      setSelectedTeam("");

      // Fetch missing users and merge into users state
      const missingIds = teamMemberIds.filter((id) => !users.some((u) => String(u._id) === id));
      if (missingIds.length > 0) {
        try {
          const response = await getUsersByIds(missingIds);
          setUsers((prev) => [...prev, ...response.data]);
        } catch (err) {
          console.error("Failed to fetch some team members:", err);
        }
      }
    }
  };

  const getMemberName = (userId: string) => {
    const user = users.find((u) => String(u._id) === userId);
    return user?.name || "Unknown User";
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find((t) => String(t._id) === teamId);
    return team?.name || "Unknown Team";
  };

  const filteredUsers = users.filter(
    (user) => !form.members.includes(String(user._id)) && user.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(memberSearch.toLowerCase()));

  // Initialize form with initial values
  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        client: initialValues.client || "",
        description: initialValues.description || "",
        status: initialValues.status || "active",
        budget: initialValues.budget?.toString() || "",
        startDate: initialValues.startDate || "",
        endDate: initialValues.endDate || "",
        photo: initialValues.photo || "",
        members: initialValues.members || [],
      });
      if (initialValues.photo) {
        setUploadedImage(initialValues.photo);
      }
    }
  }, [initialValues]);

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
      let photoUrl = form.photo.trim() || undefined;

      // Upload file if selected
      if (selectedFile) {
        setUploading(true);
        try {
          const response = await uploadImage(selectedFile);
          photoUrl = response.data.url;
          setUploadedImage(photoUrl);
        } catch (err) {
          setError("Failed to upload image. Please try again.");
          setSubmitting(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const projectData = {
        name: form.name.trim(),
        client: form.client.trim() || undefined,
        description: form.description.trim() || undefined,
        status: form.status as "active" | "completed" | "on-hold" | "cancelled",
        budget: form.budget ? Number(form.budget) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        photo: photoUrl,
        members: form.members,
      };

      if (isEdit && initialValues?._id) {
        await updateProject(initialValues._id, projectData);
      } else {
        await createProject(projectData);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      let errorMsg = isEdit
        ? "Failed to update project. Please try again."
        : "Failed to create project. Please try again.";
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
      photo: "",
      members: [],
    });
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    setUploading(false);
    setUploadedImage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
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
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Project Photo</label>
            <div className="space-y-3">
              {/* File Upload Button */}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isView || submitting || uploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isView || submitting || uploading}
                  className="flex items-center gap-2"
                >
                  <PaperClipIcon className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Select Image"}
                </Button>
                {(uploadedImage || selectedFile) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveImage}
                    disabled={isView || submitting}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>

              {/* Image Preview */}
              {(previewUrl || uploadedImage || form.photo) && (
                <div className="relative">
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                    <Image
                      src={previewUrl || uploadedImage || form.photo}
                      alt="Project preview"
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {uploadedImage && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircleIcon className="w-4 h-4" />
                    </div>
                  )}
                  {selectedFile && !uploadedImage && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <PaperClipIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )}

              {/* Manual URL Input (fallback) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or enter image URL manually:</label>
                <input
                  type="text"
                  name="photo"
                  value={form.photo}
                  onChange={handleChange}
                  disabled={isView || submitting}
                  className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="https://example.com/photo.jpg (optional)"
                />
              </div>
            </div>
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

          {/* Member Assignment Section */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Project Members</label>

            {/* Team Assignment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Team</label>
              <div className="flex gap-2">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  disabled={isView || submitting || loadingTeams}
                  className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg bg-white font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={String(team._id)} value={String(team._id)}>
                      {team.name} ({team.members.length} members)
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => selectedTeam && addTeamMembers(selectedTeam)}
                  disabled={!selectedTeam || isView || submitting}
                  className="flex items-center gap-2"
                >
                  <UserGroupIcon className="w-4 h-4" />
                  Add Team
                </Button>
              </div>
            </div>

            {/* Individual Member Assignment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Individual Members</label>
              <div className="relative member-dropdown-container">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    onFocus={() => setShowMemberDropdown(true)}
                    disabled={isView || submitting || loadingUsers}
                    className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    disabled={isView || submitting}
                    className="flex items-center gap-2"
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Member Dropdown */}
                {showMemberDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-2 px-2">Available Members</div>
                        {filteredUsers.map((user) => (
                          <button
                            key={String(user._id)}
                            type="button"
                            onClick={() => {
                              addMember(String(user._id));
                              setMemberSearch("");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md flex items-center gap-2"
                          >
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name}
                                width={32}
                                height={32}
                                className="rounded-full border border-blue-200 object-cover w-8 h-8"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border border-blue-200">
                                <UserIcon className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <span className="text-sm">{user.name}</span>
                            {user.position && <span className="text-xs text-gray-500 ml-auto">({user.position})</span>}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {memberSearch ? "No members found" : "No available members"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Members Display */}
            {form.members.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Members ({form.members.length})
                </label>
                <div className="space-y-2">
                  {form.members.map((memberId) => {
                    const user = users.find((u) => String(u._id) === memberId);
                    return (
                      <div
                        key={memberId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          {user?.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={32}
                              height={32}
                              className="rounded-full border border-blue-200 object-cover w-8 h-8"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border border-blue-200">
                              <UserIcon className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm">{user ? user.name : getMemberName(memberId)}</div>
                            <div className="text-xs text-gray-500">{user?.position || "Member"}</div>
                          </div>
                        </div>
                        {!isView && (
                          <button
                            type="button"
                            onClick={() => removeMember(memberId)}
                            className="p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700"
                          >
                            <XMarkIconSolid className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {error && <div className="text-red-600 text-sm font-medium mt-2">{error}</div>}
          {success && (
            <div className="text-green-700 text-sm font-medium flex items-center gap-2 mt-2">
              {isEdit ? "Project updated successfully!" : "Project created successfully!"}
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
