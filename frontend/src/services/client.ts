const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Base API client. Attempts a real fetch first; if the backend is
 * unavailable (network error / non-JSON / 404), falls back to the
 * provided mock resolver so the UI keeps working during the hackathon.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  mockResolver?: () => Promise<T> | T,
): Promise<T> {
  // If no backend is configured, use the mock resolver directly.
  if (!API_BASE_URL || !mockResolver) {
    if (mockResolver) return await mockResolver();
    throw new ApiError("No backend configured and no mock available", 503);
  }

  try {
    const url = `${API_BASE_URL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      throw new ApiError(`Request failed: ${res.status}`, res.status);
    }

    const json = await res.json();
    return json as T;
  } catch (err) {
    // Backend unavailable — fall back to mock.
    if (mockResolver) {
      return await mockResolver();
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err instanceof Error ? err.message : "Unknown error",
      500,
    );
  }
}
