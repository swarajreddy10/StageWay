import type { ApiError } from "@/types/api";
import { resolveApiBaseUrl } from "@/lib/api-base";
import { supabase } from "@/lib/supabase";

class ApiClient {
  private baseUrl?: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const baseUrl = this.baseUrl ?? resolveApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const { authToken, ...fetchOptions } = options;
    const token = authToken ?? (await this.getToken());

    const headers: Record<string, string> = {
      ...(this.defaultHeaders as Record<string, string>),
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: fetchOptions.credentials ?? "omit",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: response.statusText,
          statusCode: response.status,
        }));
        const errorMessage = error.message || response.statusText;
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - backend may be starting up, please try again');
      }
      throw error;
    }
  }

  private async getToken(): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    } catch {
      return null;
    }
  }

  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();

type ApiRequestOptions = RequestInit & {
  authToken?: string;
};
