import {
    createEvent as createEventApi,
    deleteEvent as deleteEventApi,
    fetchEvent as fetchEventApi,
    fetchEventsPage,
    updateEvent as updateEventApi,
} from "@/lib/event-api";
import type { CreateEventRequest, Event, EventFilters } from "@/types/event";
import { create } from "zustand";

interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  filters: EventFilters;
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchEvents: (filters?: EventFilters & { page?: number; size?: number }) => Promise<void>;
  fetchEvent: (id: number) => Promise<void>;
  createEvent: (data: CreateEventRequest) => Promise<Event>;
  updateEvent: (id: number, data: Partial<CreateEventRequest>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  setFilters: (filters: EventFilters) => void;
  clearError: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  currentEvent: null,
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,

  fetchEvents: async (filters?: EventFilters & { page?: number; size?: number }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchEventsPage(filters);

      set({
        events: response.content,
        pagination: {
          page: response.page,
          size: response.size,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          first: response.first,
          last: response.last,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch events";
      set({ error: message, isLoading: false });
    }
  },

  fetchEvent: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const event = await fetchEventApi(id);
      set({ currentEvent: event, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch event";
      set({ error: message, isLoading: false });
    }
  },

  createEvent: async (data: CreateEventRequest) => {
    set({ isLoading: true, error: null });
    try {
      const event = await createEventApi(data);
      set((state) => ({
        events: [event, ...state.events],
        isLoading: false,
      }));
      return event;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create event";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id: number, data: Partial<CreateEventRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const event = await updateEventApi(id, data);
      
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
        currentEvent: state.currentEvent?.id === id ? event : state.currentEvent,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update event";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteEventApi(id);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        currentEvent: state.currentEvent?.id === id ? null : state.currentEvent,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete event";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters: EventFilters) => {
    set({ filters });
  },

  clearError: () => set({ error: null }),
}));
