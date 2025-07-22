"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Notification } from "@/types/notification";
import { User } from "@/types";
import {
  getUsers,
  getNotifications,
  markNotificationRead,
  deleteNotification as apiDeleteNotification,
} from "@/utils/api";
import {
  MagnifyingGlassIcon,
  BellIcon,
  CheckCircleIcon,
  InboxIcon,
  UserIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import SendNotificationModal from "./SendNotificationModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

const NOTIF_TYPES = ["info", "success", "warning", "error"] as const;
type NotifType = (typeof NOTIF_TYPES)[number];

// Add a type for populated notification
interface NotificationWithPopulatedFields extends Notification {
  subject?: string;
  recipients: Array<{ _id: string; name: string; email: string; image?: string }>;
  project?: { _id: string; name: string } | null;
  team?: { _id: string; name: string } | null;
}

function hasPopulatedRecipients(n: unknown): n is NotificationWithPopulatedFields {
  return typeof n === "object" && n !== null && Array.isArray((n as { recipients?: unknown }).recipients);
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationWithPopulatedFields[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotifType | "all">("all");
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await getNotifications();
    setNotifications(Array.isArray(res.data) ? res.data.filter(hasPopulatedRecipients) : []);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(
      Array.isArray(res.data)
        ? res.data.map((user) => ({
            ...user,
            createdAt: user.createdAt ? String(user.createdAt) : "",
            updatedAt: user.updatedAt ? String(user.updatedAt) : "",
          }))
        : []
    );
  };

  const markAsRead = async (id: string, read: boolean) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setToast({ type: "success", message: "Marked as read." });
    } catch (err) {
      setToast({ type: "error", message: "Failed to mark as read." });
    }
  };

  const deleteNotification = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await apiDeleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setToast({ type: "success", message: "Notification deleted." });
    } catch (err) {
      setToast({ type: "error", message: "Failed to delete notification." });
    }
  };

  // Derived stats
  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length;
    const total = notifications.length;
    const recent = notifications.filter((n) => {
      const created = new Date(n.createdAt);
      const now = new Date();
      return (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) < 7;
    }).length;
    const sent = notifications.filter((n) => n.type === "info").length;
    return { unread, total, recent, sent };
  }, [notifications]);

  // Filtered notifications
  const filtered = notifications.filter((n) => {
    const matchesType = typeFilter === "all" || n.type === typeFilter;
    const matchesRead = readFilter === "all" || (readFilter === "read" ? n.read : !n.read);
    const matchesSearch =
      n.subject?.toLowerCase().includes(search.toLowerCase()) ||
      n.message?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesRead && matchesSearch;
  });

  const getTypeBadge = (type: string) => {
    const colorMap: { [key: string]: string } = {
      info: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-bold rounded-full font-archivo ${
          colorMap[type] || "bg-gray-100 text-gray-800"
        }`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getRecipientChips = (recipients: NotificationWithPopulatedFields["recipients"]) => (
    <div className="flex flex-wrap gap-1 mt-1">
      {recipients?.map((r) => (
        <span
          key={r._id}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-100"
        >
          {r.image && <Avatar src={r.image} alt={r.name} size="sm" />}
          {r.name} <span className="text-gray-400">({r.email})</span>
        </span>
      ))}
    </div>
  );

  const getTag = (label: string, color: string) => (
    <span className={`inline-block px-2 py-0.5 rounded bg-${color}-100 text-${color}-800 text-xs font-semibold mr-2`}>
      {label}
    </span>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-lg shadow-lg font-semibold text-white ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Manage and send notifications to team members</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setSendModalOpen(true)}>
              <PaperAirplaneIcon className="w-5 h-5 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <>
              <LoadingSkeleton height={100} />
              <LoadingSkeleton height={100} />
              <LoadingSkeleton height={100} />
              <LoadingSkeleton height={100} />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BellIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <InboxIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent (7d)</p>
                    <p className="text-2xl font-bold text-green-600">{stats.recent}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PaperAirplaneIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sent</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.sent}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Main Content */}
          <main className="space-y-6">
            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FunnelIcon className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as NotifType | "all")}
                >
                  <option value="all">All Types</option>
                  {NOTIF_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={readFilter}
                  onChange={(e) => setReadFilter(e.target.value as "all" | "read" | "unread")}
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
            {/* Notifications List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <BellIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
              </div>
              {loading ? (
                <LoadingSkeleton height={200} />
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications found.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <div className="space-y-4">
                      {filtered.map((n) => (
                        <motion.div
                          key={n._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          whileHover={{ scale: 1.02, boxShadow: "0 4px 24px #e0e7ef" }}
                          className={`transition-all p-5 rounded-2xl border shadow-sm bg-white group hover:shadow-lg hover:border-blue-200 flex flex-col gap-2`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeBadge(n.type)}
                            {n.project && n.project.name && getTag(n.project.name, "indigo")}
                            {n.team && n.team.name && getTag(n.team.name, "blue")}
                            <span className="ml-auto text-xs text-gray-400 font-mono">
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-900 text-base font-archivo truncate max-w-[60%]">
                              {n.subject}
                            </span>
                            {!n.read && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                Unread
                              </span>
                            )}
                          </div>
                          <div className="text-gray-800 whitespace-pre-line text-sm mb-1">{n.message}</div>
                          {n.recipients && n.recipients.length > 0 && getRecipientChips(n.recipients)}
                          <div className="flex gap-2 mt-2">
                            {!n.read && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => markAsRead(n._id, n.read)}
                              >
                                <EyeIcon className="w-4 h-4 mr-1" /> Mark as Read
                              </Button>
                            )}
                            <Button type="button" size="sm" variant="danger" onClick={() => deleteNotification(n._id)}>
                              <TrashIcon className="w-4 h-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </main>
          {/* Right Sidebar: Send Notification */}
          <aside className="w-full max-w-xs">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center mb-6">
                <UserIcon className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Send Notification</h2>
              </div>
              <SendNotificationModal
                open={sendModalOpen}
                onClose={() => setSendModalOpen(false)}
                onSuccess={fetchNotifications}
              />
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
