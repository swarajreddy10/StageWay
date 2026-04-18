"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";
import { format, toZonedTime } from "date-fns-tz";
import { Calendar, MapPin, Users, ArrowUpRight } from "lucide-react";
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
      <Link href={`/events/${event.id}`} className="block h-full group">
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-2xl border transition-all duration-300",
            "border-white/[0.07] bg-[#0e1018]",
            "hover:-translate-y-1.5",
            className
          )}
          style={{
            boxShadow: "0 2px 16px rgba(0,0,0,0.35)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 0 0 1px ${cat.glow}, 0 8px 32px rgba(0,0,0,0.5), 0 0 40px ${cat.glow}`;
            (e.currentTarget as HTMLElement).style.borderColor = cat.dot + "44";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.35)";
            (e.currentTarget as HTMLElement).style.borderColor = "";
          }}
        >
          {/* Poster-format banner — 3:4 aspect */}
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <EventImage
              src={rawBannerSrc}
              alt={event.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />

            {/* Full gradient overlay from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-[#060810]/50 to-transparent" />

            {/* Top badges row */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              {/* Category dot + label */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: cat.badge, border: `1px solid ${cat.dot}30`, color: cat.dot }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.dot }} />
                {event.category || "Event"}
              </div>

              {/* Price */}
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
            <div className="absolute bottom-0 inset-x-0 p-4 space-y-2">
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
              <h3 className="font-display text-base font-bold text-white leading-tight line-clamp-2 group-hover:text-white transition-colors">
                {event.name}
              </h3>

              {/* Venue */}
              {(event.venueName ?? event.location) && (
                <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{event.venueName ?? event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card bottom strip */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05]">
            <div className="flex items-center gap-1.5 text-[11px] text-white/30">
              <Users className="h-3 w-3" />
              <span>
                {isSoldOut
                  ? "Fully booked"
                  : `${event.availableSeats} spot${event.availableSeats === 1 ? "" : "s"} left`}
              </span>
              {/* Capacity fill bar */}
              {!isSoldOut && (
                <div className="ml-1 w-16 h-px rounded-full bg-white/[0.07] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${fillPct}%`, background: cat.dot + "88" }}
                  />
                </div>
              )}
            </div>

            <div
              className="h-6 w-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
              style={{ background: cat.badge, border: `1px solid ${cat.dot}30` }}
            >
              <ArrowUpRight className="h-3 w-3" style={{ color: cat.dot }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
