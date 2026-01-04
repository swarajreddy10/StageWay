"use client";

import Image from "next/image";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  Calendar,
  CalendarPlus,
  DollarSign,
  Edit,
  MapPin,
  Share2,
  Tags,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Event } from "@/types/event";
import { isBackendAssetUrl, resolveAssetUrl } from "@/lib/api-base";

interface EventDetailsProps {
  event: Event;
  canEdit?: boolean;
}

export function EventDetails({ event, canEdit }: EventDetailsProps) {
  const isSoldOut = event.availableSeats === 0;
  const isFree = event.price === 0;
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const availabilityPercent = event.capacity
    ? Math.max(0, Math.min(100, Math.round((event.availableSeats / event.capacity) * 100)))
    : 0;
  const rawBannerSrc = event.bannerUrl || event.bannerImageUrl || "";
  const bannerSrc = rawBannerSrc ? resolveAssetUrl(rawBannerSrc) : "";
  const isBackendAsset = bannerSrc ? isBackendAssetUrl(bannerSrc) : false;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddToCalendar = () => {
    const start = new Date(event.startDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(event.endDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.name
    )}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(
      event.location
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_30px_70px_rgba(15,23,42,0.15)]">
        <div className="relative h-64 w-full sm:h-80 lg:h-[420px]">
          {bannerSrc ? (
            <Image
              src={bannerSrc}
              alt={event.name}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
              priority
              unoptimized={isBackendAsset}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <Calendar className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/50 to-black/80" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {isSoldOut && (
                <Badge variant="destructive" className="border border-white/30">
                  Sold Out
                </Badge>
              )}
              {event.category && (
                <Badge className="border border-white/40 bg-white/20 text-white">
                  {event.category}
                </Badge>
              )}
              <Badge className="border border-white/40 bg-white/20 text-white">
                {isFree ? "Free entry" : `${event.currency} ${event.price.toFixed(2)}`}
              </Badge>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => (window.location.href = `/events/${event.id}/edit`)}
                  className="rounded-full border-white/40 bg-white/20 text-white hover:bg-white/30"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="rounded-full border-white/40 bg-white/20 text-white hover:bg-white/30"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddToCalendar}
                className="rounded-full border-white/40 bg-white/20 text-white hover:bg-white/30"
              >
                <CalendarPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
              {event.name}
            </h1>
            <p className="max-w-2xl text-sm text-white/80 sm:text-base">{event.description}</p>
            <div className="flex flex-wrap gap-2">
              {event.tags?.map((tag) => (
                <Badge key={tag} className="border border-white/40 bg-white/20 text-xs text-white">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
              <Calendar className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Date & Time</CardTitle>
              <p className="text-xs text-muted-foreground">Start to finish</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {format(toZonedTime(new Date(event.startDate), userTimeZone), "EEEE, MMM d")} -{" "}
            {format(toZonedTime(new Date(event.startDate), userTimeZone), "h:mm a")} to{" "}
            {format(toZonedTime(new Date(event.endDate), userTimeZone), "h:mm a")}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
              <MapPin className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Location</CardTitle>
              <p className="text-xs text-muted-foreground">Where to show up</p>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {event.venueName ? `${event.venueName}, ` : ""}
            {event.location}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
              <Users className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Seats</CardTitle>
              <p className="text-xs text-muted-foreground">Availability status</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                {event.availableSeats} of {event.capacity} left
              </span>
              <span>{availabilityPercent}% open</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
              <div className="h-full bg-[#1E5A55]" style={{ width: `${availabilityPercent}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-4">
        <TabsList className="flex w-full flex-wrap items-center gap-2 rounded-2xl border border-white/70 bg-white/80 p-1">
          <TabsTrigger value="overview" className="gap-2 text-sm">
            <Tags className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="logistics" className="gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            Logistics
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground sm:text-base">
              <p>{event.description}</p>
              <Separator className="bg-white/60" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Starts</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {format(toZonedTime(new Date(event.startDate), userTimeZone), "EEEE, MMMM d")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(toZonedTime(new Date(event.startDate), userTimeZone), "h:mm a")}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ends</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {format(toZonedTime(new Date(event.endDate), userTimeZone), "EEEE, MMMM d")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(toZonedTime(new Date(event.endDate), userTimeZone), "h:mm a")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logistics">
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                    {event.venueName && (
                      <p className="text-sm text-muted-foreground">{event.venueName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Timeline</p>
                    <p className="text-sm text-muted-foreground">
                      Starts{" "}
                      {format(
                        toZonedTime(new Date(event.startDate), userTimeZone),
                        "MMM d, h:mm a"
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ends{" "}
                      {format(toZonedTime(new Date(event.endDate), userTimeZone), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Price</p>
                  <p className="text-sm text-muted-foreground">
                    {isFree ? "Free" : `${event.currency} ${event.price.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Seat availability</span>
                  <span>{availabilityPercent}% open</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                  <div
                    className="h-full bg-[#1E5A55]"
                    style={{ width: `${availabilityPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.availableSeats} seats remaining out of {event.capacity}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
