import api from "./axios";
import { Notification, NotificationPayload } from "@/types/notification";

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await api.get<Notification[]>("/notifications");
  return res.data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const res = await api.patch<Notification>(`/notifications/${id}`);
  return res.data;
}

export async function deleteNotification(id: string): Promise<{ success: boolean }> {
  const res = await api.delete<{ success: boolean }>(`/notifications/${id}`);
  return res.data;
}

export async function createNotification(payload: NotificationPayload): Promise<Notification> {
  const res = await api.post<Notification>("/notifications", payload);
  return res.data;
}
