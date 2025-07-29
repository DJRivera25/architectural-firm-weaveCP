"use client";
import { useEffect, useState, useMemo } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { cn } from "@/lib/utils";
import { TimeLogData, Project, Task } from "@/types";
import {
  ClockIcon,
  PlusIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface TimeLogStats {
  totalHours: number;
  thisWeekHours: number;
  lastWeekHours: number;
  thisMonthHours: number;
  overtimeHours: number;
  averageDailyHours: number;
  totalEntries: number;
  currentStreak: number;
  productivityScore: number;
  weeklyTrend: "up" | "down";
  monthlyTrend: "up" | "down";
}

export default function EmployeeTimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState<(TimeLogData & { _id: string; project?: Project; task?: Task })[]>([]);
  const [stats, setStats] = useState<TimeLogStats>({
    totalHours: 0,
    thisWeekHours: 0,
    lastWeekHours: 0,
    thisMonthHours: 0,
    overtimeHours: 0,
    averageDailyHours: 0,
    totalEntries: 0,
    currentStreak: 0,
    productivityScore: 0,
    weeklyTrend: "up",
    monthlyTrend: "up",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("week");
  const [projectFilter, setProjectFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  const fetchTimeLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/timelogs");
      if (res.ok) {
        const data = await res.json();
        setTimeLogs(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error("Error fetching time logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logs: (TimeLogData & { _id: string; project?: Project; task?: Task })[]) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeekLogs = logs.filter((log) => new Date(log.startTime) >= weekStart);
    const lastWeekLogs = logs.filter((log) => {
      const logDate = new Date(log.startTime);
      return logDate >= lastWeekStart && logDate < weekStart;
    });
    const thisMonthLogs = logs.filter((log) => new Date(log.startTime) >= monthStart);

    const totalHours = logs.reduce((sum, log) => sum + (log.duration || 0) / 3600, 0);
    const thisWeekHours = thisWeekLogs.reduce((sum, log) => sum + (log.duration || 0) / 3600, 0);
    const lastWeekHours = lastWeekLogs.reduce((sum, log) => sum + (log.duration || 0) / 3600, 0);
    const thisMonthHours = thisMonthLogs.reduce((sum, log) => sum + (log.duration || 0) / 3600, 0);
    const overtimeHours = logs.reduce((sum, log) => {
      const hours = (log.duration || 0) / 3600;
      return sum + Math.max(0, hours - 8); // Overtime is hours beyond 8 per day
    }, 0);
    const averageDailyHours = logs.length > 0 ? totalHours / logs.length : 0;

    // Calculate current streak (consecutive days with time logs)
    let currentStreak = 0;
    const sortedLogs = logs.map((log) => new Date(log.startTime)).sort((a, b) => b.getTime() - a.getTime());

    if (sortedLogs.length > 0) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const hasLog = sortedLogs.some((log) => {
          const logDate = new Date(log);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === currentDate.getTime();
        });

        if (hasLog) {
          currentStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const productivityScore = Math.min(100, (thisWeekHours / 40) * 100);
    const weeklyTrend = thisWeekHours > lastWeekHours ? "up" : "down";
    const monthlyTrend = thisMonthHours > lastWeekHours * 4 ? "up" : "down";

    setStats({
      totalHours,
      thisWeekHours,
      lastWeekHours,
      thisMonthHours,
      overtimeHours,
      averageDailyHours,
      totalEntries: logs.length,
      currentStreak,
      productivityScore,
      weeklyTrend,
      monthlyTrend,
    });
  };

  const filteredLogs = useMemo(() => {
    let logs = [...timeLogs];
    const now = new Date();

    if (dateFilter === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      logs = logs.filter((log) => new Date(log.startTime) >= weekStart);
    } else if (dateFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      logs = logs.filter((log) => new Date(log.startTime) >= monthStart);
    }

    if (projectFilter !== "all") {
      logs = logs.filter((log) => log.project?._id === projectFilter);
    }

    if (searchTerm) {
      logs = logs.filter(
        (log) =>
          log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.task?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return logs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [timeLogs, dateFilter, projectFilter, searchTerm]);

  const StatCard = ({
    title,
    value,
    icon,
    trend,
    trendValue,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: "up" | "down";
    trendValue?: string;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {trend === "up" ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>{icon}</div>
      </div>
    </div>
  );

  const TimeLogCard = ({ log }: { log: TimeLogData & { _id: string; project?: Project; task?: Task } }) => {
    const isOvertime = (log.duration || 0) / 3600 > 8;
    const isToday = new Date(log.startTime).toDateString() === new Date().toDateString();

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {new Date(log.startTime).toLocaleDateString()}
                {isToday && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Today</span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {log.startTime ? new Date(log.startTime).toLocaleTimeString() : "No start time"} -
                {log.endTime ? new Date(log.endTime).toLocaleTimeString() : "No end time"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                isOvertime ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"
              )}
            >
              {isOvertime ? (
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              ) : (
                <CheckIcon className="w-4 h-4 mr-1" />
              )}
              {isOvertime ? "Overtime" : "Regular"}
            </span>
          </div>
        </div>

        {/* Time Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{(log.duration || 0).toFixed(2)} hours</span>
          </div>
          {isOvertime && (
            <div className="flex items-center text-sm text-red-600">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              <span className="truncate">{(log.duration || 0).toFixed(2)} overtime</span>
            </div>
          )}
        </div>

        {/* Project and Task */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{log.project?.name || "No Project"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{log.task?.name || "No Task"}</span>
          </div>
        </div>

        {/* Notes */}
        {log.description && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{log.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">Logged: {new Date(log.startTime).toLocaleDateString()}</div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              <PlayIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
              <PauseIcon className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-gray-600 mt-2">Track your work hours and productivity</p>
          </div>
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Time Log
          </button>
        </div>

        {/* Stats Cards */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <LoadingSkeleton key={i} height={120} />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {[...Array(4)].map((_, i) => (
                  <LoadingSkeleton key={i} height={120} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="This Week"
                  value={`${stats.thisWeekHours.toFixed(1)}h`}
                  icon={<ClockIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  subtitle="Weekly total"
                  trend={stats.weeklyTrend}
                  trendValue={`vs ${stats.lastWeekHours.toFixed(1)}h last week`}
                />
                <StatCard
                  title="This Month"
                  value={`${stats.thisMonthHours.toFixed(1)}h`}
                  icon={<CalendarDaysIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  subtitle="Monthly total"
                  trend={stats.monthlyTrend}
                  trendValue={`${stats.thisMonthHours.toFixed(1)}h total`}
                />
                <StatCard
                  title="Overtime"
                  value={`${stats.overtimeHours.toFixed(1)}h`}
                  icon={<ExclamationTriangleIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-red-500 to-red-600"
                  subtitle="Extra hours"
                />
                <StatCard
                  title="Productivity"
                  value={`${stats.productivityScore.toFixed(0)}%`}
                  icon={<ChartBarIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  subtitle="Weekly efficiency"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <StatCard
                  title="Total Hours"
                  value={`${stats.totalHours.toFixed(1)}h`}
                  icon={<ClockIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                  subtitle="All time"
                />
                <StatCard
                  title="Daily Average"
                  value={`${stats.averageDailyHours.toFixed(1)}h`}
                  icon={<UserIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  subtitle="Per day"
                />
                <StatCard
                  title="Current Streak"
                  value={`${stats.currentStreak} days`}
                  icon={<CalendarIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                  subtitle="Consecutive days"
                />
                <StatCard
                  title="Total Entries"
                  value={stats.totalEntries}
                  icon={<DocumentTextIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-pink-500 to-pink-600"
                  subtitle="Time log entries"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Time Logs
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by notes, project, or task..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div>
                <label htmlFor="projectFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  id="projectFilter"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {Array.from(new Set(timeLogs.map((log) => log.project?._id).filter(Boolean))).map((projectId) => {
                    const project = timeLogs.find((log) => log.project?._id === projectId)?.project;
                    return (
                      <option key={projectId} value={projectId}>
                        {project?.name || "Unknown Project"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Time Logs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Time Log History ({filteredLogs.length})</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time logs found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className={cn("gap-6", viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2" : "space-y-4")}>
              {filteredLogs.map((log) => (
                <TimeLogCard key={log._id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
