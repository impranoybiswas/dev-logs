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
  isRequester?: boolean;
}

export interface FriendshipRequest {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  user: User;
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

export const getSentRequests = async (): Promise<FriendshipRequest[]> => {
  const response = await api.get("/users/friendships/sent");
  return response.data;
};

export const getReceivedRequests = async (): Promise<FriendshipRequest[]> => {
  const response = await api.get("/users/friendships/received");
  return response.data;
};

export const cancelFriendRequest = async (friendshipId: string) => {
  const response = await api.patch(
    `/users/friend-request/${friendshipId}/cancel`,
  );
  return response.data;
};
