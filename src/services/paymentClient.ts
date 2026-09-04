import { apiRequest } from './httpClient';

export const paymentClient = {
  async getKey(): Promise<{ keyId: string; configured: boolean }> {
    try {
      const res = await apiRequest<{ keyId: string | null; configured: boolean }>('/payment/key', { skipAuth: true });
      return {
        keyId: res?.keyId || '',
        configured: Boolean(res?.keyId),
      };
    } catch (err) {
      throw new Error('Unable to retrieve Razorpay configuration.');
    }
  },

  async createOrder(amount: number, receipt?: string): Promise<{ order: any; keyId: string }> {
    const res = await apiRequest<{ order: any; keyId: string }>('/payment/create-order', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ amount, receipt }),
      });
    if (!res?.order || !res?.keyId) throw new Error('Razorpay is not configured on the server.');
    return res;
  },

  async verify(payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }): Promise<{ verified: boolean; message: string }> {
    const res = await apiRequest<{ verified: boolean; message: string }>('/payment/verify', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify(payload),
      });
    if (!res?.verified) throw new Error(res?.message || 'Razorpay could not verify the payment.');
    return res;
  },
};
