"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Event } from "@/types/event";
import Link from "next/link";
import { isBackendAssetUrl, resolveAssetUrl } from "@/lib/api-base";

type EventCarouselProps = {
  events: Event[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EventCarousel({ events }: EventCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const hasEvents = events.length > 0;
  const [isPaused, setIsPaused] = useState(false);
  const firstImageIndex = events.findIndex((event) => Boolean(event.bannerImageUrl));

  const motionCards = useMemo(() => {
    return events.map((event, index) => {
      const bannerSrc = event.bannerImageUrl ? resolveAssetUrl(event.bannerImageUrl) : "";
      const isBackendAsset = bannerSrc ? isBackendAssetUrl(bannerSrc) : false;

      const startsAt = event.startsAt ?? event.startDate;
      const endsAt = event.endsAt ?? event.endDate ?? startsAt;

      return (
        <motion.article
          key={event.id}
          className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          whileHover={{ y: -6 }}
        >
          <div className="relative h-44">
            {bannerSrc ? (
              <Image
                src={bannerSrc}
                alt={event.name}
                width={800}
                height={600}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading={index === firstImageIndex ? "eager" : "lazy"}
                priority={index === firstImageIndex}
                unoptimized={isBackendAsset}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-foreground">
              {event.status}
            </span>
          </div>
          <div className="space-y-3 p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{event.name}</h3>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {formatDate(startsAt)} - {formatDate(endsAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.description || "Curated experience incoming."}
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 transition hover:text-foreground"
              href={`/events/${event.id}`}
            >
              View details
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </motion.article>
      );
    });
  }, [events, firstImageIndex]);

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
        <button
          className="carousel-button border border-white/70 bg-white/80 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm hover:bg-white"
          type="button"
          aria-label="Scroll events left"
          onClick={() => scrollBy(-1)}
        >
          Prev
        </button>
        <button
          className="carousel-button border border-white/70 bg-white/80 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm hover:bg-white"
          type="button"
          aria-label="Scroll events right"
          onClick={() => scrollBy(1)}
        >
          Next
        </button>
      </div>
      <div className="carousel-track" ref={trackRef}>
        {motionCards}
      </div>
    </div>
  );
}
