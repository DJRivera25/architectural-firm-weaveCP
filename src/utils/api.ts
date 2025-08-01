import api from "./axios";
import {
  ContentData,
  JobData,
  TimeLogData,
  Task,
  Project,
  Leave,
  LeaveWithUser,
  Event,
  LeaveCredit,
  ContactFormPayload,
  ContactFormResponse,
} from "@/types";
import { Notification, NotificationPayload } from "@/types/notification";
import { IUser } from "@/models/User";
import { ITeam } from "@/models/Team";

// Cloudinary resource type (strict)
export interface CloudinaryImageResource {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  // Add more explicit fields as needed
}

// --- Content ---
export const getContent = (section?: string) =>
  api.get<ContentData[]>(`/content${section ? `?section=${section}` : ""}`);
export const createContent = (data: ContentData) => api.post<ContentData>("/content", data);
export const updateContent = (id: string, data: Partial<ContentData>) => api.patch<ContentData>(`/content/${id}`, data);
export const deleteContent = (id: string) => api.delete(`/content/${id}`);

// --- Content Sections (Enhanced) ---
export const getContentSection = (section: string) => api.get<ContentData>(`/content/sections/${section}`);
export const updateContentSection = (
  section: string,
  data: { draftData?: Record<string, unknown>; publishedData?: Record<string, unknown> }
) => api.patch<ContentData>(`/content/sections/${section}`, data);
export const publishContentSection = (section: string) => api.post<ContentData>(`/content/sections/${section}/publish`);

// --- Team ---
export const getTeam = () => api.get<IUser[]>("/team");
export const updateTeamMember = (id: string, data: Partial<IUser>) => api.patch<IUser>(`/team/${id}`, data);

// --- Teams (new model) ---
export const getTeams = () => api.get<ITeam[]>("/team");
export const getTeamById = (id: string) => api.get<ITeam>(`/team/${id}`);
export const createTeam = (data: { name: string; description?: string; members: string[]; manager?: string }) =>
  api.post<ITeam>("/team", data);
export const updateTeam = (
  id: string,
  data: { name?: string; description?: string; members?: string[]; manager?: string }
) => api.patch<ITeam>(`/team/${id}`, data);
export const deleteTeam = (id: string) => api.delete<{ success: boolean }>(`/team/${id}`);

// --- Users (admin & profile) ---
export const getUsers = (team?: string) => api.get<IUser[]>(`/users${team ? `?team=${team}` : ""}`);
export const getUserById = (id: string) => api.get<IUser>(`/users/${id}`);
export const updateUserById = (id: string, data: Partial<IUser>) => api.patch<IUser>(`/users/${id}`, data);
// Deprecated: use getUserById/updateUserById for profile
export const updateUser = updateUserById;
export const getUsersByIds = (ids: string[]) => api.post<IUser[]>("/users/by-ids", { ids });

// --- Jobs ---
export const getJobs = () => api.get<JobData[]>("/jobs");
export const createJob = (data: JobData) => api.post<JobData>("/jobs", data);
export const updateJob = (id: string, data: Partial<JobData>) => api.patch<JobData>(`/jobs/${id}`, data);
export const deleteJob = (id: string) => api.delete(`/jobs/${id}`);

// --- TimeLogs ---
export const getTimeLogs = (params?: string) => api.get<TimeLogData[]>(`/timelogs${params ? params : ""}`);
export const getTimeLog = (id: string) => api.get<TimeLogData>(`/timelogs/${id}`);
export const createTimeLog = (data: Omit<TimeLogData, "_id" | "userId" | "createdAt" | "updatedAt">) =>
  api.post<TimeLogData>("/timelogs", data);
export const updateTimeLog = (id: string, data: Partial<TimeLogData>) =>
  api.patch<TimeLogData>(`/timelogs/${id}`, data);
export const deleteTimeLog = (id: string) => api.delete(`/timelogs/${id}`);
export const getTimeLogsByProject = (projectId: string) => api.get<TimeLogData[]>(`/timelogs?projectId=${projectId}`);
export const getTimeLogsByTask = (taskId: string) => api.get<TimeLogData[]>(`/timelogs?taskId=${taskId}`);
export const getTimeLogsByUser = (userId: string) => api.get<TimeLogData[]>(`/timelogs?userId=${userId}`);
export const getTimeLogReports = (params?: string) => api.get(`/timelogs/reports${params ? params : ""}`);
export const getTimeLogSummary = (startDate: string, endDate: string, userId?: string, projectId?: string) =>
  api.get(
    `/timelogs/summary?startDate=${startDate}&endDate=${endDate}${userId ? `&userId=${userId}` : ""}${
      projectId ? `&projectId=${projectId}` : ""
    }`
  );

