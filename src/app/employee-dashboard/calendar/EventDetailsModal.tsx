import { CalendarIcon, MapPinIcon, UserGroupIcon, ClockIcon, TagIcon } from "@heroicons/react/24/outline";
import { Event } from "@/types";
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

type ParsedEvent = Omit<Event, "startDate" | "endDate"> & { startDate: Date; endDate: Date };

export default function EventDetailsModal({
  open,
  event,
  onClose,
}: {
  open: boolean;
  event: Event | ParsedEvent | null;
  onClose: () => void;
}) {
  if (!open || !event) return null;
  // Normalize event dates to Date objects
  const normalizedEvent = {
    ...event,
    startDate: event.startDate instanceof Date ? event.startDate : new Date(event.startDate),
    endDate: event.endDate instanceof Date ? event.endDate : new Date(event.endDate),
  };
  // Color bar based on event type
  const typeColor =
    {
      meeting: "bg-blue-500",
      deadline: "bg-red-500",
      holiday: "bg-green-500",
      event: "bg-purple-500",
      task: "bg-orange-500",
    }[normalizedEvent.type] || "bg-gray-400";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <div className="relative max-w-lg w-full mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-0 overflow-hidden animate-fadeIn">
          {/* Color Bar */}
          <div className={`h-2 w-full ${typeColor}`} />
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-6 pb-3 border-b border-blue-100/60 bg-gradient-to-r from-blue-50/80 via-white/80 to-indigo-50/80 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-blue-700" />
              <span className="text-xl md:text-2xl font-bold tracking-tight text-blue-900 font-archivo">
                {normalizedEvent.title}
              </span>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="rounded-full p-1.5 hover:bg-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={onClose}
              tabIndex={0}
            >
              <span className="text-gray-400 hover:text-gray-900 text-2xl font-bold">×</span>
            </button>
          </div>
          {/* Content */}
          <div className="px-8 py-7 bg-gradient-to-br from-white/90 via-blue-50/60 to-indigo-50/60 rounded-b-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Main Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-base">
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                  {normalizedEvent.allDay ? (
                    <span>All Day</span>
                  ) : (
                    <span>
                      {normalizedEvent.startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {normalizedEvent.endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                  <span>
                    {normalizedEvent.startDate.toLocaleDateString()}{" "}
                    {normalizedEvent.startDate.getTime() !== normalizedEvent.endDate.getTime() &&
                      `- ${normalizedEvent.endDate.toLocaleDateString()}`}
                  </span>
                </div>
                {normalizedEvent.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPinIcon className="w-5 h-5 text-pink-500" />
                    <span>{normalizedEvent.location}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700`}
                  >
                    <TagIcon className="w-4 h-4 mr-1" />
                    {normalizedEvent.type}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700`}
                  >
                    <TagIcon className="w-4 h-4 mr-1" />
                    {normalizedEvent.category}
                  </span>
                </div>
              </div>
              {/* Right: Description & Attendees */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 font-semibold mb-1">Description</div>
                  <div className="text-gray-800 text-sm bg-white/70 rounded-lg p-3 min-h-[48px] border border-gray-100">
                    {normalizedEvent.description || <span className="text-gray-400">No description</span>}
                  </div>
                </div>
                {normalizedEvent.attendees &&
                  Array.isArray(normalizedEvent.attendees) &&
                  normalizedEvent.attendees.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4 text-blue-400" />
                        Attendees
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {normalizedEvent.attendees.map((a: { name?: string; image?: string } | string, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {typeof a === "string" ? a : a.name || ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
            {/* Footer/Actions */}
            <div className="flex justify-end mt-8 pt-4 border-t border-blue-100">
              <button
                type="button"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
