import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Event } from "@/types/event";

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-white/[0.09] text-white/75  border-white/[0.15]",
  DRAFT:     "bg-white/[0.05] text-white/45  border-white/[0.09]",
  COMPLETED: "bg-white/[0.03] text-white/30  border-white/[0.06]",
  CANCELLED: "bg-white/[0.03] text-white/25  border-white/[0.05]",
};

interface HostEventCardProps { event: Event; }

export function HostEventCard({ event }: HostEventCardProps) {
  const fillPct = event.capacity
    ? Math.max(0, Math.min(100, Math.round(((event.capacity - event.availableSeats) / event.capacity) * 100)))
    : 0;
  const isFree = !event.price || event.price === 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e1018] transition-all duration-200 hover:border-white/[0.14] hover:bg-[#141720]"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-white/90 text-sm leading-snug line-clamp-2">{event.name}</h3>
          <Badge className={`shrink-0 border text-[9px] font-bold uppercase tracking-wider ${STATUS_STYLE[event.status] ?? STATUS_STYLE.DRAFT}`}>
            {event.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px] text-white/30">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(event.startDate), "MMM d, yyyy")}
          </span>
          <span className="text-white/25">•</span>
          <span>{isFree ? "Free" : `${event.currency ?? "USD"} ${event.price.toFixed(2)}`}</span>
          {(event.venueName ?? event.location) && (
            <span className="inline-flex min-w-0 max-w-full items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{event.venueName ?? event.location}</span>
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-white/30">
            <span className="flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              {event.capacity - event.availableSeats} / {event.capacity}
            </span>
            <span>{fillPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-[#7c5af5]"
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="h-8 w-full border border-white/[0.08] text-xs text-white/45 transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:text-white active:scale-[0.99]">
              View
            </Button>
          </Link>
          <Link href={`/events/${event.id}/edit`}>
            <Button size="sm" className="h-8 bg-violet-600 text-xs font-semibold text-white shadow-btn-white transition-all duration-200 hover:-translate-y-px hover:bg-violet-500 active:scale-[0.99]">
              <Pencil className="mr-1.5 h-3 w-3" />Edit
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
