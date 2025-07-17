"use client";

import { useEffect, useState, useMemo } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { Notification } from "@/types/notification";
import { MagnifyingGlassIcon, BellIcon, CheckCircleIcon, InboxIcon } from "@heroicons/react/24/outline";

const NOTIF_TYPES = ["info", "success", "warning", "error"] as const;

type NotifType = (typeof NOTIF_TYPES)[number];

export default function EmployeeNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotifType | "all">("all");
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
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

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    fetchNotifications();
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
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
    const matchesSearch = n.message.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesRead && matchesSearch;
  });

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Notifications</h2>
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
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Unread</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!n.read && (
                      <button onClick={() => markAsRead(n._id)} className="text-xs text-blue-600 hover:underline">
                        Mark as read
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n._id)} className="text-xs text-red-500 hover:underline">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
