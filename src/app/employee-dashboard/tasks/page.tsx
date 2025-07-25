"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getTasks, getProjects } from "@/utils/api";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { cn } from "@/lib/utils";
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Project, Task } from "@/types";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksDueToday: number;
  tasksDueThisWeek: number;
  averageCompletionTime: number;
  statusDistribution: { status: string; count: number }[];
}

export default function EmployeeTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    tasksDueToday: 0,
    tasksDueThisWeek: 0,
    averageCompletionTime: 0,
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const [tasksRes, projectsRes] = await Promise.all([getTasks(`?assigneeId=${session.user.id}`), getProjects()]);

        const tasksData = tasksRes.data || [];
        const projectsData = projectsRes.data || [];

        setTasks(tasksData);
        setProjects(projectsData);
        calculateStats(tasksData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTasks([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const calculateStats = (tasksData: Task[]) => {
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter((task) => task.status === "completed").length;
    const inProgressTasks = tasksData.filter(
      (task) => task.status === "in-progress" || task.status === "active"
    ).length;
    const overdueTasks = tasksData.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== "completed";
    }).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const today = new Date();
    const tasksDueToday = tasksData.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate.toDateString() === today.toDateString();
    }).length;

    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tasksDueThisWeek = tasksData.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= weekFromNow;
    }).length;

    // Status distribution
    const statusCounts = tasksData.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1).replace("-", " "),
      count,
    }));

    setStats({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      tasksDueToday,
      tasksDueThisWeek,
      averageCompletionTime: 0, // Would need historical data
      statusDistribution,
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesProject = projectFilter === "all" || task.projectId === projectFilter;

      const matchesDueDate = (() => {
        if (dueDateFilter === "all") return true;
        if (!task.dueDate) return dueDateFilter === "no-due-date";

        const today = new Date();
        const taskDate = new Date(task.dueDate);
        const diffDays = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        switch (dueDateFilter) {
          case "overdue":
            return diffDays < 0;
          case "today":
            return diffDays === 0;
          case "this-week":
            return diffDays >= 0 && diffDays <= 7;
          case "next-week":
            return diffDays > 7 && diffDays <= 14;
          case "this-month":
            return diffDays >= 0 && diffDays <= 30;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesProject && matchesDueDate;
    });
  }, [tasks, searchTerm, statusFilter, projectFilter, dueDateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "paused":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "todo":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "done":
        return "bg-green-100 text-green-700 border-green-200";
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "done":
        return <CheckIcon className="w-4 h-4" />;
      case "in-progress":
      case "active":
        return <PlayIcon className="w-4 h-4" />;
      case "paused":
        return <PauseIcon className="w-4 h-4" />;
      case "todo":
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "No Project";
    const project = projects.find((p) => p._id === projectId);
    return project?.name || "Unknown Project";
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

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

  const TaskCard = ({ task }: { task: Task }) => {
    const projectName = getProjectName(task.projectId);
    const overdue = isOverdue(task.dueDate);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <ClipboardDocumentListIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {task.name}
              </h3>
              {task.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                getStatusColor(task.status)
              )}
            >
              {getStatusIcon(task.status)}
              <span className="ml-1">
                {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
              </span>
            </span>
          </div>
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{projectName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UserGroupIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{task.assignees.length} assignees</span>
          </div>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="mb-4">
            <div className="flex items-center text-sm">
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              <span className={cn("font-medium", overdue ? "text-red-600" : "text-gray-700")}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
                {overdue && <span className="ml-2 text-red-600">(Overdue)</span>}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar for In Progress Tasks */}
        {(task.status === "in-progress" || task.status === "active") && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">Created: {new Date(task.createdAt).toLocaleDateString()}</div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </button>
            <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <PencilIcon className="w-4 h-4 mr-1" />
              Update
            </button>
            {task.status !== "completed" && (
              <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
                <CheckIcon className="w-4 h-4 mr-1" />
                Complete
              </button>
            )}
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
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-2">Manage and track your assigned tasks</p>
          </div>
          <Button variant="primary" onClick={() => router.push("/employee-dashboard/tasks/kanban")}>
            Kanban Board
          </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {[...Array(2)].map((_, i) => (
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
                  subtitle="All assigned tasks"
                />
                <StatCard
                  title="Completed"
                  value={stats.completedTasks}
                  icon={<CheckCircleIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  subtitle={`${stats.completionRate.toFixed(1)}% completion rate`}
                  trend={stats.completionRate > 70 ? "up" : "down"}
                  trendValue={`${stats.completionRate.toFixed(1)}%`}
                />
                <StatCard
                  title="In Progress"
                  value={stats.inProgressTasks}
                  icon={<PlayIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  subtitle="Active tasks"
                />
                <StatCard
                  title="Overdue"
                  value={stats.overdueTasks}
                  icon={<ExclamationTriangleIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-red-500 to-red-600"
                  subtitle="Past due date"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <StatCard
                  title="Due Today"
                  value={stats.tasksDueToday}
                  icon={<CalendarDaysIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                  subtitle="Tasks due today"
                />
                <StatCard
                  title="Due This Week"
                  value={stats.tasksDueThisWeek}
                  icon={<ClockIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                  subtitle="Tasks due in 7 days"
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
                Search Tasks
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by task name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="done">Done</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  id="project"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <select
                  id="dueDate"
                  value={dueDateFilter}
                  onChange={(e) => setDueDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Due Dates</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                  <option value="this-week">Due This Week</option>
                  <option value="next-week">Due Next Week</option>
                  <option value="this-month">Due This Month</option>
                  <option value="no-due-date">No Due Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Tasks ({filteredTasks.length})</h2>
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
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className={cn("gap-6", viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2" : "space-y-4")}>
              {filteredTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
