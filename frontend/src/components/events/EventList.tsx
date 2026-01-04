"use client";

import { EventCard } from "./EventCard";
import type { Event } from "@/types/event";
import { Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, pageTransition } from "@/lib/motion";
import { EmptyState } from "@/components/shared/EmptyState";

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function EventList({ events, isLoading, emptyMessage = "No events found" }: EventListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
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
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      transition={pageTransition}
      className="grid grid-cols-1 gap-4 justify-items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {events.map((event) => (
        <motion.div key={event.id} variants={fadeUp} className="w-full max-w-[300px]">
          <EventCard event={event} />
        </motion.div>
      ))}
    </motion.div>
  );
}
