import { apiRequest } from "./client";
import { mockStore } from "./mockStore";
import { ShipmentStatus } from "../types/enums";
import type { Shipment, ProofOfDelivery } from "../types";

export const shipmentService = {
  async getShipments(): Promise<Shipment[]> {
    return apiRequest("/api/shipments", {}, () => mockStore.getShipments());
  },

  async createShipment(data: Partial<Shipment>): Promise<Shipment> {
    return apiRequest(
      "/api/shipments",
      { method: "POST", body: JSON.stringify(data) },
      () => mockStore.createShipment(data),
    );
  },

  async updateShipmentStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    return apiRequest(
      `/api/shipments/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      () => mockStore.updateShipmentStatus(id, status),
    );
  },

  async acceptShipment(id: string, transporterId: string, transporterName: string): Promise<Shipment> {
    return apiRequest(
      `/api/shipments/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status: ShipmentStatus.Accepted, transporterId, transporterName }) },
      () => mockStore.acceptShipment(id, transporterId, transporterName),
    );
  },

  async pickupShipment(id: string): Promise<Shipment> {
    return apiRequest(
      `/api/shipments/${id}/pickup`,
      { method: "POST", body: JSON.stringify({}) },
      () => mockStore.pickupShipment(id),
    );
  },

  async deliverShipment(id: string, pod: Partial<ProofOfDelivery>): Promise<Shipment> {
    return apiRequest(
      `/api/shipments/${id}/delivery`,
      { method: "POST", body: JSON.stringify(pod) },
      () => mockStore.deliverShipment(id, pod),
    );
  },
};
