import { useState, useEffect, useCallback } from "react";
import type { Registration, RegistrationRequest } from "@/types/registration";
import { useAuthStore } from "@/stores/authStore";
import {
  cancelRegistration as cancelRegistrationApi,
  fetchRegistrations as fetchRegistrationsApi,
  registerForEvent as registerForEventApi,
} from "@/lib/registration-api";

export function useRegistrations() {
  const { isAuthenticated } = useAuthStore();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRegistrationsApi();
      setRegistrations(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch registrations";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const registerForEvent = async (request: RegistrationRequest) => {
    if (!isAuthenticated) throw new Error("Not authenticated");

    setIsLoading(true);
    setError(null);
    try {
      const registration = await registerForEventApi(request);
      setRegistrations((prev) => [registration, ...prev]);
      return registration;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRegistration = async (id: number) => {
    if (!isAuthenticated) throw new Error("Not authenticated");

    setIsLoading(true);
    setError(null);
    try {
      await cancelRegistrationApi(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Cancellation failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated, fetchRegistrations]);

  return {
    registrations,
    isLoading,
    error,
    fetchRegistrations,
    registerForEvent,
    cancelRegistration,
  };
}
