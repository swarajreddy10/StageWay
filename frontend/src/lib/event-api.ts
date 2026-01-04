import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import type { PaginatedResponse } from "@/types/api";
import type {
  CreateEventRequest,
  Event,
  EventAttendee,
  EventFilters,
  UpdateEventRequest,
} from "@/types/event";

type EventQuery = EventFilters & { page?: number; size?: number };

const normalizeEvent = (event: Event): Event => {
  const startsAt = event.startsAt ?? event.startDate ?? event.createdAt;
  const endsAt = event.endsAt ?? event.endDate ?? startsAt;
  const bannerImageUrl = event.bannerImageUrl ?? event.bannerUrl ?? null;

  return {
    ...event,
    startsAt,
    endsAt,
    bannerImageUrl,
  };
};

const normalizeEventList = (events: Event[]) => events.map(normalizeEvent);

const buildEventQuery = (filters?: EventQuery) => {
  const queryParams = new URLSearchParams();

  if (!filters) {
    return queryParams;
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  return queryParams;
};

export async function fetchEventsPage(filters?: EventQuery): Promise<PaginatedResponse<Event>> {
  const queryParams = buildEventQuery(filters);
  const endpoint = queryParams.toString()
    ? `${API_ROUTES.events}?${queryParams.toString()}`
    : API_ROUTES.events;

  const response = await apiClient.get<PaginatedResponse<Event>>(endpoint);

  return {
    ...response,
    content: normalizeEventList(response.content),
  };
}

export async function fetchEvents(filters?: EventFilters, limit = 100): Promise<Event[]> {
  const response = await fetchEventsPage({ ...filters, page: 0, size: limit });
  return response.content;
}

export async function fetchEvent(id: number): Promise<Event> {
  const event = await apiClient.get<Event>(API_ROUTES.event(id));
  return normalizeEvent(event);
}

export async function createEvent(request: CreateEventRequest): Promise<Event> {
  const event = await apiClient.post<Event>(API_ROUTES.events, request);
  return normalizeEvent(event);
}

export async function updateEvent(eventId: number, request: UpdateEventRequest): Promise<Event> {
  const event = await apiClient.put<Event>(API_ROUTES.event(eventId), request);
  return normalizeEvent(event);
}

export async function deleteEvent(eventId: number): Promise<void> {
  await apiClient.delete(API_ROUTES.event(eventId));
}

export async function fetchHostEvents(): Promise<Event[]> {
  const events = await apiClient.get<Event[]>(API_ROUTES.hostEvents);
  return normalizeEventList(events);
}

export async function fetchEventAttendees(eventId: number): Promise<EventAttendee[]> {
  return apiClient.get<EventAttendee[]>(API_ROUTES.eventAttendees(eventId));
}
