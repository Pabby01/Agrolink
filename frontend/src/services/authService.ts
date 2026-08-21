import { apiRequest } from "./client";
import { mockStore } from "./mockStore";
import { Role } from "../types/enums";
import type { User } from "../types";

export const authService = {
  async login(email: string, _password: string): Promise<User> {
    return apiRequest(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password: _password }) },
      () => mockStore.login(email),
    );
  },

  async loginAsRole(role: Role): Promise<User> {
    return apiRequest(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ role }) },
      () => mockStore.loginAsRole(role),
    );
  },

  async register(data: { name: string; email: string; role: Role; phone?: string; location?: string }): Promise<User> {
    return apiRequest(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(data) },
      () => mockStore.register(data),
    );
  },
};
