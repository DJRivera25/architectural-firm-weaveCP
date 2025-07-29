export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number | null;
  totalPausedTime: number;
  projectId: string | null;
  taskId: string | null;
  description: string;
  timeLogId: string | null;
}

export interface TimeLogEntry {
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: "running" | "paused" | "stopped";
}

const TIMER_STORAGE_KEY = "weave_timer_state";

export const getStoredTimerState = (): TimerState | null => {
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored);
    // Validate the stored state has required fields
    if (state && typeof state === "object" && "isRunning" in state) {
      return state as TimerState;
    }
    return null;
  } catch (error) {
    console.error("Error reading timer state from localStorage:", error);
    return null;
  }
};

export const setStoredTimerState = (state: TimerState): void => {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error writing timer state to localStorage:", error);
  }
};

export const clearStoredTimerState = (): void => {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing timer state from localStorage:", error);
  }
};

export const calculateElapsedTime = (state: TimerState): number => {
  if (!state.startTime) return 0;

  const now = Date.now();
  const elapsed = now - state.startTime;
  const totalPaused = state.totalPausedTime || 0;

  // Convert milliseconds to seconds
  return Math.max(0, Math.floor((elapsed - totalPaused) / 1000));
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const formatTimeHuman = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  return `${minutes}m ${secs}s`;
};

export const formatTimeShort = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const parseTimeInput = (input: string): number => {
  // Parse "1h 30m" or "1:30" or "90" format
  const inputLower = input.toLowerCase().trim();

  // Handle "1h 30m" format
  if (inputLower.includes("h") || inputLower.includes("m")) {
    let totalMinutes = 0;
    const hourMatch = inputLower.match(/(\d+)h/);
    const minuteMatch = inputLower.match(/(\d+)m/);

    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }

    return totalMinutes * 60; // Convert to seconds
  }

  // Handle "1:30" format (hours:minutes)
  if (inputLower.includes(":")) {
    const parts = inputLower.split(":");
    if (parts.length === 2) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return (hours * 60 + minutes) * 60; // Convert to seconds
    }
  }

  // Handle plain number (assume minutes)
  const num = parseInt(inputLower);
  if (!isNaN(num)) {
    return num * 60; // Convert to seconds
  }

  return 0;
};

export const createTimeLogEntry = (state: TimerState): TimeLogEntry => {
  const endTime = new Date();
  const duration = calculateElapsedTime(state);

  return {
    projectId: state.projectId!,
    taskId: state.taskId || undefined,
    description: state.description,
    startTime: new Date(state.startTime!),
    endTime,
    duration,
    status: "stopped",
  };
};

export const validateTimerState = (state: TimerState): boolean => {
  return !!(
    state &&
    typeof state.isRunning === "boolean" &&
    typeof state.isPaused === "boolean" &&
    (state.startTime === null || typeof state.startTime === "number") &&
    (state.pausedTime === null || typeof state.pausedTime === "number") &&
    typeof state.totalPausedTime === "number" &&
    (state.projectId === null || typeof state.projectId === "string") &&
    (state.taskId === null || typeof state.taskId === "string") &&
    typeof state.description === "string" &&
    (state.timeLogId === null || typeof state.timeLogId === "string")
  );
};
