import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import type {
  HostAccessRequest,
  HostAccessRequestAdmin,
  HostAccessRequestCreatePayload,
  HostAccessRequestDecisionPayload,
  HostAccessRequestStatus,
} from "@/types/host-requests";

const normalizeHostRequest = (data: Partial<HostAccessRequest> | null) => {
  if (!data || typeof data.id !== "number") {
    return null;
  }
  return data as HostAccessRequest;
};

export async function createHostAccessRequest(
  payload: HostAccessRequestCreatePayload = {}
): Promise<HostAccessRequest> {
  return apiClient.post<HostAccessRequest>(API_ROUTES.hostRequests.base, payload);
}

export async function fetchMyHostAccessRequest(): Promise<HostAccessRequest | null> {
  const response = await apiClient.get<Partial<HostAccessRequest>>(API_ROUTES.hostRequests.me);
  return normalizeHostRequest(response);
}

export async function fetchHostAccessRequests(
  status?: HostAccessRequestStatus
): Promise<HostAccessRequestAdmin[]> {
  const endpoint = status
    ? `${API_ROUTES.admin.hostRequests}?status=${status}`
    : API_ROUTES.admin.hostRequests;
  return apiClient.get<HostAccessRequestAdmin[]>(endpoint);
}

export async function reviewHostAccessRequest(
  requestId: number,
  decision: HostAccessRequestDecisionPayload
): Promise<HostAccessRequestAdmin> {
  return apiClient.put<HostAccessRequestAdmin>(
    `${API_ROUTES.admin.hostRequests}/${requestId}`,
    decision
  );
}
