"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ClockIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  UserIcon,
  ChartBarIcon,
  PlayIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { getTasks, getTimeLogs, getLeaves, getUsers } from "@/utils/api";
import { useState, useEffect } from "react";
import { Task, TimeLogData, LeaveWithUser } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

// Add RecentActivity type
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

// Add QuickAction type
interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
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
      const totalHours = timeLogs.reduce((sum: number, log: TimeLogData) => sum + (log.duration || 0) / 3600, 0);
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
      tasks.slice(0, 3).forEach((task: Task) => {
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
      leaves.slice(0, 2).forEach((leave: LeaveWithUser) => {
        activities.push({
          id: leave._id,
          type: "leave",
          title: `${leave.user?.name || "Unknown"} - ${leave.leaveType}`,
          description: `Leave request ${leave.status}`,
          timestamp: leave.updatedAt,
          status: leave.status as "completed" | "pending" | "approved" | "rejected",
          icon: leave.status === "approved" ? <CheckIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />,
          color: leave.status === "approved" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600",
        });
      });
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
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
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
        <div className={"p-2 rounded-lg " + activity.color}>{activity.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
          <p className="text-xs text-gray-500">{activity.description}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(activity.timestamp).toLocaleDateString()}</p>
        </div>
        <span
          className={
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border " +
            getStatusColor(activity.status)
          }
        >
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </span>
      </div>
    );
  };

  const QuickActionCard = ({ action }: { action: QuickAction }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className={"p-3 rounded-lg " + action.color}>{action.icon}</div>
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
      title: "Manage Employees",
      description: "View and manage all employees",
      icon: <UserIcon className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
      href: "/dashboard/team",
    },
    {
      title: "View Tasks",
      description: "Check all project tasks",
      icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
      color: "bg-green-100 text-green-600",
      href: "/dashboard/tasks",
    },
    {
      title: "Approve Leaves",
      description: "Review and approve leave requests",
      icon: <CalendarDaysIcon className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600",
      href: "/dashboard/leaves",
    },
    {
      title: "View Reports",
      description: "Analyze productivity and time logs",
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: "bg-orange-100 text-orange-600",
      href: "/dashboard/timetracking",
    },
  ];

  return (
    <DashboardLayout>
      <AnimatePresence mode="wait">
        {isLoading ? (
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
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name}!</h1>
                  <p className="text-blue-100 mt-2">Here&apos;s what&apos;s happening in your organization today</p>
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
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    />
                    <StatCard
                      title="Total Employees"
                      value={stats.totalEmployees}
                      icon={<UserIcon className="w-6 h-6" />}
                      color="bg-gradient-to-br from-orange-500 to-orange-600"
                      subtitle="All employees"
                    />
                    <StatCard
                      title="Pending Leaves"
                      value={stats.pendingLeaves}
                      icon={<CalendarDaysIcon className="w-6 h-6" />}
                      color="bg-gradient-to-br from-purple-500 to-purple-600"
                      subtitle="Awaiting approval"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action) => (
                  <a key={action.title} href={action.href}>
                    <QuickActionCard action={action} />
                  </a>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No recent activity found.</div>
                ) : (
                  recentActivities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
