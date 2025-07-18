"use client";
import { useState, useEffect, useCallback } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  ClockIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  CalendarIcon,
  PlayIcon,
  CheckIcon,
  DocumentTextIcon,
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
  currentStreak: number;
  monthlyHours: number;
  overtimeHours: number;
  upcomingDeadlines: number;
}

interface RecentActivity {
  id: string;
  type: "task" | "time" | "leave";
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "approved" | "rejected";
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
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
    currentStreak: 0,
    monthlyHours: 0,
    overtimeHours: 0,
    upcomingDeadlines: 0,
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

      // Calculate monthly hours
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyHours = userTimeLogs
        .filter((log: TimeLogData) => new Date(log.date) >= monthStart)
        .reduce((sum: number, log: TimeLogData) => sum + (log.totalHours || 0), 0);

      // Calculate overtime hours
      const overtimeHours = userTimeLogs.reduce((sum: number, log: TimeLogData) => sum + (log.overtimeHours || 0), 0);

      // Calculate upcoming deadlines
      const upcomingDeadlines = userTasks.filter((task: Task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7 && task.status !== "completed";
      }).length;

      // Calculate current streak (consecutive days with time logs)
      let currentStreak = 0;
      const sortedLogs = userTimeLogs.map((log) => new Date(log.date)).sort((a, b) => b.getTime() - a.getTime());

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
        currentStreak,
        monthlyHours,
        overtimeHours,
        upcomingDeadlines,
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
          icon: task.status === "completed" ? <CheckIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />,
          color: task.status === "completed" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600",
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
          icon: leave.status === "approved" ? <CheckIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />,
          color: leave.status === "approved" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600",
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

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
        case "approved":
          return "text-green-600 bg-green-100 border-green-200";
        case "pending":
          return "text-yellow-600 bg-yellow-100 border-yellow-200";
        case "rejected":
          return "text-red-600 bg-red-100 border-red-200";
        default:
          return "text-gray-600 bg-gray-100 border-gray-200";
      }
    };

    return (
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200">
        <div className={cn("p-2 rounded-lg", activity.color)}>{activity.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
          <p className="text-xs text-gray-500">{activity.description}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(activity.timestamp).toLocaleDateString()}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
            getStatusColor(activity.status)
          )}
        >
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </span>
      </div>
    );
  };

  const QuickActionCard = ({ action }: { action: QuickAction }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className={cn("p-3 rounded-lg", action.color)}>{action.icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {action.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
        </div>
      </div>
    </div>
  );

  const quickActions: QuickAction[] = [
    {
      title: "Clock In/Out",
      description: "Record your work hours",
      icon: <ClockIcon className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
      href: "/employee-dashboard/timelogs",
    },
    {
      title: "View Tasks",
      description: "Check your assigned tasks",
      icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
      color: "bg-green-100 text-green-600",
      href: "/employee-dashboard/tasks",
    },
    {
      title: "Request Leave",
      description: "Submit leave application",
      icon: <CalendarDaysIcon className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600",
      href: "/employee-dashboard/leaves",
    },
    {
      title: "Team Calendar",
      description: "View team schedule",
      icon: <CalendarIcon className="w-6 h-6" />,
      color: "bg-orange-100 text-orange-600",
      href: "/employee-dashboard/calendar",
    },
  ];

  if (isLoading) {
    return (
      <EmployeeDashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </EmployeeDashboardLayout>
    );
  }

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name}!</h1>
              <p className="text-blue-100 mt-2">Here&apos;s what&apos;s happening with your work today</p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-blue-100 text-sm">Current Time</p>
                <p className="text-2xl font-bold">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            subtitle={`${stats.completedTasks} completed`}
          />
          <StatCard
            title="Task Completion"
            value={`${stats.taskCompletionRate.toFixed(1)}%`}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtitle="Completion rate"
            trend={stats.taskCompletionRate > 70 ? "up" : "down"}
            trendValue={`${stats.taskCompletionRate.toFixed(1)}%`}
          />
          <StatCard
            title="This Week Hours"
            value={`${stats.thisWeekHours.toFixed(1)}h`}
            icon={<ClockIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            subtitle="Weekly total"
            trend={stats.thisWeekHours > stats.lastWeekHours ? "up" : "down"}
            trendValue={`vs ${stats.lastWeekHours.toFixed(1)}h last week`}
          />
          <StatCard
            title="Productivity Score"
            value={`${stats.productivityScore.toFixed(0)}%`}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle="Overall performance"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            icon={<CalendarDaysIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-red-500 to-red-600"
            subtitle="Consecutive work days"
          />
          <StatCard
            title="Monthly Hours"
            value={`${stats.monthlyHours.toFixed(1)}h`}
            icon={<ClockIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            subtitle="This month"
          />
          <StatCard
            title="Overtime Hours"
            value={`${stats.overtimeHours.toFixed(1)}h`}
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            subtitle="Extra hours worked"
          />
          <StatCard
            title="Upcoming Deadlines"
            value={stats.upcomingDeadlines}
            icon={<CalendarIcon className="w-6 h-6" />}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            subtitle="Due this week"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} action={action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-500">Your recent activities will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Requests</span>
                <span className="text-lg font-semibold text-yellow-600">{stats.pendingLeaves}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approved Leaves</span>
                <span className="text-lg font-semibold text-green-600">{stats.approvedLeaves}</span>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Request Leave
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Daily Hours</span>
                <span className="text-lg font-semibold text-blue-600">{stats.averageHours.toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Hours This Month</span>
                <span className="text-lg font-semibold text-green-600">{stats.monthlyHours.toFixed(1)}h</span>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Clock In/Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
