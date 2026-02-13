import api from "./api";

export interface Notification {
  id: string;
  type: string;
  message: string;
  userId: string;
  requesterId: string | null;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get("/notifications");
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};
