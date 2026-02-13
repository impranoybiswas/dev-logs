import api from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  gender: string | null;
  birthDate: string | null;
  createdAt: string;
  friendshipStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | "NONE";
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const sendFriendRequest = async (userId: string) => {
  const response = await api.post(`/users/friend-request/${userId}`);
  return response.data;
};

export const respondToFriendRequest = async (
  friendshipId: string,
  action: "ACCEPT" | "REJECT",
) => {
  const response = await api.patch(
    `/users/friend-request/${friendshipId}/respond`,
    { action },
  );
  return response.data;
};
