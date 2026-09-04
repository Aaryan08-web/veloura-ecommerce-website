import { apiRequest } from './httpClient';

export const contactClient = {
  async submit(payload: { name: string; email: string; subject?: string; message: string }) {
    return apiRequest<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },
};
