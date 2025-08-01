import { Session } from "next-auth";

export interface ExtendedSession extends Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "employee" | "manager";
    image?: string;
  };
}

export interface ContentData {
  _id?: string;
  section: string;
  title: string;
  content: string;
  images: string[];
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobData {
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationData {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  notes?: string;
}

export interface TimeLogData {
  _id?: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  status: "running" | "paused" | "stopped";
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  _id: string;
  name: string;
  client?: string;
  description?: string;
  status?: "active" | "completed" | "on-hold" | "cancelled";
  budget?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  totalTime?: number; // Total time spent on project in seconds
  estimatedTime?: number; // Estimated time in seconds
  createdAt?: string;
  updatedAt?: string;
  photo?: string; // URL to the project background image
  members?: string[];
}

export interface TaskChecklistItem {
  text: string;
  checked: boolean;
  createdAt: string;
  checkedAt?: string;
}

export interface TaskActivity {
  type: string;
  user: string;
  message: string;
  createdAt: string;
}

export interface TaskAttachment {
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskComment {
  user: string;
  text: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  name: string;
  projectId: string;
  description?: string;
  assignees: string[];
  status: "todo" | "in-progress" | "done" | "active" | "completed" | "paused";
  dueDate?: string;
  isActive: boolean;
  totalTime?: number; // Total time spent on task in seconds
  estimatedTime?: number; // Estimated time in seconds
  createdAt: string;
  updatedAt: string;
  checklist?: TaskChecklistItem[];
  activity?: TaskActivity[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
  image?: string;
  position?: string;
  team?: string;
  createdAt?: string;
}

export interface TaskWithDetails {
  _id: string;
  name: string;
  projectId: string | Project;
  description?: string;
  assignees: string[] | User[];
  status: "todo" | "in-progress" | "done" | "active" | "completed" | "paused";
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum LeaveType {
  VACATION = "vacation",
  SICK = "sick",
  PERSONAL = "personal",
  MATERNITY = "maternity",
  PATERNITY = "paternity",
  BEREAVEMENT = "bereavement",
  UNPAID = "unpaid",
}

export enum LeaveStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface Leave {
  _id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  description?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveWithUser extends Leave {
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  type: "meeting" | "deadline" | "holiday" | "event" | "task";
  category: "work" | "personal" | "holiday" | "meeting" | "deadline";
  color: string;
  attendees?: string[];
  createdBy: string;
  isPublic: boolean;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveCredit {
  _id: string;
  userId: string;
  year: number;
  leaveType: LeaveType;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactFormResponse = { success: true } | { error: string };

export interface Team {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  manager?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  salary: { min: number; max: number; currency: string };
  requirements: string[];
  responsibilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLogWithDetails {
  _id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  status: "running" | "paused" | "stopped";
  isActive: boolean;
  user?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  project?: {
    _id: string;
    name: string;
  };
  task?: {
    _id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsMetric {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export type TeamMember = { name: string; role: string; image: string };

// NOTE: All date fields in frontend types should be string (ISO format), not Date.
// This matches API/JSON transport and avoids conversion bugs. Convert to Date only when needed in local logic.
// Example: const date = new Date(user.createdAt);
//
// If you need a utility type for date fields:
// type DateString = string; // for clarity
//
// export interface User { ... createdAt: DateString; ... }
