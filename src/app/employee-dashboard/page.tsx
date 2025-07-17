"use client";

import { useState, useEffect, useCallback } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { useSession } from "next-auth/react";
import {
  ClockIcon,
  CalendarDaysIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { getTasks, getTimeLogs, getLeaves } from "@/utils/api";
import { Task, TimeLogData, LeaveWithUser } from "@/types";

interface EmployeeStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalHours: number;
  averageHours: number;
  pendingLeaves: number;
  approvedLeaves: number;
  taskCompletionRate: number;
  productivityScore: number;
  thisWeekHours: number;
  lastWeekHours: number;
}

interface RecentActivity {
  id: string;
  type: "task" | "time" | "leave";
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "approved" | "rejected";
}

export default function EmployeeDashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<EmployeeStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalHours: 0,
    averageHours: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    taskCompletionRate: 0,
    productivityScore: 0,
    thisWeekHours: 0,
    lastWeekHours: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [tasksRes, timeLogsRes, leavesRes] = await Promise.all([getTasks(), getTimeLogs(), getLeaves()]);

      const tasks = tasksRes.data || [];
      const timeLogs = timeLogsRes.data || [];
      const leaves = leavesRes.data || [];

      // Filter data for current user
      const userId = session?.user?.id;
      if (!userId) return;

      const userTasks = tasks.filter((task: Task) => task.assignees.includes(userId));
      const userTimeLogs = timeLogs.filter((log: TimeLogData) => log.userId === userId);
      const userLeaves = leaves.filter((leave: LeaveWithUser) => leave.userId === userId);

      // Calculate stats
      const completedTasks = userTasks.filter((task: Task) => task.status === "completed").length;
      const pendingTasks = userTasks.filter(
        (task: Task) => task.status === "todo" || task.status === "in-progress"
      ).length;
      const totalHours = userTimeLogs.reduce((sum: number, log: TimeLogData) => sum + (log.totalHours || 0), 0);
      const averageHours = userTimeLogs.length > 0 ? totalHours / userTimeLogs.length : 0;
      const pendingLeaves = userLeaves.filter((leave: LeaveWithUser) => leave.status === "pending").length;
      const approvedLeaves = userLeaves.filter((leave: LeaveWithUser) => leave.status === "approved").length;
      const taskCompletionRate = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;
      const productivityScore = Math.min(100, (taskCompletionRate + (averageHours / 8) * 50) / 2);

      // Calculate weekly hours
      const now = new Date();
      const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

      const thisWeekHours = userTimeLogs
        .filter((log: TimeLogData) => new Date(log.date) >= thisWeekStart)
        .reduce((sum: number, log: TimeLogData) => sum + (log.totalHours || 0), 0);

      const lastWeekHours = userTimeLogs
        .filter((log: TimeLogData) => {
          const logDate = new Date(log.date);
          return logDate >= lastWeekStart && logDate < thisWeekStart;
        })
        .reduce((sum: number, log: TimeLogData) => sum + (log.totalHours || 0), 0);

      setStats({
        totalTasks: userTasks.length,
        completedTasks,
        pendingTasks,
        totalHours,
        averageHours,
        pendingLeaves,
        approvedLeaves,
        taskCompletionRate,
        productivityScore,
        thisWeekHours,
        lastWeekHours,
      });

      // Generate recent activities
      const activities: RecentActivity[] = [];

      // Add recent tasks
      userTasks.slice(0, 3).forEach((task: Task) => {
        activities.push({
          id: task._id,
          type: "task",
          title: task.name,
          description: `Task ${task.status === "completed" ? "completed" : "updated"}`,
          timestamp: task.updatedAt,
          status: task.status === "completed" ? "completed" : "pending",
        });
      });

      // Add recent leaves
      userLeaves.slice(0, 2).forEach((leave: LeaveWithUser) => {
        activities.push({
          id: leave._id,
          type: "leave",
          title: `${leave.leaveType} Leave`,
          description: `Leave request ${leave.status}`,
          timestamp: leave.updatedAt,
          status: leave.status as "completed" | "pending" | "approved" | "rejected",
        });
      });

      // Sort by timestamp and take top 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [session, status, fetchDashboardData]);

  const StatCard = ({
    title,
    value,
    icon,
    trend,
    trendValue,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: "up" | "down";
    trendValue?: string;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {trend === "up" ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
        case "approved":
          return "text-green-600 bg-green-100";
        case "pending":
          return "text-yellow-600 bg-yellow-100";
        case "rejected":
          return "text-red-600 bg-red-100";
        default:
          return "text-gray-600 bg-gray-100";
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case "task":
          return <ClipboardIcon className="w-5 h-5" />;
        case "leave":
          return <CalendarDaysIcon className="w-5 h-5" />;
        case "time":
          return <ClockIcon className="w-5 h-5" />;
        default:
          return <ClipboardIcon className="w-5 h-5" />;
      }
    };

    return (
      <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            {getTypeIcon(activity.type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
          <p className="text-sm text-gray-500">{activity.description}</p>
        </div>
        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              activity.status
            )}`}
          >
            {activity.status}
          </span>
        </div>
        <div className="flex-shrink-0 text-xs text-gray-400">{new Date(activity.timestamp).toLocaleDateString()}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <EmployeeDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  const hoursTrend = stats.thisWeekHours > stats.lastWeekHours ? "up" : "down";
  const hoursTrendValue = `${Math.abs(stats.thisWeekHours - stats.lastWeekHours).toFixed(1)}h`;

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name}!</h1>
              <p className="text-gray-600 mt-2">Here&apos;s your personal dashboard overview</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="My Tasks"
            value={stats.totalTasks}
            icon={<ClipboardIcon className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.taskCompletionRate.toFixed(1)}%`}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
            trend="up"
            trendValue="+3.1%"
            color="bg-green-50"
          />
          <StatCard
            title="This Week"
            value={`${stats.thisWeekHours.toFixed(1)}h`}
            icon={<ClockIcon className="w-6 h-6 text-purple-600" />}
            trend={hoursTrend}
            trendValue={hoursTrendValue}
            color="bg-purple-50"
          />
          <StatCard
            title="Productivity"
            value={`${stats.productivityScore.toFixed(1)}%`}
            icon={<UserIcon className="w-6 h-6 text-orange-600" />}
            trend="up"
            trendValue="+1.8%"
            color="bg-orange-50"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-green-600">{stats.completedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.taskCompletionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Hours</span>
                <span className="text-sm font-medium text-blue-600">{stats.totalHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average/Day</span>
                <span className="text-sm font-medium text-green-600">{stats.averageHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="text-sm font-medium text-purple-600">{stats.thisWeekHours.toFixed(1)}h</span>
              </div>
            </div>
          </div>

          {/* Leave Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingLeaves}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="text-sm font-medium text-green-600">{stats.approvedLeaves}</span>
              </div>
              {stats.pendingLeaves > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    You have {stats.pendingLeaves} pending leave request{stats.pendingLeaves !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => (window.location.href = "/employee-dashboard/tasks")}
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <ClipboardIcon className="w-6 h-6 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-900">View Tasks</span>
            </button>
            <button
              onClick={() => (window.location.href = "/employee-dashboard/leaves")}
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <CalendarDaysIcon className="w-6 h-6 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-900">Request Leave</span>
            </button>
            <button
              onClick={() => (window.location.href = "/employee-dashboard/timelogs")}
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <ClockIcon className="w-6 h-6 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-purple-900">Log Time</span>
            </button>
            <button
              onClick={() => (window.location.href = "/employee-dashboard/profile")}
              className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <UserIcon className="w-6 h-6 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-orange-900">My Profile</span>
            </button>
          </div>
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
