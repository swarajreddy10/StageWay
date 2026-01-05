import { create } from "zustand";
import type { AuthResponse, User } from "@/types/auth";
import { apiClient } from "@/lib/api";
import { resolveApiBaseUrl } from "@/lib/api-base";
import { API_ROUTES } from "@/lib/api-routes";
import { supabase } from "@/lib/supabase";
import { normalizeDesiredRole, persistDesiredRole } from "@/lib/auth-role";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  notice: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role?: User["role"]
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hydrateUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  clearNotice: () => void;
}

const clearLegacyTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

const prepareOAuthRole = (role?: User["role"]) => {
  persistDesiredRole(role);
};

const syncSupabaseSession = async (
  accessToken: string,
  desiredRole?: string | null
): Promise<AuthResponse> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  const normalizedRole = normalizeDesiredRole(desiredRole);
  if (normalizedRole) {
    headers["X-Desired-Role"] = normalizedRole;
  }
  const response = await fetch(`${resolveApiBaseUrl()}${API_ROUTES.auth.supabase}`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Authentication failed");
  }

  return response.json();
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  error: null,
  notice: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null, notice: null });
    clearLegacyTokens();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      const message = error?.message || "Login failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw new Error(message);
    }

    try {
      const authResponse = await syncSupabaseSession(data.session.access_token);
      set({
        user: authResponse.user,
        token: data.session.access_token,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });
    } catch (err) {
      await supabase.auth.signOut();
      const message = err instanceof Error ? err.message : "Login failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw err;
    }
  },

  register: async (email: string, password: string, fullName: string, role?: User["role"]) => {
    set({ isLoading: true, error: null, notice: null });
    clearLegacyTokens();
    prepareOAuthRole(role);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      const message = error.message || "Registration failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw new Error(message);
    }

    if (!data.session) {
      set({
        notice: "Check your inbox to confirm your email, then sign in to continue.",
        isLoading: false,
        isAuthenticated: false,
        isHydrated: true,
      });
      return;
    }

    try {
      const authResponse = await syncSupabaseSession(data.session.access_token, role);
      set({
        user: authResponse.user,
        token: data.session.access_token,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });
    } catch (err) {
      await supabase.auth.signOut();
      const message = err instanceof Error ? err.message : "Registration failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post(API_ROUTES.auth.logout);
    } catch (error) {
      console.error("Logout error:", error);
    }
    await supabase.auth.signOut();
    clearLegacyTokens();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: true,
    });
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<User>(API_ROUTES.users.profile, data);
      set({ user: response, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Update failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  hydrateUser: async () => {
    try {
      const response = await apiClient.get<User>(API_ROUTES.auth.user);
      set({ user: response, isAuthenticated: true, isHydrated: true });
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isHydrated: true });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user, isHydrated: true });
  },

  setToken: (token: string | null) => {
    set({ token });
  },

  clearError: () => set({ error: null }),
  clearNotice: () => set({ notice: null }),
}));
