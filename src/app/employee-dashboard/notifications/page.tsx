"use client";

import { useEffect, useState, useMemo } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { Notification } from "@/types/notification";
import {
  MagnifyingGlassIcon,
  BellIcon,
  CheckCircleIcon,
  InboxIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

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
    const read = notifications.filter((n) => n.read).length;
    return { unread, total, recent, read };
  }, [notifications]);

  // Filtered notifications
  const filtered = notifications.filter((n) => {
    const matchesType = typeFilter === "all" || n.type === typeFilter;
    const matchesRead = readFilter === "all" || (readFilter === "read" ? n.read : !n.read);
    const matchesSearch = n.message.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesRead && matchesSearch;
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
    <EmployeeDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notifications</h1>
            <p className="text-gray-600 mt-2">View and manage your notifications</p>
          </div>
        </div>

        {/* Stats Cards */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
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
                    <p className="text-sm font-medium text-gray-600">Read</p>
                    <p className="text-2xl font-bold text-green-600">{stats.read}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BellIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent (7d)</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.recent}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <h2 className="text-xl font-semibold text-gray-900">Your Notifications</h2>
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
      </div>
    </EmployeeDashboardLayout>
  );
}
