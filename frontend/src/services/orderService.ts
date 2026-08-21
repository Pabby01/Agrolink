import { apiRequest } from "./client";
import { mockStore } from "./mockStore";
import { OrderStatus } from "../types/enums";
import type { Order, ProofOfDelivery } from "../types";

export const orderService = {
  async getOrders(): Promise<Order[]> {
    return apiRequest("/api/orders", {}, () => mockStore.getOrders());
  },

  async getOrder(id: string): Promise<Order> {
    return apiRequest(`/api/orders/${id}`, {}, () => mockStore.getOrder(id));
  },

  async createOrder(data: { buyerId: string; buyerName: string; listingId: string; quantity: number }): Promise<Order> {
    return apiRequest(
      "/api/orders",
      { method: "POST", body: JSON.stringify(data) },
      () => mockStore.createOrder(data),
    );
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiRequest(
      `/api/orders/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      () => mockStore.updateOrderStatus(id, status),
    );
  },

  async confirmDelivery(orderId: string, pod: Partial<ProofOfDelivery>): Promise<Order> {
    return apiRequest(
      `/api/orders/${orderId}/confirm-delivery`,
      { method: "POST", body: JSON.stringify(pod) },
      () => mockStore.confirmDelivery(orderId, pod),
    );
  },
};