// --- Images ---
export const getImages = () => api.get<CloudinaryImageResource[]>("/images");
export const deleteImage = (public_id: string) => api.delete("/images", { data: { public_id } });
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<{ url: string }>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- Notifications ---
export const getNotifications = () => api.get<Notification[]>("/notifications");
export const createNotification = (data: NotificationPayload) => api.post<Notification>("/notifications", data);
export const markNotificationRead = (id: string) => api.patch<Notification>(`/notifications/${id}`);
export const deleteNotification = (id: string) => api.delete(`/notifications/${id}`);

// --- Projects ---
export const getProjects = () => api.get<Project[]>("/projects");
export const getProject = (id: string) => api.get<Project>(`/projects/${id}`);
export const createProject = (data: Partial<Project>) => api.post<Project>("/projects", data);
export const updateProject = (id: string, data: Partial<Project>) => api.patch<Project>(`/projects/${id}`, data);
export const deleteProject = (id: string) => api.delete<{ success: boolean }>(`/projects/${id}`);
export const getProjectMembers = (projectId: string) => api.get<IUser[]>(`/projects/${projectId}/members`);

// --- Tasks ---
export const getTasks = (params?: string) => api.get<Task[]>(`/tasks${params ? params : ""}`);
export const getTask = (id: string) => api.get<Task>(`/tasks/${id}`);
export const createTask = (data: Partial<Task>) => api.post<Task>("/tasks", data);
export const updateTask = (id: string, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data);
export const deleteTask = (id: string) => api.delete<{ success: boolean }>(`/tasks/${id}`);
export const getTaskComments = (id: string) => api.get(`/tasks/${id}/comments`);
export const addTaskComment = (id: string, data: { text: string }) => api.post(`/tasks/${id}/comments`, data);

// --- Leaves ---
export const getLeaves = (params?: string) => api.get<LeaveWithUser[]>(`/leaves${params ? params : ""}`);
export const getLeave = (id: string) => api.get<LeaveWithUser>(`/leaves/${id}`);
export const createLeaveRequest = (data: Omit<Leave, "_id" | "userId" | "status" | "createdAt" | "updatedAt">) =>
  api.post<Leave>("/leaves", data);
export const updateLeaveRequest = (id: string, data: Partial<Leave>) => api.patch<Leave>(`/leaves/${id}`, data);
export const deleteLeaveRequest = (id: string) => api.delete(`/leaves/${id}`);

// --- Events ---
export const getEvents = (params?: string) => api.get<Event[]>(`/events${params ? params : ""}`);
export const getEvent = (id: string) => api.get<Event>(`/events/${id}`);
export const createEvent = (data: Omit<Event, "_id" | "createdBy" | "createdAt" | "updatedAt">) =>
  api.post<Event>("/events", data);
export const updateEvent = (id: string, data: Partial<Event>) => api.patch<Event>(`/events/${id}`, data);
export const deleteEvent = (id: string) => api.delete(`/events/${id}`);

// --- Employee Events ---
export const getEmployeeEvents = () => api.get<Event[]>("/events?employeeOnly=true");

// --- Leave Credits ---
export const getLeaveCredits = (params?: string) => api.get<LeaveCredit[]>(`/leave-credits${params ? params : ""}`);
export const createLeaveCredit = (data: Omit<LeaveCredit, "_id" | "createdAt" | "updatedAt">) =>
  api.post<LeaveCredit>("/leave-credits", data);

// --- Auth ---
export const registerUser = (data: Record<string, unknown>) => api.post("/auth/register", data);
export const confirmUser = (email: string) => api.post("/auth/confirm", { email });

// --- Password Reset ---
export const requestPasswordReset = (email: string) =>
  api.post<{ success: boolean }>("/auth/request-password-reset", { email });

export const resetPassword = (data: { email: string; code: string; password: string }) =>
  api.post<{ success: boolean }>("/auth/reset-password", data);

// --- Registration Token (Admin) ---
export const generateRegistrationToken = () => api.post<{ token: string }>("/auth/generate-registration-token");

// --- Profile Image Upload ---
export const uploadProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<{ url: string }>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
};

export async function getMyTeams() {
  const res = await fetch("/api/team/my-teams");
  if (!res.ok) throw new Error("Failed to fetch my teams");
  return res.json();
}

export const sendContactForm = (payload: ContactFormPayload) => api.post<ContactFormResponse>("/contact", payload);

// --- Applications ---
export const getApplications = (params?: string) => api.get(`/applications${params ? params : ""}`);
export const getApplication = (id: string) => api.get(`/applications/${id}`);
export const updateApplication = (id: string, data: { status?: string; notes?: string }) =>
  api.patch(`/applications/${id}`, data);
export const deleteApplication = (id: string) => api.delete(`/applications/${id}`);

// Submit job application (public endpoint)
export const submitApplication = (formData: FormData) => api.post("/applications", formData);
