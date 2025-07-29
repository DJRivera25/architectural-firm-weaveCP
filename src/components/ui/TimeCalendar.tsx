"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import { getTimeLogs } from "@/utils/api";
import { useSession } from "next-auth/react";
import type { TimeLogData, Task } from "@/types";

interface TimeCalendarProps {
  projectId: string;
  className?: string;
}

type ViewMode = "week" | "day";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  duration: number;
  taskId?: string;
  taskName?: string;
  projectName?: string;
  status: string;
}

export const TimeCalendar: React.FC<TimeCalendarProps> = ({ projectId, className = "" }) => {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  // Calculate date range based on view mode
  const getDateRange = () => {
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return { start, end };
    } else {
      const start = startOfDay(currentDate);
      const end = endOfDay(currentDate);
      return { start, end };
    }
  };

  // Fetch calendar data
  const fetchCalendarData = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const { start, end } = getDateRange();

      const userId = selectedUserId || session.user.id;
      const response = await getTimeLogs(
        `?projectId=${projectId}&userId=${userId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );

      const calendarEvents: CalendarEvent[] = response.data.map((log: TimeLogData) => ({
        id: log._id!,
        title: log.description || "Time tracked",
        start: new Date(log.startTime),
        end: log.endTime ? new Date(log.endTime) : new Date(log.startTime),
        duration: log.duration || 0,
        taskId: log.taskId,
        taskName: log.taskId ? "Task" : undefined, // We'll get this from populated data
        projectName: log.projectId ? "Project" : undefined, // We'll get this from populated data
        status: log.status,
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const goToNext = () => {
    if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(event.start, date));
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get total duration for a day
  const getTotalDurationForDay = (date: Date) => {
    const dayEvents = getEventsForDay(date);
    const totalSeconds = dayEvents.reduce((sum, event) => sum + event.duration, 0);
    return formatDuration(totalSeconds);
  };

  // Fetch users for admin filtering
  useEffect(() => {
    const fetchUsers = async () => {
      if (session?.user?.role === "admin" || session?.user?.role === "manager") {
        try {
          const response = await fetch("/api/users");
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };

    fetchUsers();
  }, [session?.user?.role]);

  // Fetch calendar data when dependencies change
  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode, selectedUserId, projectId, session?.user?.id]);

  const { start, end } = getDateRange();
  const days = viewMode === "week" ? eachDayOfInterval({ start, end }) : [currentDate];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goToPrevious} className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === "week"
                ? `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
                : format(currentDate, "MMMM d, yyyy")}
            </h2>
          </div>

          <button onClick={goToNext} className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === "day" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Day
            </button>
          </div>

          {/* User filter for admin/manager */}
          {(session?.user?.role === "admin" || session?.user?.role === "manager") && (
            <select
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {viewMode === "week" ? (
          /* Week View */
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Day headers */}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="bg-gray-50 p-3 text-center">
                <div className="text-sm font-medium text-gray-900">{day}</div>
              </div>
            ))}

            {/* Day cells */}
            {days.map((day: Date) => (
              <div key={day.toISOString()} className="bg-white min-h-[120px] p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">{format(day, "d")}</div>

                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDay(day).map((event) => (
                      <div key={event.id} className="text-xs p-2 bg-blue-50 border border-blue-200 rounded">
                        <div className="font-medium text-blue-900 truncate">{event.taskName || event.title}</div>
                        <div className="text-blue-700">{formatDuration(event.duration)}</div>
                      </div>
                    ))}

                    {getEventsForDay(day).length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">Total: {getTotalDurationForDay(day)}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Day View */
          <div className="p-6">
            <div className="text-lg font-semibold text-gray-900 mb-4">{format(currentDate, "EEEE, MMMM d, yyyy")}</div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getEventsForDay(currentDate).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No time tracked on this day</p>
                  </div>
                ) : (
                  getEventsForDay(currentDate).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{event.taskName || event.title}</div>
                        <div className="text-sm text-gray-500">
                          {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-gray-900">{formatDuration(event.duration)}</div>
                        <div className="text-xs text-gray-500 capitalize">{event.status}</div>
                      </div>
                    </div>
                  ))
                )}

                {getEventsForDay(currentDate).length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">
                      Total Time: {getTotalDurationForDay(currentDate)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
