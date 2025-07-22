"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getTasks, getProjects, getUsers } from "@/utils/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard from "@/components/ui/KanbanBoard";
import { Project, TaskWithDetails, User } from "@/types";
import { useRouter } from "next/navigation";
import {
  ViewColumnsIcon,
  FunnelIcon,
  PlusIcon,
  ListBulletIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function AdminKanbanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("User role:", session?.user?.role);

    // Wait for session to load
    if (status === "loading") {
      console.log("Session still loading...");
      return;
    }

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "manager")) {
      console.log("Access denied - redirecting to dashboard");
      router.replace("/dashboard");
      return;
    }

    console.log("Access granted - loading Kanban data");
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksRes, projectsRes, usersRes] = await Promise.all([
          getTasks(),
          getProjects(),
          getUsers("?role=employee"),
        ]);

        // Map projectId to object for UI
        const projectMap: Record<string, Project> = {};
        projectsRes.data.forEach((p: Project) => (projectMap[p._id] = p));

        const mappedTasks: TaskWithDetails[] = tasksRes.data.map((t) => ({
          ...t,
          projectId: projectMap[t.projectId] ? projectMap[t.projectId] : t.projectId,
          assignees: t.assignees,
        }));

        setTasks(mappedTasks);
        setProjects(projectsRes.data);
        // Map IUser[] to User[] to fix type compatibility
        interface IUser {
          _id: string | { toString: () => string };
          name?: string;
          email?: string;
          role?: string;
          isActive?: boolean;
          image?: string;
          position?: string;
          team?: string;
          createdAt?: string;
        }
        const mappedUsers: User[] = (usersRes.data as unknown as IUser[]).map((u) => ({
          _id: typeof u._id === "string" ? u._id : u._id?.toString?.() ?? "",
          name: u.name ?? "",
          email: u.email ?? "",
          role: u.role,
          isActive: u.isActive,
          image: u.image,
          position: u.position,
          team: u.team,
          createdAt: u.createdAt
            ? typeof u.createdAt === "string"
              ? u.createdAt
              : (u.createdAt as Date).toISOString()
            : undefined,
        }));
        setUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setTasks([]);
        setProjects([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, router, status]);

  // Filter tasks by selected project and user
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (selectedProjectId) {
      filtered = filtered.filter((task) => {
        const pid =
          typeof task.projectId === "object" && task.projectId !== null && "_id" in task.projectId
            ? task.projectId._id
            : task.projectId;
        return pid === selectedProjectId;
      });
    }

    if (selectedUserId) {
      filtered = filtered.filter((task) =>
        task.assignees.some((assignee) =>
          typeof assignee === "string" ? assignee === selectedUserId : assignee._id === selectedUserId
        )
      );
    }

    return filtered;
  }, [tasks, selectedProjectId, selectedUserId]);

  // Project map for Kanban board
  const projectMap = useMemo(() => {
    const map: Record<string, Project> = {};
    projects.forEach((p) => (map[p._id] = p));
    return map;
  }, [projects]);

  const handleTaskUpdate = (taskId: string, updates: Partial<TaskWithDetails>) => {
    setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, ...updates } : task)));
  };

  // Calculate stats
  const stats = useMemo(() => {
    const todo = filteredTasks.filter((t) => t.status === "todo").length;
    const inProgress = filteredTasks.filter((t) => t.status === "in-progress").length;
    const done = filteredTasks.filter((t) => t.status === "done").length;
    const total = filteredTasks.length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { todo, inProgress, done, total, completionRate };
  }, [filteredTasks]);

  // Show loading spinner while session is loading
  if (status === "loading") {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Kanban Board</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all team tasks with drag-and-drop functionality</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => router.push("/dashboard/tasks/create")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Task
            </button>
            <button
              onClick={() => router.push("/dashboard/tasks")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <ListBulletIcon className="w-4 h-4 mr-2" />
              List View
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">To Do</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todo}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ViewColumnsIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.done}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ViewColumnsIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                Filter by Project
              </label>
              <select
                value={selectedProjectId || ""}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                Filter by Employee
              </label>
              <select
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Employees</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setSelectedUserId(null);
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <ViewColumnsIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Kanban Board</h2>
          </div>

          <KanbanBoard
            tasks={filteredTasks}
            projectMap={projectMap}
            onTaskUpdate={handleTaskUpdate}
            loading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
