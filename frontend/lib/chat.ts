import api from "./api";

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

export const getChatMessages = async (
  friendId: string,
): Promise<ChatMessage[]> => {
  const response = await api.get(`/chat/messages/${friendId}`);
  return response.data;
};
