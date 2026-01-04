import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import type { Registration, RegistrationRequest } from "@/types/registration";

export async function fetchRegistrations(): Promise<Registration[]> {
  return apiClient.get<Registration[]>(API_ROUTES.registrations);
}

export async function fetchRegistration(registrationId: number): Promise<Registration> {
  return apiClient.get<Registration>(API_ROUTES.registration(registrationId));
}

export async function registerForEvent(request: RegistrationRequest): Promise<Registration> {
  return apiClient.post<Registration>(API_ROUTES.registrations, request);
}

export async function cancelRegistration(registrationId: number): Promise<void> {
  await apiClient.delete(API_ROUTES.registration(registrationId));
}

export async function checkInRegistration(registrationId: number): Promise<void> {
  await apiClient.post(API_ROUTES.registrationCheckIn(registrationId));
}
