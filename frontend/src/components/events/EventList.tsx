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

  if (events.length === 1) {
    return (
      <div className="grid grid-cols-1">
        <EventCard
          key={events[0].id}
          event={events[0]}
          index={0}
          className="max-w-[640px]"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  );
}
