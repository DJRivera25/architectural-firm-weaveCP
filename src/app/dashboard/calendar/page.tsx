"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Calendar from "@/components/ui/Calendar";
import EventForm from "@/components/ui/EventForm";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Event, LeaveWithUser } from "@/types";

export default function AdminCalendarPage() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveWithUser | null>(null);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleLeaveClick = (leave: LeaveWithUser) => {
    setSelectedLeave(leave);
  };

  const handleEventFormSuccess = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  const handleEventFormCancel = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 animate-fadeInSlow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Calendar</h1>
            <p className="text-gray-600">Manage company events, meetings, and view employee leave</p>
          </div>
          <Button onClick={() => setShowEventForm(true)}>Add Event</Button>
        </div>

        <Calendar onEventClick={handleEventClick} onLeaveClick={handleLeaveClick} />

        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedEvent ? "Edit Event" : "Create Event"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleEventFormCancel}>
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <EventForm
                  event={selectedEvent || undefined}
                  onSuccess={handleEventFormSuccess}
                  onCancel={handleEventFormCancel}
                />
              </div>
            </div>
          </div>
        )}

        {selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Leave Details</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLeave(null)}>
                    ✕
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee</label>
                    <p className="text-gray-900">{selectedLeave.user?.name || "Unknown User"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedLeave.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                    <p className="text-gray-900">{selectedLeave.leaveType}</p>
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
        )}
      </div>
    </DashboardLayout>
  );
}
