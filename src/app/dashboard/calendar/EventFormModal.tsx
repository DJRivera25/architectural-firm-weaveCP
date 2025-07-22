"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { getUsers, getTeams, createEvent, createNotification } from "@/utils/api";
import { motion } from "framer-motion";
import type { Event, User } from "@/types";
import type { NotificationType } from "@/types/notification";
import { XMarkIcon, CalendarIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialEvent?: Event;
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function EventFormModal({
  open,
  onClose,
  onSuccess,
  initialEvent,
  initialStartDate,
  initialEndDate,
}: EventFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    allDay: false,
    type: "meeting" as Event["type"],
    category: "work" as Event["category"],
    color: "#3B82F6",
    location: "",
    isPublic: true,
    attendees: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<{ _id: string; name: string }[]>([]);
  const [notifyRecipients, setNotifyRecipients] = useState<"none" | "all" | "attendees">("attendees");
  const [notifyType, setNotifyType] = useState<NotificationType>("info");
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      getUsers().then((res) => {
        setUsers(
          (res.data || []).map((u) => ({
            ...u,
            createdAt: u.createdAt?.toString?.() ?? "",
            updatedAt: u.updatedAt?.toString?.() ?? "",
          }))
        );
      });
      getTeams().then((res) =>
        setTeams(
          (res.data || []).map((t) => ({
            _id: t._id?.toString?.() ?? "",
            name: t.name ?? "",
          }))
        )
      );
    }
  }, [open]);

  useEffect(() => {
    if (initialEvent) {
      const startDate = new Date(initialEvent.startDate);
      const endDate = new Date(initialEvent.endDate);
      setFormData({
        title: initialEvent.title,
        description: initialEvent.description || "",
        startDate: startDate.toISOString().split("T")[0],
        startTime: initialEvent.allDay ? "" : startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split("T")[0],
        endTime: initialEvent.allDay ? "" : endDate.toTimeString().slice(0, 5),
        allDay: initialEvent.allDay,
        type: initialEvent.type,
        category: initialEvent.category,
        color: initialEvent.color,
        location: initialEvent.location || "",
        isPublic: initialEvent.isPublic,
        attendees: (initialEvent.attendees as string[]) || [],
      });
    } else if (initialStartDate && initialEndDate) {
      setFormData((prev) => ({
        ...prev,
        startDate: initialStartDate,
        endDate: initialEndDate,
      }));
    }
  }, [initialEvent, initialStartDate, initialEndDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    else if (new Date(formData.endDate) < new Date(formData.startDate))
      newErrors.endDate = "End date must be after start date";
    if (!formData.allDay) {
      if (!formData.startTime) newErrors.startTime = "Start time is required";
      if (!formData.endTime) newErrors.endTime = "End time is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError("");
    setSuccess(false);
    try {
      const startDateTime = formData.allDay
        ? new Date(formData.startDate).toISOString()
        : new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endDateTime = formData.allDay
        ? new Date(formData.endDate).toISOString()
        : new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: formData.allDay,
        type: formData.type,
        category: formData.category,
        color: formData.color,
        location: formData.location,
        isPublic: formData.isPublic,
        attendees: formData.attendees,
      };
      let createdEvent;
      if (initialEvent) {
        // TODO: updateEvent logic
        setSuccess(true);
        onSuccess?.();
      } else {
        const res = await createEvent(eventData);
        createdEvent = res.data;
        setSuccess(true);
        onSuccess?.();
      }
      // Handle notification
      if (notifyRecipients !== "none") {
        let recipients: string[] = [];
        if (notifyRecipients === "all") {
          recipients = users.map((u) => u._id);
        } else if (notifyRecipients === "attendees") {
          recipients = formData.attendees as string[];
        }
        if (recipients.length > 0) {
          await createNotification({
            subject: notifySubject || formData.title,
            message: notifyMessage || formData.description || "You have a new event.",
            type: notifyType,
            recipients,
            link: createdEvent ? `/dashboard/calendar?event=${createdEvent._id}` : undefined,
          });
        }
      }
      setTimeout(() => setSuccess(false), 2000);
      onClose();
    } catch (err: unknown) {
      setError("Failed to save event or send notification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-blue-100/80 relative overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-blue-100/60 bg-gradient-to-r from-blue-50/80 via-white/80 to-indigo-50/80 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-blue-700" />
            <span className="text-lg md:text-xl font-bold tracking-tight text-blue-900 font-archivo">
              {initialEvent ? "Edit Event" : "Create Event"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-full p-1 hover:bg-blue-100 transition"
            onClick={onClose}
            tabIndex={0}
          >
            <XMarkIcon className="w-6 h-6 text-blue-700" />
          </button>
        </div>
        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
        >
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Event title"
            error={errors.title}
            required
            disabled={isLoading}
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Event description..."
            rows={3}
            disabled={isLoading}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                disabled={isLoading}
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="holiday">Holiday</option>
                <option value="event">Event</option>
                <option value="task">Task</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                disabled={isLoading}
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="holiday">Holiday</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                className="h-10 w-full"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Event location"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                error={errors.startDate}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                error={errors.endDate}
                required
                disabled={isLoading}
              />
            </div>
            {!formData.allDay && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    error={errors.startTime}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    error={errors.endTime}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => handleInputChange("allDay", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">All day event</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange("isPublic", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Public event</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
            <select
              multiple
              value={formData.attendees}
              onChange={(e) =>
                handleInputChange(
                  "attendees",
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
              disabled={isLoading}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          {/* Notification Recipients Button Group */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <label className="block text-sm font-bold text-blue-900 mb-2">Send Notification To</label>
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={notifyRecipients === "none" ? "primary" : "outline"}
                size="sm"
                onClick={() => setNotifyRecipients("none")}
              >
                None
              </Button>
              <Button
                type="button"
                variant={notifyRecipients === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setNotifyRecipients("all")}
              >
                All Users
              </Button>
              <Button
                type="button"
                variant={notifyRecipients === "attendees" ? "primary" : "outline"}
                size="sm"
                onClick={() => setNotifyRecipients("attendees")}
              >
                Attendees
              </Button>
            </div>
            {notifyRecipients !== "none" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notification Subject</label>
                  <Input
                    type="text"
                    value={notifySubject}
                    onChange={(e) => setNotifySubject(e.target.value)}
                    placeholder="Event subject (optional)"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notification Type</label>
                  <Select
                    value={notifyType}
                    onChange={(e) => setNotifyType(e.target.value as NotificationType)}
                    disabled={isLoading}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notification Message</label>
                  <Textarea
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    placeholder="Notification message (optional)"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
            {notifyRecipients === "attendees" && (
              <div className="text-xs text-blue-700 mt-2">Notification will be sent to the selected attendees.</div>
            )}
            {notifyRecipients === "all" && (
              <div className="text-xs text-blue-700 mt-2">Notification will be sent to all users.</div>
            )}
          </div>
          {error && <div className="text-red-600 text-sm font-semibold mt-2">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm font-semibold mt-2">Event saved and notification sent!</div>
          )}
          {/* Sticky Footer */}
          <div className="sticky bottom-0 left-0 bg-white/95 pt-2 pb-2 z-20 flex gap-2 justify-end border-t border-blue-100 rounded-b-2xl px-6 backdrop-blur-xl shadow-sm">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block align-middle"></span>
                  Saving...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  {initialEvent ? "Update Event" : "Create Event"}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </Dialog>
  );
}
