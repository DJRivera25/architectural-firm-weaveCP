"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getTimeLogs, getUsers, getProjects, getTasks } from "@/utils/api";
import { TimeLogData, Project, Task } from "@/types";
import { IUser } from "@/models/User";
import {
  ClockIcon,
  UserGroupIcon,
  ClockIcon as ClockSolidIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  BuildingOfficeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
interface TimeLogWithDetails extends TimeLogData {
  _id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  project?: {
    _id: string;
    name: string;
  };
  task?: {
    _id: string;
    name: string;
  };
}

interface TimeStats {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  averageHoursPerDay: number;
  totalEntries: number;
  activeUsers: number;
  projectsWithTime: number;
  overtimePercentage: number;
}

export default function TimeTrackingPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLogWithDetails[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy] = useState<"date" | "user" | "hours" | "overtime">("date");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "analytics">("table");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timeLogsRes, usersRes, projectsRes, tasksRes] = await Promise.all([
        getTimeLogs(),
        getUsers(),
        getProjects(),
        getTasks(),
      ]);

      // Map time logs with user, project, and task details
      type TimeLogApiResponse = TimeLogData & { _id: string; projectId?: string; taskId?: string };
      const mappedTimeLogs: TimeLogWithDetails[] = (timeLogsRes.data as unknown as TimeLogApiResponse[]).map((log) => ({
        _id: log._id,
        userId: log.userId,
        projectId: log.projectId,
        taskId: log.taskId,
        date: log.date,
        timeIn: log.timeIn,
        timeOut: log.timeOut,
        totalHours: log.totalHours,
        regularHours: log.regularHours,
        overtimeHours: log.overtimeHours,
        overtimeReason: log.overtimeReason,
        notes: log.notes,
        user: usersRes.data.find((u: IUser) => u._id === log.userId),
        project: projectsRes.data.find((p: Project) => p._id === log.projectId),
        task: tasksRes.data.find((t: Task) => t._id === log.taskId),
      }));

      setTimeLogs(mappedTimeLogs);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error("Error fetching time tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimeLogs = useMemo(() => {
    let filtered = timeLogs;

    // Filter by user
    if (selectedUser !== "all") {
      filtered = filtered.filter((log) => log.userId === selectedUser);
    }

    // Filter by project
    if (selectedProject !== "all") {
      filtered = filtered.filter((log) => log.projectId === selectedProject);
    }

    // Filter by date range
    const now = new Date();
    const getDateRange = () => {
      switch (selectedDateRange) {
        case "today":
          return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
        case "week":
          const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
          return { start: weekStart };
        case "month":
          return { start: new Date(now.getFullYear(), now.getMonth(), 1) };
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          return { start: new Date(now.getFullYear(), quarter * 3, 1) };
        default:
          return { start: new Date(0) };
      }
    };

    const { start } = getDateRange();
    filtered = filtered.filter((log) => new Date(log.date) >= start);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.task?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "user":
          comparison = (a.user?.name || "").localeCompare(b.user?.name || "");
          break;
        case "hours":
          comparison = (a.totalHours || 0) - (b.totalHours || 0);
          break;
        case "overtime":
          comparison = (a.overtimeHours || 0) - (b.overtimeHours || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [timeLogs, selectedUser, selectedProject, selectedDateRange, searchTerm, sortBy, sortOrder]);

  const timeStats = useMemo((): TimeStats => {
    const totalHours = filteredTimeLogs.reduce((sum, log) => sum + (log.totalHours || 0), 0);
    const regularHours = filteredTimeLogs.reduce((sum, log) => sum + (log.regularHours || 0), 0);
    const overtimeHours = filteredTimeLogs.reduce((sum, log) => sum + (log.overtimeHours || 0), 0);
    const totalEntries = filteredTimeLogs.length;
    const uniqueUsers = new Set(filteredTimeLogs.map((log) => log.userId)).size;
    const uniqueProjects = new Set(filteredTimeLogs.map((log) => log.projectId).filter(Boolean)).size;
    const averageHoursPerDay = totalEntries > 0 ? totalHours / totalEntries : 0;
    const overtimePercentage = totalHours > 0 ? (overtimeHours / totalHours) * 100 : 0;
    return {
      totalHours,
      regularHours,
      overtimeHours,
      averageHoursPerDay,
      totalEntries,
      activeUsers: uniqueUsers,
      projectsWithTime: uniqueProjects,
      overtimePercentage,
    };
  }, [filteredTimeLogs]);

  const userStats = useMemo(() => {
    const userMap = new Map<string, { hours: number; overtime: number; entries: number }>();

    filteredTimeLogs.forEach((log) => {
      const userId = log.userId;
      const current = userMap.get(userId) || { hours: 0, overtime: 0, entries: 0 };
      current.hours += log.totalHours || 0;
      current.overtime += log.overtimeHours || 0;
      current.entries += 1;
      userMap.set(userId, current);
    });

    return Array.from(userMap.entries())
      .map(([userId, stats]) => {
        const user = users.find((u) => u._id === userId);
        return {
          user,
          ...stats,
        };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [filteredTimeLogs, users]);

  const projectStats = useMemo(() => {
    const projectMap = new Map<string, { hours: number; users: Set<string>; entries: number }>();

    filteredTimeLogs.forEach((log) => {
      if (log.projectId) {
        const current = projectMap.get(log.projectId) || { hours: 0, users: new Set(), entries: 0 };
        current.hours += log.totalHours || 0;
        current.users.add(log.userId);
        current.entries += 1;
        projectMap.set(log.projectId, current);
      }
    });

    return Array.from(projectMap.entries())
      .map(([projectId, stats]) => {
        const project = projects.find((p) => p._id === projectId);
        return {
          project,
          hours: stats.hours,
          userCount: stats.users.size,
          entries: stats.entries,
        };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [filteredTimeLogs, projects]);

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const getStatusColor = (hours: number) => {
    if (hours > 10) return "text-red-600 bg-red-100";
    if (hours > 8) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  return (
    <DashboardLayout>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSkeleton height={200} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
                  <p className="text-gray-600 mt-1">Monitor team productivity, overtime, and project time allocation</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === "calendar" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode("analytics")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === "analytics"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Analytics
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Hours</p>
                      <p className="text-2xl font-bold text-gray-900">{formatHours(timeStats.totalHours)}</p>
                    </div>
                    <ClockSolidIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-green-600">Regular: {formatHours(timeStats.regularHours)}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-orange-600">Overtime: {formatHours(timeStats.overtimeHours)}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{timeStats.activeUsers}</p>
                    </div>
                    <UserGroupIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Tracking time this period</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Projects with Time</p>
                      <p className="text-2xl font-bold text-gray-900">{timeStats.projectsWithTime}</p>
                    </div>
                    <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">With time logged</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overtime Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{timeStats.overtimePercentage.toFixed(1)}%</p>
                    </div>
                    <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Of total hours</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search time logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Projects</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedDateRange}
                      onChange={(e) => setSelectedDateRange(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Content based on view mode */}
              {viewMode === "table" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Task
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hours
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Overtime
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTimeLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{log.user?.name}</div>
                                  <div className="text-sm text-gray-500">{log.user?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(log.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100">
                                {log.project?.name || "No Project"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{log.task?.name || "No Task"}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{formatHours(log.totalHours || 0)}</td>
                            <td className="px-6 py-4">
                              {log.overtimeHours && log.overtimeHours > 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  {formatHours(log.overtimeHours)}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  log.totalHours || 0
                                )}`}
                              >
                                {log.totalHours && log.totalHours > 8 ? "Overtime" : "Normal"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-800">
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredTimeLogs.length === 0 && (
                    <div className="text-center py-12">
                      <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No time logs found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || selectedUser !== "all" || selectedProject !== "all"
                          ? "Try adjusting your search or filters."
                          : "No time tracking data available for this period."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {viewMode === "analytics" && (
                <div className="space-y-6">
                  {/* User Performance */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Performance</h3>
                    <div className="space-y-4">
                      {userStats.slice(0, 5).map((stat) => (
                        <div
                          key={stat.user?._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{stat.user?.name}</p>
                              <p className="text-sm text-gray-500">{stat.entries} entries</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatHours(stat.hours)}</p>
                            <p className="text-sm text-orange-600">{formatHours(stat.overtime)} overtime</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Time Allocation */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Time Allocation</h3>
                    <div className="space-y-4">
                      {projectStats.slice(0, 5).map((stat) => (
                        <div
                          key={stat.project?._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{stat.project?.name}</p>
                              <p className="text-sm text-gray-500">
                                {stat.userCount} users, {stat.entries} entries
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatHours(stat.hours)}</p>
                            <p className="text-sm text-gray-500">
                              {timeStats.totalHours > 0
                                ? ((stat.hours / timeStats.totalHours) * 100).toFixed(1)
                                : "0.0"}
                              %
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {viewMode === "calendar" && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar View</h3>
                  <p className="text-gray-500">Calendar view coming soon...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
