"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getTasks, getProjects } from "@/utils/api";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import KanbanBoard from "@/components/ui/KanbanBoard";
import { Project, TaskWithDetails } from "@/types";
import {
  ViewColumnsIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function EmployeeKanbanPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const [tasksRes, projectsRes] = await Promise.all([getTasks(`?assigneeId=${session.user.id}`), getProjects()]);

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

  // Filter tasks by selected project
  const filteredTasks = useMemo(() => {
    if (!selectedProjectId) return tasks;
    return tasks.filter((task) => {
      const pid =
        typeof task.projectId === "object" && task.projectId !== null && "_id" in task.projectId
          ? task.projectId._id
          : task.projectId;
      return pid === selectedProjectId;
    });
  }, [tasks, selectedProjectId]);

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

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Kanban Board</h1>
            <p className="text-gray-600 mt-2">
              Drag and drop tasks to update their status and visualize your workflow progress
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
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
                <ViewColumnsIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-end">
              <button
                onClick={() => setSelectedProjectId(null)}
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
            <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
          </div>

          <KanbanBoard
            tasks={filteredTasks}
            projectMap={projectMap}
            onTaskUpdate={handleTaskUpdate}
            loading={loading}
          />
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
