"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  ClipboardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { getTasks, getTimeLogs, getLeaves, getUsers } from "@/utils/api";
import { Task, TimeLogData, LeaveWithUser } from "@/types";

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalEmployees: number;
  activeEmployees: number;
  totalHours: number;
  averageHours: number;
  pendingLeaves: number;
  approvedLeaves: number;
  taskCompletionRate: number;
  productivityScore: number;
}

interface RecentActivity {
  id: string;
  type: "task" | "time" | "leave" | "user";
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "approved" | "rejected";
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    totalHours: 0,
    averageHours: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    taskCompletionRate: 0,
    productivityScore: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role === "employee") {
        router.replace("/employee-dashboard");
      } else {
        fetchDashboardData();
      }
    }
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, timeLogsRes, leavesRes, usersRes] = await Promise.all([
        getTasks(),
        getTimeLogs(),
        getLeaves(),
        getUsers(),
      ]);

      const tasks = tasksRes.data || [];
      const timeLogs = timeLogsRes.data || [];
      const leaves = leavesRes.data || [];
      const users = usersRes.data || [];

      // Calculate stats
      const completedTasks = tasks.filter((task: Task) => task.status === "completed").length;
      const pendingTasks = tasks.filter((task: Task) => task.status === "todo" || task.status === "in-progress").length;
      const totalHours = timeLogs.reduce((sum: number, log: TimeLogData) => sum + (log.totalHours || 0), 0);
      const averageHours = timeLogs.length > 0 ? totalHours / timeLogs.length : 0;
      const pendingLeaves = leaves.filter((leave: LeaveWithUser) => leave.status === "pending").length;
      const approvedLeaves = leaves.filter((leave: LeaveWithUser) => leave.status === "approved").length;
      const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
      const productivityScore = Math.min(100, (taskCompletionRate + (averageHours / 8) * 50) / 2);

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        totalEmployees: users.length,
        activeEmployees: users.length,
        totalHours,
        averageHours,
        pendingLeaves,
        approvedLeaves,
        taskCompletionRate,
        productivityScore,
      });

      // Generate recent activities
      const activities: RecentActivity[] = [];

      // Add recent tasks
      tasks.slice(0, 3).forEach((task: Task) => {
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
      leaves.slice(0, 2).forEach((leave: LeaveWithUser) => {
        activities.push({
          id: leave._id,
          type: "leave",
          title: `${leave.user?.name || "Unknown"} - ${leave.leaveType}`,
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
  };

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
        case "user":
          return <UsersIcon className="w-5 h-5" />;
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
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name}!</h1>
              <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your team today</p>
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
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<ClipboardIcon className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Task Completion"
            value={`${stats.taskCompletionRate.toFixed(1)}%`}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
            trend="up"
            trendValue="+5.2%"
            color="bg-green-50"
          />
          <StatCard
            title="Team Members"
            value={stats.totalEmployees}
            icon={<UsersIcon className="w-6 h-6 text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            title="Productivity Score"
            value={`${stats.productivityScore.toFixed(1)}%`}
            icon={<ChartBarIcon className="w-6 h-6 text-orange-600" />}
            trend="up"
            trendValue="+2.1%"
            color="bg-orange-50"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks Overview</h3>
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
                <span className="text-sm text-gray-600">Active Members</span>
                <span className="text-sm font-medium text-purple-600">{stats.activeEmployees}</span>
              </div>
            </div>
          </div>

          {/* Leave Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Management</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Requests</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingLeaves}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="text-sm font-medium text-green-600">{stats.approvedLeaves}</span>
              </div>
              {stats.pendingLeaves > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">{stats.pendingLeaves} leave requests need attention</span>
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
              onClick={() => router.push("/dashboard/tasks/create")}
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <ClipboardIcon className="w-6 h-6 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-900">Create Task</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/leaves")}
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <CalendarDaysIcon className="w-6 h-6 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-900">Review Leaves</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/team")}
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <UsersIcon className="w-6 h-6 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-purple-900">Manage Team</span>
            </button>
            <button
              onClick={() => router.push("/dashboard/timetracking")}
              className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <ClockIcon className="w-6 h-6 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-orange-900">View Time Logs</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
