"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { getTasks, getProjects } from "@/utils/api";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import KanbanBoard from "@/components/ui/KanbanBoard";
import { Project, TaskWithDetails } from "@/types";

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

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Kanban Board</h1>
            <p className="text-gray-600">
              Drag and drop tasks to update their status. Visualize your workflow progress.
            </p>
          </div>

          <div className="lg:w-64">
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
