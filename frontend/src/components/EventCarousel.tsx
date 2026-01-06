"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Event } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";

type EventCarouselProps = {
  events: Event[];
};

export default function EventCarousel({ events }: EventCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const hasEvents = events.length > 0;
  const [isPaused, setIsPaused] = useState(false);

  const motionCards = useMemo(() => {
    return events.map((event, index) => (
      <motion.div
        key={event.id}
        className="h-full w-full max-w-[300px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -6 }}
      >
        <EventCard event={event} />
      </motion.div>
    ));
  }, [events]);

  const scrollBy = (direction: number) => {
    if (!trackRef.current) return;
    const width = trackRef.current.clientWidth;
    trackRef.current.scrollBy({
      left: direction * Math.max(260, width * 0.7),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!hasEvents || isPaused) return;
    const interval = setInterval(() => {
      if (!trackRef.current) return;
      const track = trackRef.current;
      const step = Math.max(260, track.clientWidth * 0.7);
      const maxScroll = track.scrollWidth - track.clientWidth;
      const next = track.scrollLeft + step;
      if (next >= maxScroll - 4) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollTo({ left: next, behavior: "smooth" });
      }
    }, 2800);
    return () => clearInterval(interval);
  }, [hasEvents, isPaused]);

  if (!hasEvents) {
    return (
      <div className="card">
        <h3>No events yet</h3>
        <p className="meta">Create the first event to light up this space.</p>
      </div>
    );
  }

  return (
    <div
      className="carousel-shell"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="carousel-buttons">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-white/70 bg-white/80 hover:bg-white"
          aria-label="Scroll events left"
          onClick={() => scrollBy(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-white/70 bg-white/80 hover:bg-white"
          aria-label="Scroll events right"
          onClick={() => scrollBy(1)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="carousel-track" ref={trackRef}>
        {motionCards}
      </div>
    </div>
  );
}
