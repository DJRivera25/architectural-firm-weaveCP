import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { XMarkIcon, UserIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { getUsers, getProjects, getTeams, createNotification } from "@/utils/api";
import type { User, Project } from "@/types";
import type { NotificationType } from "@/types/notification";

interface SendNotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SendNotificationModal({ open, onClose, onSuccess }: SendNotificationModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("info");
  const [recipientType, setRecipientType] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      getUsers().then((res) =>
        setUsers(
          Array.isArray(res.data)
            ? res.data.map((user) => ({
                ...user,
                createdAt: user.createdAt ? String(user.createdAt) : "",
                updatedAt: user.updatedAt ? String(user.updatedAt) : "",
              }))
            : []
        )
      );
      getProjects().then((res) =>
        setProjects(
          Array.isArray(res.data)
            ? res.data.map((project) => ({
                ...project,
                createdAt: project.createdAt ? String(project.createdAt) : "",
                updatedAt: project.updatedAt ? String(project.updatedAt) : "",
              }))
            : []
        )
      );
      getTeams().then((res) =>
        setTeams(
          Array.isArray(res.data)
            ? res.data.map((team) => ({
                _id: team._id ? String(team._id) : "",
                name: team.name || "",
              }))
            : []
        )
      );
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      let recipients: string[] = [];
      let project = "";
      let team = "";
      if (recipientType === "all") {
        recipients = users.map((u) => u._id);
      } else if (recipientType === "user") {
        recipients = selectedUsers;
      } else if (recipientType === "project") {
        project = selectedProject;
      } else if (recipientType === "team") {
        team = selectedTeam;
      }
      await createNotification({
        subject,
        message,
        type,
        recipients,
        project: project || undefined,
        team: team || undefined,
      });
      setSuccess(true);
      setSubject("");
      setMessage("");
      setType("info");
      setRecipientType("all");
      setSelectedUsers([]);
      setSelectedProject("");
      setSelectedTeam("");
      onSuccess?.();
      setTimeout(() => setSuccess(false), 2000);
      onClose();
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        setError((err as { response?: { data?: { message?: string } } }).response!.data!.message!);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("Failed to send notification.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-blue-100/80 relative overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-blue-100/60 bg-gradient-to-r from-blue-50/80 via-white/80 to-indigo-50/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <UserIcon className="w-7 h-7 text-blue-700" />
            <span className="text-lg md:text-xl font-bold tracking-tight text-blue-900 font-archivo">
              Send Notification
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
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            disabled={loading}
          />
          <Textarea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            disabled={loading}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
            <Select value={type} onChange={(e) => setType(e.target.value as NotificationType)} disabled={loading}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
            <Select value={recipientType} onChange={(e) => setRecipientType(e.target.value)} disabled={loading}>
              <option value="all">All Users</option>
              <option value="user">Specific Users</option>
              <option value="project">By Project</option>
              <option value="team">By Team</option>
            </Select>
          </div>
          {recipientType === "user" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Users</label>
              <select
                multiple
                value={selectedUsers}
                onChange={(e) =>
                  setSelectedUsers(
                    Array.from(
                      e.target.selectedOptions as HTMLCollectionOf<HTMLOptionElement>,
                      (option) => option.value
                    )
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                disabled={loading}
              >
                {users.map((u) => (
                  <option key={u._id as string} value={u._id as string}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}
          {recipientType === "project" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
              <Select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={loading}>
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id as string} value={p._id as string}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {recipientType === "team" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Team</label>
              <Select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} disabled={loading}>
                <option value="">Select Team</option>
                {teams.map((t) => (
                  <option key={t._id as string} value={t._id as string}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {error && <div className="text-red-600 text-sm font-semibold mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm font-semibold mt-2">Notification sent successfully!</div>}
          {/* Sticky Footer */}
          <div className="sticky bottom-0 left-0 bg-white/95 pt-2 pb-2 z-20 flex gap-2 justify-end border-t border-blue-100 rounded-b-2xl px-6 backdrop-blur-xl shadow-sm">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !subject || !message}>
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block align-middle"></span>
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </Dialog>
  );
}
