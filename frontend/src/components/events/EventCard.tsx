"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";
import { format, toZonedTime } from "date-fns-tz";
import { Calendar, MapPin, Users, ArrowUpRight, Ticket } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EventImage } from "./EventImage";

interface EventCardProps {
  event: Event;
  className?: string;
  index?: number;
}

const CATEGORY_COLORS: Record<string, { dot: string; badge: string; glow: string }> = {
  MUSIC:    { dot: "#ec4899", badge: "rgba(236,72,153,0.12)",  glow: "rgba(236,72,153,0.15)" },
  TECH:     { dot: "#38bdf8", badge: "rgba(56,189,248,0.12)",  glow: "rgba(56,189,248,0.12)" },
  SPORTS:   { dot: "#f97316", badge: "rgba(249,115,22,0.12)",  glow: "rgba(249,115,22,0.12)" },
  ARTS:     { dot: "#a78bfa", badge: "rgba(167,139,250,0.12)", glow: "rgba(167,139,250,0.15)" },
  BUSINESS: { dot: "#34d399", badge: "rgba(52,211,153,0.12)",  glow: "rgba(52,211,153,0.12)" },
  FOOD:     { dot: "#fb923c", badge: "rgba(251,146,60,0.12)",  glow: "rgba(251,146,60,0.12)" },
};

export const EventCard = memo(function EventCard({ event, className, index = 0 }: EventCardProps) {
  const isSoldOut    = event.availableSeats === 0;
  const isFree       = event.price === 0;
  const userTZ       = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const fillPct      = event.capacity
    ? Math.max(0, Math.min(100, Math.round(((event.capacity - event.availableSeats) / event.capacity) * 100)))
    : 0;
  const rawBannerSrc = event.bannerUrl || event.bannerImageUrl || "";
  const eventDate    = format(toZonedTime(new Date(event.startDate), userTZ), "MMM d");
  const eventYear    = format(toZonedTime(new Date(event.startDate), userTZ), "yyyy");
  const eventTime    = format(toZonedTime(new Date(event.startDate), userTZ), "h:mm a");
  const catKey       = (event.category || "").toUpperCase();
  const cat          = CATEGORY_COLORS[catKey] ?? { dot: "#7c5af5", badge: "rgba(124,90,245,0.12)", glow: "rgba(124,90,245,0.15)" };
  const priceStr     = isFree
    ? "Free"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: event.currency || "USD", maximumFractionDigits: 0 }).format(event.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/events/${event.id}`} className="group block h-full">
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1018] transition-all duration-300",
            "hover:-translate-y-1 hover:border-white/[0.16]",
            className
          )}
          style={{ boxShadow: "0 4px 22px rgba(0,0,0,0.35)" }}
        >
          {/* Landscape banner for denser marketplace scanning */}
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <EventImage
              src={rawBannerSrc}
              alt={event.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />

            {/* Full gradient overlay from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-[#060810]/50 to-transparent" />

            {/* Top badges row */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              {/* Category chip */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: cat.badge, border: `1px solid ${cat.dot}30`, color: cat.dot }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.dot }} />
                {event.category || "Event"}
              </div>

              {/* Price chip */}
              <div
                className="px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold"
                style={{
                  background: isFree ? "rgba(52,211,153,0.15)" : "rgba(14,16,24,0.7)",
                  border: isFree ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.10)",
                  color: isFree ? "#34d399" : "rgba(255,255,255,0.75)",
                }}
              >
                {priceStr}
              </div>
            </div>

            {/* Sold out ribbon */}
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 border border-white/[0.12] backdrop-blur-md bg-black/40">
                  Sold Out
                </div>
              </div>
            )}

            {/* Bottom overlay content */}
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
              {/* Date pill */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                  <Calendar className="h-3 w-3" />
                  <span>{eventDate}, {eventYear}</span>
                  <span className="text-white/25">·</span>
                  <span>{eventTime}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight text-white transition-colors group-hover:text-white">
                {event.name}
              </h3>

              {/* Venue */}
              {(event.venueName ?? event.location) && (
                <div className="flex items-center gap-1.5 text-xs text-white/45">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{event.venueName ?? event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card bottom strip */}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-white/35">
              <Users className="h-3.5 w-3.5" />
              <span>
                {isSoldOut
                  ? "Fully booked"
                  : `${event.availableSeats} spot${event.availableSeats === 1 ? "" : "s"} left`}
              </span>
              {/* Capacity fill bar */}
              {!isSoldOut && (
                <div className="ml-1 h-1 w-16 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${fillPct}%`, background: cat.dot + "88" }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/65">
              <Ticket className="h-3.5 w-3.5 text-white/45" />
              View
              <ArrowUpRight className="h-3.5 w-3.5 translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
