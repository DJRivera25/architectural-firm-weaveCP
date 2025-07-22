"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { getEvents, getLeaves } from "@/utils/api";
import type { Event, LeaveWithUser } from "@/types";

type ParsedEvent = Omit<Event, "startDate" | "endDate"> & { startDate: Date; endDate: Date };

interface CalendarProps {
  events?: ParsedEvent[];
  onEventClick?: (event: ParsedEvent) => void;
  onLeaveClick?: (leave: LeaveWithUser) => void;
  onDateClick?: (date: Date) => void;
  onDateRangeSelect?: (start: Date, end: Date) => void;
}

export default function Calendar({
  events: propEvents,
  onEventClick,
  onLeaveClick,
  onDateClick,
  onDateRangeSelect,
}: CalendarProps) {
  const [leaves, setLeaves] = useState<LeaveWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(!propEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!propEvents) {
      setIsLoading(true);
      Promise.all([getEvents(), getLeaves()])
        .then(([eventsRes, leavesRes]) => {
          // Filter out leaves without user data to prevent errors
          const validLeaves = (leavesRes.data || []).filter((leave) => leave.user && leave.user.name);
          setLeaves(validLeaves);
        })
        .catch(() => setLeaves([]))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [propEvents]);

  const events: ParsedEvent[] = propEvents || [];

  // Helper to compare only the date part (ignoring time)
  function isSameOrBetweenDay(day: Date, start: Date, end: Date) {
    const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return d >= s && d <= e;
  }

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Array<{
      date: Date;
      dateStr: string;
      events: ParsedEvent[];
      leaves: LeaveWithUser[];
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      const dateStr = current.toISOString().split("T")[0];
      const dayEvents: ParsedEvent[] = events.filter((event) => {
        return isSameOrBetweenDay(current, event.startDate, event.endDate);
      });

      const dayLeaves = leaves.filter((leave) => {
        if (!leave.user || !leave.user.name) return false;
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        return isSameOrBetweenDay(current, leaveStart, leaveEnd);
      });

      days.push({
        date: new Date(current),
        dateStr,
        events: dayEvents,
        leaves: dayLeaves,
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate, events, leaves]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventColor = (event: ParsedEvent) => {
    switch (event.type) {
      case "meeting":
        return "bg-blue-500";
      case "deadline":
        return "bg-red-500";
      case "holiday":
        return "bg-green-500";
      case "event":
        return "bg-purple-500";
      case "task":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLeaveColor = (leave: LeaveWithUser) => {
    switch (leave.leaveType) {
      case "vacation":
        return "bg-blue-400";
      case "sick":
        return "bg-red-400";
      case "personal":
        return "bg-purple-400";
      case "maternity":
        return "bg-pink-400";
      case "paternity":
        return "bg-indigo-400";
      case "bereavement":
        return "bg-gray-400";
      case "unpaid":
        return "bg-orange-400";
      default:
        return "bg-gray-400";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    if (!selectedStartDate) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      onDateClick?.(date);
    } else if (!selectedEndDate) {
      if (date < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
        onDateRangeSelect?.(date, selectedStartDate);
      } else if (date > selectedStartDate) {
        setSelectedEndDate(date);
        onDateRangeSelect?.(selectedStartDate, date);
      } else {
        // Same date clicked twice, treat as single date
        setSelectedEndDate(null);
        onDateClick?.(date);
      }
      // Reset after selection
      setTimeout(() => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
      }, 300);
    }
  };

  const isDateSelected = (date: Date) => {
    if (!selectedStartDate && !selectedEndDate) return false;
    if (selectedStartDate && !selectedEndDate) return date.toDateString() === selectedStartDate.toDateString();
    if (selectedStartDate && selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              ←
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              →
            </Button>
          </div>
          <Button size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-200 ${!day.isCurrentMonth ? "bg-gray-50" : ""} ${
                day.isToday ? "bg-blue-50 border-blue-300" : ""
              } ${isDateSelected(day.date) ? "bg-yellow-100 border-yellow-400" : ""}`}
              onClick={() => handleDateClick(day.date)}
              style={{ cursor: "pointer" }}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  !day.isCurrentMonth ? "text-gray-400" : day.isToday ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
                {day.events.map((event: ParsedEvent, eventIndex) => (
                  <div
                    key={`event-${event._id}-${eventIndex}`}
                    className={`text-xs p-1 rounded cursor-pointer text-white ${getEventColor(event)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {day.leaves.map((leave, leaveIndex) => (
                  <div
                    key={`leave-${leave._id}-${leaveIndex}`}
                    className={`text-xs p-1 rounded cursor-pointer text-white ${getLeaveColor(leave)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeaveClick?.(leave);
                    }}
                    title={`${leave.user?.name || "Unknown User"} - ${leave.leaveType}`}
                  >
                    {leave.user?.name || "Unknown User"} - {leave.leaveType}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
