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

export const sendMessage = async (
  receiverId: string,
  content: string,
): Promise<ChatMessage> => {
  const response = await api.post("/chat/send", { receiverId, content });
  return response.data;
};
