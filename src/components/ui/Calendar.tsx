"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { getEvents, getLeaves } from "@/utils/api";
import { Event, LeaveWithUser } from "@/types";

interface CalendarProps {
  onEventClick?: (event: Event) => void;
  onLeaveClick?: (leave: LeaveWithUser) => void;
}

export default function Calendar({ onEventClick, onLeaveClick }: CalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [leaves, setLeaves] = useState<LeaveWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = async () => {
    try {
      const [eventsRes, leavesRes] = await Promise.all([getEvents(), getLeaves()]);
      setEvents(eventsRes.data || []);
      // Filter out leaves without user data to prevent errors
      const validLeaves = (leavesRes.data || []).filter((leave) => leave.user && leave.user.name);
      setLeaves(validLeaves);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setEvents([]);
      setLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      const dateStr = current.toISOString().split("T")[0];
      const dayEvents = events.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const dayDate = new Date(current);
        return dayDate >= eventStart && dayDate <= eventEnd;
      });

      const dayLeaves = leaves.filter((leave) => {
        if (!leave.user || !leave.user.name) return false;
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        const dayDate = new Date(current);
        return dayDate >= leaveStart && dayDate <= leaveEnd;
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

  const getEventColor = (event: Event) => {
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
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  !day.isCurrentMonth ? "text-gray-400" : day.isToday ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {day.date.getDate()}
              </div>

              <div className="space-y-1">
                {day.events.map((event, eventIndex) => (
                  <div
                    key={`event-${event._id}-${eventIndex}`}
                    className={`text-xs p-1 rounded cursor-pointer text-white ${getEventColor(event)}`}
                    onClick={() => onEventClick?.(event)}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}

                {day.leaves.map((leave, leaveIndex) => (
                  <div
                    key={`leave-${leave._id}-${leaveIndex}`}
                    className={`text-xs p-1 rounded cursor-pointer text-white ${getLeaveColor(leave)}`}
                    onClick={() => onLeaveClick?.(leave)}
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

      <div className="p-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Meetings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Deadlines</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Holidays</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Leave</span>
          </div>
        </div>
      </div>
    </div>
  );
}
