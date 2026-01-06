"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";
import { format, toZonedTime } from "date-fns-tz";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { EventImage } from "./EventImage";

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const isSoldOut = event.availableSeats === 0;
  const isFree = event.price === 0;
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const availabilityPercent = event.capacity
    ? Math.max(0, Math.min(100, Math.round((event.availableSeats / event.capacity) * 100)))
    : 0;
  const rawBannerSrc = event.bannerUrl || event.bannerImageUrl || "";
  const eventDate = format(toZonedTime(new Date(event.startDate), userTimeZone), "MMM d, yyyy");
  const eventTime = format(toZonedTime(new Date(event.startDate), userTimeZone), "h:mm a");

  return (
    <Link href={`/events/${event.id}`} className="block h-full">
      <Card
        className={cn(
          "group h-full w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.16)]",
          className
        )}
      >
        <CardHeader className="p-0">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <EventImage
              src={rawBannerSrc}
              alt={event.name}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {event.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{eventDate}</span>
              </div>
              <div className="text-sm font-medium">{eventTime}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant={isSoldOut ? "destructive" : "secondary"}
              className="text-xs"
            >
              {isSoldOut ? "Sold Out" : `${availabilityPercent}% Available`}
            </Badge>
            {isFree && (
              <Badge variant="secondary" className="text-xs">
                Free
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.capacity - event.availableSeats} attending</span>
            </div>
            {event.price > 0 && (
              <div className="text-lg font-semibold text-foreground">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: event.currency || "USD",
                }).format(event.price)}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
