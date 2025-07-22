export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  _id: string;
  user: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPayload {
  subject: string;
  message: string;
  type?: NotificationType;
  recipients?: string[];
  project?: string;
  team?: string;
  link?: string;
}
