import { apiRequest } from './httpClient';
import { Order } from '../types';

export const orderClient = {
  async createOrder(payload: Partial<Order> & { razorpay?: any }) {
    const data = await apiRequest<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.order;
  },
  async getMyOrders() {
    const data = await apiRequest<{ orders: Order[] }>('/orders/my');
    return data.orders;
  },
  async getOrderById(id: string) {
    const data = await apiRequest<{ order: Order }>(`/orders/${id}`);
    return data.order;
  },
};
