"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Notification } from "@/types/notification";
import { User } from "@/types";
import { getUsers } from "@/utils/api";
import { MagnifyingGlassIcon, BellIcon, CheckCircleIcon, InboxIcon, UserIcon } from "@heroicons/react/24/outline";

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
    return { unread, total, recent };
  }, [notifications]);

  // Filtered notifications
  const filtered = notifications.filter((n) => {
    const matchesType = typeFilter === "all" || n.type === typeFilter;
    const matchesRead = readFilter === "all" || (readFilter === "read" ? n.read : !n.read);
    const matchesUser = userFilter === "all" || n.user === userFilter;
    const matchesSearch = n.message.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesRead && matchesUser && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 p-8">
        {/* Main Content */}
        <main className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold mb-2">Notifications</h1>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              <BellIcon className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Unread</p>
                <p className="text-lg font-bold text-blue-700">{stats.unread}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              <InboxIcon className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Recent (7d)</p>
                <p className="text-lg font-bold text-green-700">{stats.recent}</p>
              </div>
            </div>
          </div>
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              className="border rounded px-3 py-2 text-sm"
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
              className="border rounded px-3 py-2 text-sm"
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as "all" | "read" | "unread")}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <select
              className="border rounded px-3 py-2 text-sm"
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
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">All Notifications</h2>
            {loading ? (
              <div className="text-center text-blue-600 py-8">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No notifications found.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filtered.map((n) => (
                  <li key={n._id} className={`flex items-start gap-4 py-4 ${n.read ? "opacity-60" : ""}`}>
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        n.type === "info"
                          ? "bg-blue-400"
                          : n.type === "success"
                          ? "bg-green-500"
                          : n.type === "warning"
                          ? "bg-yellow-400"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{n.message}</div>
                      <div className="text-xs text-gray-500 flex gap-2 items-center">
                        <span>{n.type.charAt(0).toUpperCase() + n.type.slice(1)}</span>
                        <span>•</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                        {!n.read && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!n.read && (
                        <button onClick={() => markAsRead(n._id)} className="text-xs text-blue-600 hover:underline">
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
        {/* Right Sidebar: Send Notification & Analytics */}
        <aside className="w-full max-w-xs">
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" /> Send Notification
            </h2>
            <form onSubmit={sendNotification} className="flex flex-col gap-4">
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="border rounded px-3 py-2"
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotifType)}
                className="border rounded px-3 py-2"
              >
                {NOTIF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Notification message..."
                className="border rounded px-3 py-2 min-h-[60px]"
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-fit self-end"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
          <div className="bg-gray-50 rounded-xl shadow p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Analytics</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Total: {stats.total}</li>
              <li>Unread: {stats.unread}</li>
              <li>Recent: {stats.recent}</li>
            </ul>
            <div className="mt-4 text-xs text-gray-400">More analytics coming soon...</div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
