import { Session } from "next-auth";

export interface ExtendedSession extends Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "employee";
    image?: string;
  };
}

export interface ContentData {
  section: string;
  title: string;
  content: string;
  images: string[];
  order: number;
  isActive: boolean;
}

export interface JobData {
  title: string;
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
  date: Date;
  timeIn: Date;
  timeOut?: Date;
  totalHours?: number;
  notes?: string;
}
