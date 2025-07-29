"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getTimeLogsByTask, updateTimeLog, deleteTimeLog } from "@/utils/api";
import type { TimeLogData, Task } from "@/types";
import { formatTime, formatTimeHuman } from "@/utils/timerUtils";
import { ClockIcon, PlayIcon, StopIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface TaskTimeLogsProps {
  taskId: string;
  taskName: string;
  className?: string;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

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

export const TaskTimeLogs: React.FC<TaskTimeLogsProps> = ({ taskId, taskName, className = "", onTaskUpdate }) => {
  const { data: session } = useSession();
  const [timeLogs, setTimeLogs] = useState<TimeLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTimeLog, setEditingTimeLog] = useState<TimeLogData | null>(null);
  const [deletingTimeLogId, setDeletingTimeLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskTimeLogs();
  }, [taskId]);

  const fetchTaskTimeLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTimeLogsByTask(taskId);
      // Sort by startTime descending (latest first) as backup
      const sortedLogs = (response.data || []).sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      setTimeLogs(sortedLogs);
    } catch (err) {
      setError("Failed to load task time logs");
      console.error("Error fetching task time logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const canEditTimeLog = (timeLog: TimeLogData) => {
    if (!session?.user) return false;

    // Handle both string userId and populated user object
    let timeLogUserId: string;
    if (typeof timeLog.userId === "string") {
      timeLogUserId = timeLog.userId;
    } else if (timeLog.userId && typeof timeLog.userId === "object" && "_id" in timeLog.userId) {
      timeLogUserId = (timeLog.userId as { _id: string })._id;
    } else {
      return false;
    }

    return session.user.id === timeLogUserId || session.user.role === "admin" || session.user.role === "manager";
  };

  const handleEditTimeLog = (timeLog: TimeLogData) => {
    setEditingTimeLog(timeLog);
  };

  const handleSaveTimeLog = (updatedTimeLog: TimeLogData) => {
    setTimeLogs((prev) => prev.map((log) => (log._id === updatedTimeLog._id ? updatedTimeLog : log)));
  };

  const handleDeleteTimeLog = async (timeLogId: string) => {
    if (!confirm("Are you sure you want to delete this time log?")) return;

    try {
      setDeletingTimeLogId(timeLogId);

      // Find the time log to get its duration before deleting
      const timeLogToDelete = timeLogs.find((log) => log._id === timeLogId);
      const deletedDuration = timeLogToDelete?.duration || 0;

      await deleteTimeLog(timeLogId);

      // Remove from state
      setTimeLogs((prev) => prev.filter((log) => log._id !== timeLogId));

      // Calculate new total time and update task
      const newTotalTime = Math.max(0, totalTime - deletedDuration);
      onTaskUpdate?.(taskId, { totalTime: newTotalTime });
    } catch (err) {
      console.error("Error deleting time log:", err);
      alert("Failed to delete time log");
    } finally {
      setDeletingTimeLogId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <PlayIcon className="w-4 h-4 text-green-500" />;
      case "stopped":
        return <StopIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const totalTime = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Time History</h3>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="text-center py-8 text-gray-400">Loading time logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Time History</h3>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Time History</h3>
        <div className="text-sm text-gray-500">
          {timeLogs.length} entries • Total: {formatTimeHuman(totalTime)}
        </div>
      </div>

      {timeLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No time logs yet for this task.</p>
          <p className="text-sm">Start tracking time to see history here.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {timeLogs.map((timeLog) => (
            <div key={timeLog._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(timeLog.status)}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{timeLog.description}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(timeLog.startTime)}
                    {timeLog.endTime && ` - ${formatDate(timeLog.endTime)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono font-semibold text-gray-900 text-sm">{formatTime(timeLog.duration)}</div>
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

      {editingTimeLog && (
        <EditTimeLogModal
          timeLog={editingTimeLog}
          isOpen={true}
          onClose={() => setEditingTimeLog(null)}
          onSave={handleSaveTimeLog}
        />
      )}
    </div>
  );
};
