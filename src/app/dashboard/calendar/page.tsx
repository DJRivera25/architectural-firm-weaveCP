"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Calendar from "@/components/ui/Calendar";
import EventFormModal from "./EventFormModal";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Event, LeaveWithUser } from "@/types";
import {
  CalendarIcon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { getEvents } from "@/utils/api";

type ParsedEvent = Omit<Event, "startDate" | "endDate"> & { startDate: Date; endDate: Date };

export default function AdminCalendarPage() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ParsedEvent | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialStartDate, setInitialStartDate] = useState<string | undefined>(undefined);
  const [initialEndDate, setInitialEndDate] = useState<string | undefined>(undefined);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setLoading(true);
    getEvents()
      .then((res) => {
        setEvents(res.data || []);
      })
      .finally(() => setLoading(false));
  }, [calendarRefreshKey]);

  const handleEventClick = (event: ParsedEvent) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleLeaveClick = (leave: LeaveWithUser) => {
    setSelectedLeave(leave);
  };

  // Helper to get local date string in YYYY-MM-DD
  function toLocalDateString(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0"
    )}`;
  }

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null);
    setInitialStartDate(toLocalDateString(date));
    setInitialEndDate(toLocalDateString(date));
    setShowEventForm(true);
  };

  const handleDateRangeSelect = (start: Date, end: Date) => {
    setSelectedEvent(null);
    setInitialStartDate(toLocalDateString(start));
    setInitialEndDate(toLocalDateString(end));
    setShowEventForm(true);
  };

  const handleEventFormSuccess = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
    setInitialStartDate(undefined);
    setInitialEndDate(undefined);
    setCalendarRefreshKey((k) => k + 1);
  };

  const handleEventFormCancel = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
    setInitialStartDate(undefined);
    setInitialEndDate(undefined);
  };

  // Mock stats - in a real app, these would come from API
  const stats = {
    totalEvents: 12,
    upcomingEvents: 5,
    pendingLeaves: 3,
    approvedLeaves: 8,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Calendar</h1>
            <p className="text-gray-600 mt-2">Manage company events, meetings, and view employee leave requests</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setShowEventForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <AnimatePresence>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Events</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalEvents}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                      <p className="text-2xl font-bold text-green-600">{stats.upcomingEvents}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pendingLeaves}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Approved Leaves</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.approvedLeaves}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Calendar Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <CalendarIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Calendar View</h2>
          </div>

          <Calendar
            key={calendarRefreshKey}
            events={events.map((event) => ({
              ...event,
              startDate: new Date(event.startDate),
              endDate: new Date(event.endDate),
            }))}
            onEventClick={handleEventClick}
            onLeaveClick={handleLeaveClick}
            onDateClick={handleDateClick}
            onDateRangeSelect={handleDateRangeSelect}
          />
        </div>

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {selectedEvent ? "Edit Event" : "Create Event"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleEventFormCancel}>
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <EventFormModal
                  open={showEventForm}
                  initialEvent={(selectedEvent as unknown as Event) || undefined}
                  initialStartDate={initialStartDate}
                  initialEndDate={initialEndDate}
                  onSuccess={handleEventFormSuccess}
                  onClose={handleEventFormCancel}
                />
              </div>
            </div>
          </div>
        )}

        {/* Leave Details Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    Leave Details
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLeave(null)}>
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Employee Information</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{selectedLeave.user?.name || "Unknown User"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedLeave.user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <CalendarIcon className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Leave Details</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                        <p className="text-gray-900 capitalize">{selectedLeave.leaveType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            selectedLeave.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : selectedLeave.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedLeave.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <p className="text-gray-900">
                          {new Date(selectedLeave.startDate).toLocaleDateString()} -{" "}
                          {new Date(selectedLeave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Days</label>
                        <p className="text-gray-900">{selectedLeave.totalDays} days</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <ClockIcon className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Additional Information</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reason</label>
                        <p className="text-gray-900">{selectedLeave.reason}</p>
                      </div>
                      {selectedLeave.description && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <p className="text-gray-900">{selectedLeave.description}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Submitted</label>
                        <p className="text-gray-900">{new Date(selectedLeave.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
