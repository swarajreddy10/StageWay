import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import type { AnalyticsOverview, EventAnalytics } from "@/types/analytics";

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiClient.get<AnalyticsOverview>(API_ROUTES.analytics.overview);
}

export async function fetchEventAnalytics(eventId: number): Promise<EventAnalytics> {
  return apiClient.get<EventAnalytics>(API_ROUTES.analytics.event(eventId));
}
