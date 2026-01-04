"use client";

import Link from "next/link";
import Image from "next/image";
import { format, toZonedTime } from "date-fns-tz";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/types/event";
import { cn } from "@/lib/utils";
import { isBackendAssetUrl, resolveAssetUrl } from "@/lib/api-base";

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
  const availabilityTone =
    availabilityPercent <= 15
      ? "bg-destructive"
      : availabilityPercent <= 40
        ? "bg-[#F0B34B]"
        : "bg-[#1E5A55]";
  const rawBannerSrc = event.bannerUrl || event.bannerImageUrl || "";
  const bannerSrc = rawBannerSrc ? resolveAssetUrl(rawBannerSrc) : "";
  const isBackendAsset = bannerSrc ? isBackendAssetUrl(bannerSrc) : false;
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
            {bannerSrc ? (
              <Image
                src={bannerSrc}
                alt={event.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized={isBackendAsset}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {isSoldOut && (
              <div className="absolute right-2 top-2">
                <Badge variant="destructive" className="border border-white/30">
                  Sold Out
                </Badge>
              </div>
            )}
            {event.isFeatured && (
              <div className="absolute left-2 top-2">
                <Badge className="border border-white/60 bg-white/90 text-foreground">
                  Featured
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium text-foreground/90">
                {eventDate} at {eventTime}
              </span>
            </div>
            <Badge variant="outline" className="border-white/70 bg-white/70 text-[0.65rem]">
              {isFree ? "Free entry" : `${event.currency} ${event.price.toFixed(2)}`}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-foreground/80">
              {event.name}
            </h3>
            <p className="line-clamp-2 text-xs text-muted-foreground">{event.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            {event.category && (
              <Badge variant="secondary" className="text-[0.65rem]">
                {event.category}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3 border-t border-white/70 px-4 py-3">
          <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {event.availableSeats} / {event.capacity} seats
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 overflow-hidden rounded-full bg-muted/70">
              <div
                className={`h-full transition-all ${availabilityTone}`}
                style={{ width: `${availabilityPercent}%` }}
              />
            </div>
            <span className="text-[0.7rem] text-muted-foreground">
              {isSoldOut ? "Sold out" : `${availabilityPercent}% left`}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
