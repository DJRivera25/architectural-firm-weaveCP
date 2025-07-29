"use client";

import React, { useState, useCallback } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { parseTimeInput, formatTime } from "@/utils/timerUtils";
import { createTimeLog } from "@/utils/api";
import type { TimeLogData } from "@/types";

interface TaskManualTimeEntryProps {
  projectId: string;
  taskId: string;
  taskName: string;
  onTimeLogCreated?: (timeLog: TimeLogData) => void;
  onTimeLogUpdated?: (timeLog: TimeLogData) => void;
}

export const TaskManualTimeEntry: React.FC<TaskManualTimeEntryProps> = ({
  projectId,
  taskId,
  taskName,
  onTimeLogCreated,
  onTimeLogUpdated,
}) => {
  const [manualTimeInput, setManualTimeInput] = useState("");
  const [showManualEntryForm, setShowManualEntryForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualTimeSubmit = useCallback(async () => {
    if (!projectId) {
      setError("Please select a project first");
      return;
    }

    if (!manualTimeInput.trim()) {
      setError("Please enter a time value");
      return;
    }

    const seconds = parseTimeInput(manualTimeInput);
    if (seconds <= 0) {
      setError("Please enter a valid time (e.g., 1h 30m, 1:30, 90)");
      return;
    }

    if (seconds > 86400) {
      // 24 hours in seconds
      setError("Time cannot exceed 24 hours");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const timeLogData = {
        projectId,
        taskId,
        description: `Manual time entry for: ${taskName}`,
        startTime: new Date(Date.now() - seconds * 1000),
        endTime: new Date(),
        duration: seconds,
        status: "stopped" as const,
        isActive: true,
      };

      const response = await createTimeLog(timeLogData);
      onTimeLogCreated?.(response.data);

      // Also call onTimeLogUpdated to update task totalTime in UI
      onTimeLogUpdated?.(response.data);

      setManualTimeInput("");
      setShowManualEntryForm(false);
      setError(null);

      // Show success feedback
      console.log(`Added ${formatTime(seconds)} to task: ${taskName}`);
    } catch (err) {
      setError("Failed to add manual time entry");
      console.error("Error adding manual time:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, taskId, taskName, manualTimeInput, onTimeLogCreated]);

  if (!showManualEntryForm) {
    return (
      <button
        onClick={() => setShowManualEntryForm(true)}
        className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
        title="Add manual time entry"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 relative">
      <input
        type="text"
        value={manualTimeInput}
        onChange={(e) => setManualTimeInput(e.target.value)}
        placeholder="1h 30m"
        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleManualTimeSubmit();
          }
        }}
        autoFocus
      />
      <button
        onClick={handleManualTimeSubmit}
        disabled={isSubmitting || !manualTimeInput.trim()}
        className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Add time"
      >
        <PlusIcon className="w-3 h-3" />
      </button>
      <button
        onClick={() => {
          setShowManualEntryForm(false);
          setManualTimeInput("");
          setError(null);
        }}
        className="p-1 rounded text-gray-500 hover:bg-gray-100 transition-colors"
        title="Cancel"
      >
        <XMarkIcon className="w-3 h-3" />
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded border">
          {error}
        </div>
      )}
    </div>
  );
};
