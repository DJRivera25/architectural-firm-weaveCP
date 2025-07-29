"use client";

import React, { useState, useCallback } from "react";
import { PlayIcon, PauseIcon, StopIcon } from "@heroicons/react/24/solid";
import { parseTimeInput, formatTime } from "@/utils/timerUtils";
import { useTimer } from "@/components/providers/TimerProvider";
import { createTimeLog } from "@/utils/api";
import type { TimeLogData } from "@/types";

interface TimerProps {
  projectId?: string;
  taskId?: string;
  taskName?: string;
  onTimeLogCreated?: (timeLog: TimeLogData) => void;
  onTimeLogUpdated?: (timeLog: TimeLogData) => void;
  className?: string;
  showManualEntry?: boolean;
  compact?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  projectId,
  taskId,
  taskName,
  onTimeLogCreated,
  onTimeLogUpdated,
  className = "",
  showManualEntry = false,
  compact = false,
}) => {
  const { timerState, elapsedTime, isSubmitting, error, startTimer, stopTimer, setError } = useTimer();

  const [manualTimeInput, setManualTimeInput] = useState("");
  const [showManualEntryForm, setShowManualEntryForm] = useState(false);

  const handleStart = useCallback(async () => {
    if (!projectId) {
      setError("Please select a project first");
      return;
    }

    await startTimer(projectId, taskId, taskName);
  }, [projectId, taskId, taskName, startTimer, setError]);

  const handleStop = useCallback(async () => {
    await stopTimer();
    // The onTimeLogUpdated callback will be called by the TimerProvider
    // but we need to ensure it's passed through the context
  }, [stopTimer]);

  const handleManualTimeSubmit = useCallback(async () => {
    if (!projectId) {
      setError("Please select a project first");
      return;
    }

    const seconds = parseTimeInput(manualTimeInput);
    if (seconds <= 0) {
      setError("Please enter a valid time");
      return;
    }

    try {
      const timeLogData = {
        projectId,
        taskId: taskId || undefined,
        description: taskName || "Manual time entry",
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
    } catch (err) {
      setError("Failed to add manual time entry");
      console.error("Error adding manual time:", err);
    }
  }, [projectId, taskId, taskName, manualTimeInput, onTimeLogCreated, setError]);

  const isActive = timerState.isRunning;
  const isCurrentTask = timerState.taskId === taskId && isActive;
  const canStart = projectId && (timerState.description.trim() || taskName);
  const canPause = isActive && timerState.timeLogId;

  // Always show timer controls, but only show stop button and timer display for current task
  const shouldShowTimer = true;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {shouldShowTimer && (
          <>
            {!isActive || !isCurrentTask ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
                disabled={isSubmitting || !canStart}
                className={`p-1 rounded text-white hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition ${
                  isCurrentTask ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
                }`}
                title={isCurrentTask ? "Currently tracking this task" : "Start timer"}
              >
                <PlayIcon className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStop();
                }}
                disabled={isSubmitting}
                className="p-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Stop timer"
              >
                <StopIcon className="w-3 h-3" />
              </button>
            )}

            {isActive && isCurrentTask && (
              <span className="text-xs font-mono text-blue-600 font-bold">{formatTime(elapsedTime)}</span>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Timer Display */}
      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-gray-900">{formatTime(elapsedTime)}</div>
        {isCurrentTask && <div className="text-sm text-blue-600 font-medium mt-1">Currently tracking: {taskName}</div>}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>

      {/* Timer Controls */}
      {shouldShowTimer && (
        <div className="flex justify-center gap-4">
          {!isActive || !isCurrentTask ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              disabled={isSubmitting || !canStart}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Start
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStop();
              }}
              disabled={isSubmitting}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <StopIcon className="w-5 h-5" />
              Stop
            </button>
          )}
        </div>
      )}

      {/* Manual Time Entry */}
      {showManualEntry && (
        <div className="border-t pt-4">
          {!showManualEntryForm ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowManualEntryForm(true);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add manual time entry
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualTimeInput}
                  onChange={(e) => setManualTimeInput(e.target.value)}
                  placeholder="1h 30m or 1:30 or 90"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManualTimeSubmit();
                  }}
                  disabled={!manualTimeInput.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Add
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowManualEntryForm(false);
                    setManualTimeInput("");
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
