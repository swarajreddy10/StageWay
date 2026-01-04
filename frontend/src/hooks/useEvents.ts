import { useEffect } from "react";
import { useEventStore } from "@/stores/eventStore";
import type { EventFilters } from "@/types/event";

export function useEvents(filters?: EventFilters, autoFetch = true) {
  const {
    events,
    currentEvent,
    pagination,
    isLoading,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    setFilters,
    clearError,
  } = useEventStore();

  useEffect(() => {
    if (autoFetch) {
      fetchEvents(filters);
    }
  }, [autoFetch, fetchEvents, filters]);

  useEffect(() => {
    if (filters) {
      setFilters(filters);
    }
  }, [filters, setFilters]);

  return {
    events,
    currentEvent,
    pagination,
    isLoading,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError,
  };
}
