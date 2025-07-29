"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ChartBarIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { TimeCalendar } from "@/components/ui/TimeCalendar";
import { getProject } from "@/utils/api";
import type { Project } from "@/types";

interface CalendarPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ params }) => {
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.projectId;
  const { data: session } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProject(projectId);
        setProject(response.data);
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleBackToTimeTracking = () => {
    router.push(`/dashboard/productivity/clockify/${projectId}`);
  };

  const handleGoToSummary = () => {
    router.push(`/dashboard/productivity/clockify/${projectId}/summary`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Project not found</h1>
            <button
              onClick={() => router.push("/dashboard/productivity")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToTimeTracking}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Time Tracking</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGoToSummary}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Summary View</span>
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <CalendarIcon className="w-5 h-5" />
              <span>Time Tracking Calendar</span>
            </div>
          </div>
        </div>

        {/* Calendar Dashboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <TimeCalendar projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
