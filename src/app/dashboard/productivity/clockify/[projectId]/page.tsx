"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getProjects, getTasks, getTimeLogs } from "@/utils/api";
import { updateTimeLog, deleteTimeLog } from "@/utils/api";
import type { Project, Task, TimeLogData } from "@/types";
import { formatTime, formatTimeHuman } from "@/utils/timerUtils";
import { ArrowLeftIcon, PencilIcon, TrashIcon, ChartBarIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Timer } from "@/components/ui/Timer";
import { TaskManualTimeEntry } from "@/components/ui/TaskManualTimeEntry";
import { TimerProvider, TimerProviderWithCallbacks } from "@/components/providers/TimerProvider";

interface EditTimeLogModalProps {
  timeLog: TimeLogData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTimeLog: TimeLogData) => void;
}

const EditTimeLogModal: React.FC<EditTimeLogModalProps> = ({ timeLog, isOpen, onClose, onSave }) => {
  const [description, setDescription] = useState(timeLog.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDescription(timeLog.description);
      setError(null);
    }
  }, [isOpen, timeLog.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const updatedTimeLog = await updateTimeLog(timeLog._id!, {
        description: description.trim(),
      });

      onSave(updatedTimeLog.data);
      onClose();
    } catch (err) {
      setError("Failed to update time log");
      console.error("Error updating time log:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Time Log</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter description..."
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600 mb-2">Time Information (Read-only)</div>
              <div className="space-y-1 text-sm">
                <div>
                  Duration: <span className="font-mono font-semibold">{formatTime(timeLog.duration)}</span>
                </div>
                <div>Start: {new Date(timeLog.startTime).toLocaleString()}</div>
                {timeLog.endTime && <div>End: {new Date(timeLog.endTime).toLocaleString()}</div>}
                <div>
                  Status: <span className="capitalize">{timeLog.status}</span>
                </div>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ClockifyProjectPage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [projectId, setProjectId] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState("all");
  const [editingTimeLog, setEditingTimeLog] = useState<TimeLogData | null>(null);
  const [deletingTimeLogId, setDeletingTimeLogId] = useState<string | null>(null);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    const projectIdFromPath = pathSegments[pathSegments.length - 1];
    setProjectId(projectIdFromPath);
  }, []);

  useEffect(() => {
    if (projectId && session?.user?.id) {
      fetchData();
    }
  }, [projectId, session?.user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsResponse, tasksResponse, timeLogsResponse] = await Promise.all([
        getProjects(),
        getTasks(`?projectId=${projectId}`),
        getTimeLogs(`?projectId=${projectId}`),
      ]);

      const projectData = projectsResponse.data.find((p) => p._id === projectId);
      setProject(projectData || null);

      // Filter tasks assigned to current user
      const userTasks = tasksResponse.data.filter(
        (task: Task) => task.assignees.includes(session?.user?.id || "") && task.isActive !== false
      );
      console.log("Clockify - Fetched tasks:", {
        totalTasks: tasksResponse.data.length,
        userTasks: userTasks.length,
        currentUserId: session?.user?.id,
        sessionStatus: session ? "loaded" : "loading",
        tasks: userTasks.map((t) => ({ id: t._id, name: t.name, assignees: t.assignees, isActive: t.isActive })),
        allTasks: tasksResponse.data.map((t) => ({
          id: t._id,
          name: t.name,
          assignees: t.assignees,
          isActive: t.isActive,
        })),
      });
      setAssignedTasks(userTasks);

      // Sort time logs by latest first
      const sortedTimeLogs = (timeLogsResponse.data || []).sort(
        (a: TimeLogData, b: TimeLogData) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      setTimeLogs(sortedTimeLogs);
    } catch (err) {
      setError("Failed to load project data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeLogCreated = (newTimeLog: TimeLogData) => {
    setTimeLogs((prev) => [newTimeLog, ...prev]);
  };

  const handleTimeLogUpdated = (updatedTimeLog: TimeLogData) => {
    setTimeLogs((prev) => prev.map((log) => (log._id === updatedTimeLog._id ? updatedTimeLog : log)));
  };

  const handleBack = () => router.push(`/dashboard/productivity/board/${projectId}`);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEditTimeLog = (timeLog: TimeLogData) => {
    if (!session?.user) return false;
    return session.user.id === timeLog.userId || session.user.role === "admin" || session.user.role === "manager";
  };

  const handleEditTimeLog = (timeLog: TimeLogData) => {
    setEditingTimeLog(timeLog);
  };

  const handleSaveTimeLog = (updatedTimeLog: TimeLogData) => {
    setTimeLogs((prev) => prev.map((log) => (log._id === updatedTimeLog._id ? updatedTimeLog : log)));

    // Update task's totalTime if this time log is for a task
    if (updatedTimeLog.taskId) {
      setAssignedTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task._id === updatedTimeLog.taskId) {
            // Recalculate total time for this task based on all time logs
            const taskTimeLogs = timeLogs.filter((log) => log.taskId === updatedTimeLog.taskId);
            const newTotalTime = taskTimeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
            return { ...task, totalTime: newTotalTime };
          }
          return task;
        })
      );
    }
  };

  const handleDeleteTimeLog = async (timeLogId: string) => {
    if (!confirm("Are you sure you want to delete this time log?")) return;

    try {
      setDeletingTimeLogId(timeLogId);

      // Find the time log to get its duration and taskId before deleting
      const timeLogToDelete = timeLogs.find((log) => log._id === timeLogId);
      const deletedDuration = timeLogToDelete?.duration || 0;
      const taskId = timeLogToDelete?.taskId;

      await deleteTimeLog(timeLogId);

      // Remove from state
      setTimeLogs((prev) => prev.filter((log) => log._id !== timeLogId));

      // Update the task's totalTime if this time log was for a task
      if (taskId) {
        setAssignedTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task._id === taskId) {
              const newTotalTime = Math.max(0, (task.totalTime || 0) - deletedDuration);
              return { ...task, totalTime: newTotalTime };
            }
            return task;
          })
        );
      }
    } catch (err) {
      console.error("Error deleting time log:", err);
      alert("Failed to delete time log");
    } finally {
      setDeletingTimeLogId(null);
    }
  };

  // Filter time logs by selected task and sort by latest first
  const filteredTimeLogs = timeLogs
    .filter((timeLog) => {
      if (taskFilter === "all") return true;
      return timeLog.taskId === taskFilter;
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  if (loading || !session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{!session?.user?.id ? "Loading session..." : "Loading Clockify view..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={handleBack} className="mt-4 text-blue-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <TimerProvider>
      <TimerProviderWithCallbacks
        onTaskUpdate={(taskId, updates) => {
          setAssignedTasks((prevTasks) =>
            prevTasks.map((task) => (task._id === taskId ? { ...task, ...updates } : task))
          );
        }}
      >
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Top Bar */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button onClick={handleBack} className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{project?.name || "Project"}</h1>
                    <p className="text-sm text-gray-500">Time Tracking</p>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/dashboard/productivity/clockify/${projectId}/summary`)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Summary</span>
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/productivity/clockify/${projectId}/calendar`)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span>Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {/* Timer Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Time Tracker</h2>
                  <Timer
                    projectId={projectId}
                    onTimeLogCreated={handleTimeLogCreated}
                    onTimeLogUpdated={handleTimeLogUpdated}
                    showManualEntry={true}
                  />
                </div>

                {/* Quick Manual Time Entry Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Quick Manual Time Entry</h2>
                  {assignedTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>No tasks assigned to you in this project.</p>
                      <p className="text-sm mt-1">Tasks will appear here once they are assigned to you.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assignedTasks.map((task) => (
                        <div key={task._id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 truncate">{task.name}</h3>
                            <span className="text-xs text-gray-500 capitalize">{task.status}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            {task.totalTime && task.totalTime > 0 && (
                              <span className="text-blue-600 font-medium">
                                Total: {formatTimeHuman(task.totalTime)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Timer
                              projectId={projectId}
                              taskId={task._id}
                              taskName={task.name}
                              compact={true}
                              className="text-xs"
                              onTimeLogCreated={handleTimeLogCreated}
                              onTimeLogUpdated={handleTimeLogUpdated}
                            />
                            <TaskManualTimeEntry
                              projectId={projectId}
                              taskId={task._id}
                              taskName={task.name}
                              onTimeLogCreated={handleTimeLogCreated}
                              onTimeLogUpdated={handleTimeLogUpdated}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time Logs Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Time Logs</h2>
                    <div className="flex items-center gap-4">
                      <select
                        value={taskFilter}
                        onChange={(e) => setTaskFilter(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="all">All Tasks</option>
                        {assignedTasks.map((task) => (
                          <option key={task._id} value={task._id}>
                            {task.name}
                          </option>
                        ))}
                      </select>
                      <div className="text-sm text-gray-500">{filteredTimeLogs.length} entries</div>
                    </div>
                  </div>

                  {filteredTimeLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      {taskFilter === "all"
                        ? "No time logs yet. Start tracking your time above."
                        : "No time logs for this task yet."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTimeLogs.map((timeLog) => (
                        <div
                          key={timeLog._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{timeLog.description}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(timeLog.startTime)}
                              {timeLog.endTime && ` - ${formatDate(timeLog.endTime)}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-mono font-semibold text-gray-900">
                                {formatTime(timeLog.duration)}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">{timeLog.status}</div>
                            </div>

                            {canEditTimeLog(timeLog) && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditTimeLog(timeLog)}
                                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                  title="Edit time log"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTimeLog(timeLog._id!)}
                                  disabled={deletingTimeLogId === timeLog._id}
                                  className="p-1 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                                  title="Delete time log"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {editingTimeLog && (
          <EditTimeLogModal
            timeLog={editingTimeLog}
            isOpen={true}
            onClose={() => setEditingTimeLog(null)}
            onSave={handleSaveTimeLog}
          />
        )}
      </TimerProviderWithCallbacks>
    </TimerProvider>
  );
};

export default ClockifyProjectPage;
