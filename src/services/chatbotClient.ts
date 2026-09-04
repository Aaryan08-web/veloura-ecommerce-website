import { apiRequest } from './httpClient';

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export const chatbotClient = {
  async sendMessage(message: string, history: ChatMessage[] = []) {
    return apiRequest<{ reply: string }>('/chatbot', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
      skipAuth: true,
    });
  },
};
