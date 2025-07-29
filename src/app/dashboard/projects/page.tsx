"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ProjectForm from "./ProjectForm";
import { deleteProject } from "@/utils/api";
import Swal from "sweetalert2";
import type { Project } from "@/types";

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  averageProgress: number;
  recentProjects: number;
  overdueProjects: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    totalBudget: 0,
    averageProgress: 0,
    recentProjects: 0,
    overdueProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectFormMode, setProjectFormMode] = useState<"add" | "edit" | "view">("add");
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();

      setProjects(
        Array.isArray(data)
          ? data.map((project) => ({
              ...project,
              createdAt: project.createdAt ? String(project.createdAt) : "",
              updatedAt: project.updatedAt ? String(project.updatedAt) : "",
            }))
          : []
      );
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectData: Project[]) => {
    const activeProjects = projectData.filter((p) => p.status === "active").length;
    const completedProjects = projectData.filter((p) => p.status === "completed").length;
    const onHoldProjects = projectData.filter((p) => p.status === "on-hold").length;
    const totalBudget = projectData.reduce((sum, p) => sum + (p.budget || 0), 0);
    // Remove progress, teamSize, tasksCount, completedTasksCount from stats
    const averageProgress = 0; // No longer calculated here
    const recentProjects = projectData.filter((p) => {
      const createdDate = new Date(p.createdAt || "");
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate > thirtyDaysAgo;
    }).length;
    const overdueProjects = projectData.filter((p) => {
      if (!p.endDate || p.status === "completed") return false;
      return new Date(p.endDate || "") < new Date();
    }).length;

    setStats({
      totalProjects: projectData.length,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalBudget,
      averageProgress,
      recentProjects,
      overdueProjects,
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesClient = clientFilter === "all" || project.client === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const uniqueClients = [...new Set(projects.map((p) => p.client).filter(Boolean))];

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

  const openProjectForm = (mode: "add" | "edit" | "view", project?: Project) => {
    setProjectFormMode(mode);
    setSelectedProject(mode === "add" ? undefined : project);
    setProjectFormOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This project will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      await deleteProject(projectId);
      fetchProjects();
      Swal.fire("Deleted!", "The project has been deleted.", "success");
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-700 border-green-200";
        case "completed":
          return "bg-blue-100 text-blue-700 border-blue-200";
        case "on-hold":
          return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "cancelled":
          return "bg-red-100 text-red-700 border-red-200";
        default:
          return "bg-gray-100 text-gray-500 border-gray-200";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "active":
          return <CheckCircleIcon className="w-4 h-4" />;
        case "completed":
          return <CheckCircleIcon className="w-4 h-4" />;
        case "on-hold":
          return <ClockIcon className="w-4 h-4" />;
        case "cancelled":
          return <ExclamationTriangleIcon className="w-4 h-4" />;
        default:
          return <ClockIcon className="w-4 h-4" />;
      }
    };

    const isOverdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== "completed";

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <FolderIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              {project.client && (
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                  {project.client}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                getStatusColor(project.status || "active")
              )}
            >
              {getStatusIcon(project.status || "active")}
              <span className="ml-1 capitalize">{project.status || "active"}</span>
            </span>
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                Overdue
              </span>
            )}
          </div>
        </div>

        {project.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>}

        {/* Progress Bar - now N/A */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">N/A</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `0%` }}></div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <UserGroupIcon className="w-4 h-4 mr-2" />
            <span>{project.members ? project.members.length : 0} members</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            <span>N/A tasks</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
            <span>${(project.budget || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDaysIcon className="w-4 h-4 mr-2" />
            <span>{project.endDate ? new Date(project.endDate || "").toLocaleDateString() : "No deadline"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">Created: {new Date(project.createdAt || "").toLocaleDateString()}</div>
          <div className="flex items-center space-x-2">
            <button
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              onClick={() => openProjectForm("view", project)}
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={() => openProjectForm("edit", project)}
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              onClick={() => handleDeleteProject(project._id)}
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-2">Manage and track all your architectural projects</p>
          </div>
          <button
            onClick={() => openProjectForm("add")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Project
          </button>
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
                  title="Total Projects"
                  value={stats.totalProjects}
                  icon={<FolderIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  subtitle="All projects"
                />
                <StatCard
                  title="Active Projects"
                  value={stats.activeProjects}
                  icon={<CheckCircleIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  subtitle={`${
                    stats.activeProjects > 0 ? ((stats.activeProjects / stats.totalProjects) * 100).toFixed(1) : 0
                  }% of total`}
                  trend={stats.activeProjects > 0 ? "up" : "down"}
                  trendValue={`${stats.activeProjects} active`}
                />
                <StatCard
                  title="Total Budget"
                  value={`$${stats.totalBudget.toLocaleString()}`}
                  icon={<CurrencyDollarIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  subtitle="Combined budget"
                />
                <StatCard
                  title="Average Progress"
                  value={`${stats.averageProgress.toFixed(1)}%`}
                  icon={<ArrowUpIcon className="w-6 h-6" />}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  subtitle="Overall completion"
                  trend={stats.averageProgress > 50 ? "up" : "down"}
                  trendValue={`${stats.averageProgress.toFixed(1)}%`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Projects
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, client, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Client
              </label>
              <select
                id="client"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Clients</option>
                {uniqueClients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Projects ({filteredProjects.length})</h2>
            <div className="text-sm text-gray-500">Last updated: {lastUpdated ? lastUpdated : ""}</div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="loading">
                <LoadingSkeleton height={200} />
              </motion.div>
            ) : filteredProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                key="no-projects"
              >
                <div className="text-center py-12">
                  <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria, or create a new project.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                key="projects"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Project Create Modal */}
        <ProjectForm
          open={projectFormOpen}
          mode={projectFormMode}
          initialValues={selectedProject}
          onClose={() => setProjectFormOpen(false)}
          onSuccess={fetchProjects}
        />
      </div>
    </DashboardLayout>
  );
}
