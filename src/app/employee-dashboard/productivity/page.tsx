"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getProjects } from "@/utils/api";
import type { Project } from "@/types";

const EmployeeProductivityPage = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProjects();
        // Filter projects to only show those where the employee is a member
        const userProjects = (res.data || []).filter(
          (project: Project) => project.members?.includes(session?.user?.id || "") || false
        );
        setProjects(userProjects);
      } catch (err) {
        setError("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    if (session?.user?.id) {
      fetchProjects();
    }
  }, [session?.user?.id]);

  const handleSelectProject = (projectId: string) => {
    router.push(`/employee-dashboard/productivity/board/${projectId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <h1 className="text-2xl font-bold mb-4">Select a Project Board</h1>
      {loading ? (
        <div className="text-gray-400">Loading projects...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-gray-400">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => handleSelectProject(project._id)}
              className="bg-white rounded shadow p-6 text-left hover:bg-blue-50 transition border border-gray-200 cursor-pointer w-full"
            >
              <div className="text-lg font-semibold mb-2">{project.name}</div>
              <div className="text-sm text-gray-500">{project.description || "No description"}</div>
              <div className="mt-2 text-xs text-gray-400">ID: {project._id}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeProductivityPage;
