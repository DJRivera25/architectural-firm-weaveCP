"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getTasks, getProjects, getTaskComments, addTaskComment, updateTask } from "@/utils/api";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import ProjectNav from "@/components/ui/employee-tasks/ProjectNav";
import TaskList from "@/components/ui/employee-tasks/TaskList";
import TaskDetailsModal from "@/components/ui/employee-tasks/TaskDetailsModal";
import { Project, TaskWithDetails } from "@/types";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface Comment {
  user: string | { _id: string; name: string };
  text: string;
  createdAt: string;
}

export default function EmployeeTasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const [tasksRes, projectsRes] = await Promise.all([getTasks(`?assigneeId=${session.user.id}`), getProjects()]);
        const projectMap: Record<string, Project> = {};
        projectsRes.data.forEach((p: Project) => (projectMap[p._id] = p));
        const mappedTasks: TaskWithDetails[] = tasksRes.data.map((t) => ({
          ...t,
          projectId: projectMap[t.projectId] ? projectMap[t.projectId] : t.projectId,
          assignees: t.assignees,
        }));
        setTasks(mappedTasks);
        setProjects(projectsRes.data);
      } catch {
        setTasks([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const projectTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      const pid =
        typeof t.projectId === "object" && t.projectId !== null && "_id" in t.projectId ? t.projectId._id : t.projectId;
      if (typeof pid === "string") counts[pid] = (counts[pid] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  const projectNavData = projects.map((p) => ({ ...p, taskCount: projectTaskCounts[p._id] || 0 }));
  const projectMap = useMemo(() => {
    const map: Record<string, Project> = {};
    projects.forEach((p) => (map[p._id] = p));
    return map;
  }, [projects]);

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const pid =
      typeof task.projectId === "object" && task.projectId !== null && "_id" in task.projectId
        ? task.projectId._id
        : task.projectId;
    const projectMatch = !selectedProjectId || pid === selectedProjectId;
    const dueDateMatch = (() => {
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
    const searchMatch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return statusMatch && projectMatch && dueDateMatch && searchMatch;
  });

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "active" || t.status === "in-progress").length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed"
    ).length;
    return { total, completed, inProgress, overdue };
  }, [tasks]);

  const handleView = async (task: TaskWithDetails) => {
    setSelectedTask(task);
    setShowModal(true);
    setModalLoading(true);
    try {
      const res = await getTaskComments(task._id);
      setComments(res.data);
    } catch {
      setComments([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleComplete = async (task: TaskWithDetails) => {
    setModalLoading(true);
    try {
      await updateTask(task._id, { status: "completed" });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: "completed" } : t)));
      if (selectedTask && selectedTask._id === task._id) setSelectedTask({ ...task, status: "completed" });
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      await addTaskComment(selectedTask._id, { text: commentText });
      const res = await getTaskComments(selectedTask._id);
      setComments(res.data);
      setCommentText("");
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr_260px] gap-8 bg-white rounded-2xl shadow-xl p-6 mt-8 animate-fadeInSlow">
        {/* Left Sidebar: Project Nav & Quick Filters */}
        <aside className="hidden md:block">
          <ProjectNav projects={projectNavData} selectedProjectId={selectedProjectId} onSelect={setSelectedProjectId} />
          <div className="mt-6 space-y-2">
            <button
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                dueDateFilter === "overdue" ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-red-50"
              }`}
              onClick={() => setDueDateFilter("overdue")}
            >
              Overdue Tasks
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                dueDateFilter === "today" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-blue-50"
              }`}
              onClick={() => setDueDateFilter("today")}
            >
              Due Today
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                dueDateFilter === "all" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setDueDateFilter("all")}
            >
              All Tasks
            </button>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex flex-col gap-6">
          {/* Header & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
              <p className="text-gray-600 mt-1">Track and manage your assigned tasks</p>
            </div>
            <div className="flex gap-2">
              <a
                href="/employee-dashboard/tasks/kanban"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Kanban View
              </a>
            </div>
          </div>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ClipboardIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">In Progress</p>
                <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Overdue</p>
                <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                showFilters ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <select
                className="border rounded px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
              <select
                className="border rounded px-3 py-2 text-sm"
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
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
          )}
          {/* Task List */}
          <section className="flex-1">
            {loading ? (
              <div className="text-center text-blue-600 py-12 text-xl font-semibold animate-pulse">
                Loading tasks...
              </div>
            ) : (
              <TaskList tasks={filteredTasks} onView={handleView} onComplete={handleComplete} projectMap={projectMap} />
            )}
          </section>
        </main>
        {/* Right Sidebar: Upcoming Deadlines & Quick Actions */}
        <aside className="hidden md:block">
          <div className="bg-gray-50 rounded-xl shadow p-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Upcoming Deadlines</h2>
            <ul className="text-sm text-gray-700 space-y-2">
              {tasks
                .filter((t) => t.dueDate && t.status !== "completed")
                .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
                .slice(0, 3)
                .map((t) => (
                  <li key={t._id} className="flex flex-col gap-0.5">
                    <span className="font-semibold text-blue-700 truncate">{t.name}</span>
                    <span className="text-xs text-gray-500">
                      Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}
                    </span>
                  </li>
                ))}
              {tasks.filter((t) => t.dueDate && t.status !== "completed").length === 0 && (
                <li className="text-gray-400">No upcoming deadlines</li>
              )}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl shadow p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h2>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="text-gray-400">(Coming soon)</li>
            </ul>
          </div>
        </aside>
        {/* Task Details Modal */}
        <TaskDetailsModal
          open={showModal}
          onClose={() => setShowModal(false)}
          task={selectedTask}
          comments={comments}
          commentText={commentText}
          onCommentTextChange={setCommentText}
          onAddComment={handleAddComment}
          onMarkComplete={() => selectedTask && handleComplete(selectedTask)}
          loading={modalLoading}
          commentLoading={commentLoading}
        />
      </div>
    </EmployeeDashboardLayout>
  );
}
