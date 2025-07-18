"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Notification } from "@/types/notification";
import { User } from "@/types";
import { getUsers } from "@/utils/api";
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

const NOTIF_TYPES = ["info", "success", "warning", "error"] as const;
type NotifType = (typeof NOTIF_TYPES)[number];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [type, setType] = useState<NotifType>("info");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotifType | "all">("all");
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data || []);
  };

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    fetchNotifications();
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    fetchNotifications();
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: userId, message, type }),
    });
    setMessage("");
    setUserId("");
    setType("info");
    setSending(false);
    fetchNotifications();
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
    const matchesUser = userFilter === "all" || n.user === userFilter;
    const matchesSearch = n.message.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesRead && matchesUser && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <BellIcon className="w-4 h-4 text-blue-500" />;
      case "success":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case "warning":
        return <InboxIcon className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <BellIcon className="w-4 h-4 text-red-500" />;
      default:
        return <BellIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Manage and send notifications to team members</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="all">All Users</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
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
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading notifications...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((n) => (
                    <div
                      key={n._id}
                      className={`p-4 rounded-lg border ${
                        n.read ? "bg-gray-50 border-gray-200" : "bg-white border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="mt-1">{getTypeIcon(n.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(n.type)}`}>
                                {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                              </span>
                              {!n.read && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  Unread
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900 mb-2">{n.message}</p>
                            <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!n.read && (
                            <button
                              onClick={() => markAsRead(n._id)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Mark as read"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n._id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete notification"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

              <form onSubmit={sendNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as NotifType)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {NOTIF_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Enter notification message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
