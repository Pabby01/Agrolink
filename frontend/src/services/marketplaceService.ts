import { apiRequest } from "./client";
import { mockStore } from "./mockStore";
import type { Listing } from "../types";

export const marketplaceService = {
  async getListings(): Promise<Listing[]> {
    return apiRequest("/api/listings", {}, () => mockStore.getListings());
  },

  async getListing(id: string): Promise<Listing> {
    return apiRequest(`/api/listings/${id}`, {}, () => mockStore.getListing(id));
  },

  async createListing(data: Partial<Listing>): Promise<Listing> {
    return apiRequest(
      "/api/listings",
      { method: "POST", body: JSON.stringify(data) },
      () => mockStore.createListing(data),
    );
  },
};
