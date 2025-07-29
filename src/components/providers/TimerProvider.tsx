"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  getStoredTimerState,
  setStoredTimerState,
  clearStoredTimerState,
  calculateElapsedTime,
  formatTime,
  validateTimerState,
  type TimerState,
} from "@/utils/timerUtils";
import { createTimeLog, updateTimeLog, addTaskComment } from "@/utils/api";
import type { TimeLogData } from "@/types";
import type { Task } from "@/types";

interface TimerContextType {
  timerState: TimerState;
  elapsedTime: number;
  isSubmitting: boolean;
  error: string | null;
  startTimer: (projectId: string, taskId?: string, taskName?: string, description?: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  setError: (error: string | null) => void;
  onTimeLogCreated?: (timeLog: TimeLogData) => void;
  onTimeLogUpdated?: (timeLog: TimeLogData) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
  onTimeLogCreated?: (timeLog: TimeLogData) => void;
  onTimeLogUpdated?: (timeLog: TimeLogData) => void;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children, onTimeLogCreated, onTimeLogUpdated }) => {
  const [timerState, setTimerState] = useState<TimerState>(
    () =>
      getStoredTimerState() || {
        isRunning: false,
        isPaused: false,
        startTime: null,
        pausedTime: null,
        totalPausedTime: 0,
        projectId: "",
        taskId: null,
        description: "",
        timeLogId: null,
      }
  );

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Update elapsed time every second when timer is running
  useEffect(() => {
    if (!timerState.isRunning) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(calculateElapsedTime(timerState));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    setStoredTimerState(timerState);
  }, [timerState]);

  const startTimer = useCallback(
    async (projectId: string, taskId?: string, taskName?: string, description?: string) => {
      console.log("Global startTimer called", { projectId, taskId, taskName, description });

      if (!projectId) {
        setErrorState("Please select a project first");
        return;
      }

      const finalDescription = description?.trim() || taskName || "Time tracking";
      if (!finalDescription) {
        setErrorState("Please enter a description");
        return;
      }

      try {
        setIsSubmitting(true);
        setErrorState(null);

        // If there's already a running timer, stop it first
        if (timerState.isRunning && timerState.timeLogId) {
          console.log("Stopping current timer before starting new one");

          // Stop the current timer manually
          const finalDuration = calculateElapsedTime(timerState);
          const endTime = new Date();

          const stopResponse = await updateTimeLog(timerState.timeLogId, {
            status: "stopped",
            duration: finalDuration,
            endTime,
          });

          // Call onTimeLogUpdated to update UI for the stopped timer
          onTimeLogUpdated?.(stopResponse.data);

          // Clear the current timer state
          const clearedState: TimerState = {
            isRunning: false,
            isPaused: false,
            startTime: null,
            pausedTime: null,
            totalPausedTime: 0,
            projectId: "",
            taskId: null,
            description: "",
            timeLogId: null,
          };

          setTimerState(clearedState);
          setElapsedTime(0);
          clearStoredTimerState();
        }

        // Start a new timer
        const timeLogData = {
          projectId,
          taskId: taskId || undefined,
          description: finalDescription,
          startTime: new Date(),
          duration: 0,
          status: "running" as const,
          isActive: true,
        };

        const response = await createTimeLog(timeLogData);
        const newTimeLog = response.data;

        const newState: TimerState = {
          isRunning: true,
          isPaused: false,
          startTime: Date.now(),
          pausedTime: null,
          totalPausedTime: 0,
          projectId,
          taskId: taskId || null,
          description: finalDescription,
          timeLogId: newTimeLog._id || null,
        };

        setTimerState(newState);
        onTimeLogCreated?.(newTimeLog);

        if (taskId) {
          try {
            await addTaskComment(taskId, {
              text: `Started tracking time: ${finalDescription}`,
            });
          } catch (err) {
            console.error("Error adding task activity:", err);
          }
        }
      } catch (err) {
        setErrorState("Failed to start timer");
        console.error("Error starting timer:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onTimeLogCreated, timerState, onTimeLogUpdated]
  );

  const stopTimer = useCallback(async () => {
    if (!timerState.timeLogId) return;

    try {
      setIsSubmitting(true);
      setErrorState(null);

      const finalDuration = calculateElapsedTime(timerState);
      const endTime = new Date();

      const response = await updateTimeLog(timerState.timeLogId, {
        status: "stopped",
        duration: finalDuration,
        endTime,
      });

      const updatedTimeLog = response.data;

      // Clear the timer state completely
      const clearedState: TimerState = {
        isRunning: false,
        isPaused: false,
        startTime: null,
        pausedTime: null,
        totalPausedTime: 0,
        projectId: "",
        taskId: null,
        description: "",
        timeLogId: null,
      };

      setTimerState(clearedState);
      setElapsedTime(0);
      clearStoredTimerState();

      // Call the onTimeLogUpdated callback with the updated time log
      onTimeLogUpdated?.(updatedTimeLog);

      if (timerState.taskId) {
        try {
          await addTaskComment(timerState.taskId, {
            text: `Stopped time tracking - Total time: ${formatTime(finalDuration)}`,
          });
        } catch (err) {
          console.error("Error adding task activity:", err);
        }
      }
    } catch (err) {
      setErrorState("Failed to stop timer");
      console.error("Error stopping timer:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [timerState, onTimeLogUpdated]);

  const setError = useCallback((error: string | null) => {
    setErrorState(error);
  }, []);

  const value: TimerContextType = {
    timerState,
    elapsedTime,
    isSubmitting,
    error: errorState,
    startTimer,
    stopTimer,
    setError,
    onTimeLogCreated,
    onTimeLogUpdated,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};

// Wrapper component that provides callbacks for updating task state
export const TimerProviderWithCallbacks: React.FC<{
  children: ReactNode;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}> = ({ children, onTaskUpdate }) => {
  const handleTimeLogUpdated = useCallback(
    async (updatedTimeLog: TimeLogData) => {
      // Update task's totalTime if this time log is for a task
      if (updatedTimeLog.taskId && onTaskUpdate) {
        // Get the current task to sync with the database
        const { getTask } = await import("@/utils/api");
        try {
          const currentTaskResponse = await getTask(updatedTimeLog.taskId);
          const currentTask = currentTaskResponse.data;

          console.log(`Syncing task ${updatedTimeLog.taskId}:`, {
            databaseTotalTime: currentTask.totalTime || 0,
            newDuration: updatedTimeLog.duration || 0,
          });

          // Use the database value since the API already updated it
          onTaskUpdate(updatedTimeLog.taskId, {
            totalTime: currentTask.totalTime || 0,
          });
        } catch (err) {
          console.error("Error syncing task totalTime:", err);
          // Fallback: use the duration from the time log
          onTaskUpdate(updatedTimeLog.taskId, {
            totalTime: updatedTimeLog.duration || 0,
          });
        }
      }
    },
    [onTaskUpdate]
  );

  return <TimerProvider onTimeLogUpdated={handleTimeLogUpdated}>{children}</TimerProvider>;
};
