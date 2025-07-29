"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import KanbanBoard from "../../KanbanBoard";
import { getProjects } from "@/utils/api";
import type { Project } from "@/types";

const BoardPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await getProjects();
        const found = (res.data || []).find((p: Project) => p._id === projectId) || null;
        setProject(found);
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  // Background style: project photo or blue gradient
  const backgroundStyle = project?.photo
    ? {
        backgroundImage: `url(${project.photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {
        background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
      };

  const handleClockifyClick = () => {
    router.push(`/dashboard/productivity/clockify/${projectId}`);
  };

  return (
    <div className="min-h-screen flex flex-col " style={backgroundStyle}>
      <div className="flex mx-auto text-white px-6 py-4 ">
        <h1 className="text-xl font-bold">{loading ? "Loading..." : project ? project.name : "Project Board"}</h1>
        <div></div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 p-6 rounded-t-xl">
        <KanbanBoard projectId={projectId} />
      </div>
      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full shadow-lg px-6 py-3 font-bold text-lg hover:bg-blue-700 transition"
        onClick={handleClockifyClick}
      >
        Switch to Clockify View
      </button>
    </div>
  );
};

export default BoardPage;
