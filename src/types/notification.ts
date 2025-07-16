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
  user: string;
  message: string;
  type?: NotificationType;
  link?: string;
}
