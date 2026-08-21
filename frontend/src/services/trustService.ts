import { apiRequest } from "./client";
import { mockStore } from "./mockStore";
import type { TrustProfile } from "../types";

export const trustService = {
  async getTrust(userId: string): Promise<TrustProfile> {
    return apiRequest(`/api/users/${userId}/trust`, {}, () => mockStore.getTrust(userId));
  },
};
