"use client";

import { EventCard } from "./EventCard";
import { EventGridSkeleton } from "./EventCardSkeleton";
import type { Event } from "@/types/event";
import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function EventList({ events, isLoading, emptyMessage = "No events found" }: EventListProps) {
  if (isLoading) {
    return <EventGridSkeleton count={8} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Check back later for new events or try adjusting your filters."
        icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  );
}
