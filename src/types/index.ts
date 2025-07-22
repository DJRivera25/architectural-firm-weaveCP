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
  slug: string;
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
  userId: string;
  projectId?: string;
  taskId?: string;
  date: Date;
  timeIn: Date;
  timeOut?: Date;
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  overtimeReason?: string;
  notes?: string;
}

export interface Project {
  _id: string;
  name: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
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
