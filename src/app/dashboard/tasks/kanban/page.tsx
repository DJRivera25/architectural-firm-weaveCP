"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getTasks, getProjects, getUsers } from "@/utils/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard from "@/components/ui/KanbanBoard";
import { Project, TaskWithDetails, User } from "@/types";
import { useRouter } from "next/navigation";

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
        }
        const mappedUsers: User[] = (usersRes.data as IUser[]).map((u) => ({
          _id: typeof u._id === "string" ? u._id : u._id?.toString?.() ?? "",
          name: u.name ?? "",
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Kanban Board</h1>
            <p className="text-gray-600">Monitor and manage all team tasks with drag-and-drop functionality.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:w-96">
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Project</label>
              <select
                value={selectedProjectId || ""}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Employee</label>
              <select
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <KanbanBoard
            tasks={filteredTasks}
            projectMap={projectMap}
            onTaskUpdate={handleTaskUpdate}
            loading={loading}
          />
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTasks.filter((t) => t.status === "todo").length}
            </div>
            <div className="text-sm text-blue-700">To Do</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredTasks.filter((t) => t.status === "in-progress").length}
            </div>
            <div className="text-sm text-yellow-700">In Progress</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredTasks.filter((t) => t.status === "done").length}
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-600">{filteredTasks.length}</div>
            <div className="text-sm text-gray-700">Total Tasks</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push("/dashboard/tasks/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Task
          </button>
          <button
            onClick={() => router.push("/dashboard/tasks")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            List View
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
