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
        await navigator.share({ title: event.name, text: event.description, url: window.location.href });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddToCalendar = () => {
    const start = new Date(event.startDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end   = new Date(event.endDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1018]">
        <div className="relative h-56 w-full sm:h-72 lg:h-[380px]">
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
            <div className="flex h-full items-center justify-center bg-[#0e1018]">
              <Calendar className="h-16 w-16 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/75" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {isSoldOut && (
                <Badge variant="destructive" className="border border-white/20 text-[10px]">Sold Out</Badge>
              )}
              {event.category && (
                <Badge className="border border-white/20 bg-white/10 text-white text-[10px]">{event.category}</Badge>
              )}
              <Badge className="border border-white/20 bg-white/10 text-white text-[10px]">
                {isFree ? "Free entry" : `${event.currency} ${event.price.toFixed(2)}`}
              </Badge>
            </div>
            <div className="flex gap-1.5">
              {canEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Edit event"
                  onClick={() => (window.location.href = `/events/${event.id}/edit`)}
                  className="h-8 w-8 rounded-full border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-black/50 active:scale-[0.97]"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                aria-label="Share event"
                onClick={handleShare}
                className="h-8 w-8 rounded-full border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-black/50 active:scale-[0.97]"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Add to calendar"
                onClick={handleAddToCalendar}
                className="h-8 w-8 rounded-full border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-black/50 active:scale-[0.97]"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-xl font-bold text-white sm:text-2xl lg:text-3xl leading-tight">
              {event.name}
            </h1>
            <p className="max-w-2xl text-sm text-white/65 leading-relaxed">{event.description}</p>
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {event.tags.map((tag) => (
                  <Badge key={tag} className="border border-white/15 bg-white/10 text-[10px] text-white/70">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Calendar,
            title: "Date & Time",
            sub: "Start to finish",
            content: `${format(toZonedTime(new Date(event.startDate), userTimeZone), "EEE, MMM d")} · ${format(toZonedTime(new Date(event.startDate), userTimeZone), "h:mm a")} – ${format(toZonedTime(new Date(event.endDate), userTimeZone), "h:mm a")}`,
          },
          {
            icon: MapPin,
            title: "Location",
            sub: "Where to show up",
            content: event.venueName ? `${event.venueName}, ${event.location}` : event.location,
          },
        ].map(({ icon: Icon, title, sub, content }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#0e1018] p-4 transition-colors duration-200 hover:border-white/[0.12]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
              <Icon className="h-4 w-4 text-white/40" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-none mb-0.5">{title}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">{sub}</p>
              <p className="text-sm text-white/55 leading-snug">{content}</p>
            </div>
          </div>
        ))}

        {/* Seats card */}
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#0e1018] p-4 transition-colors duration-200 hover:border-white/[0.12]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
            <Users className="h-4 w-4 text-white/40" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none mb-0.5">Seats</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Availability</p>
            <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
              <span>{event.availableSeats} of {event.capacity} left</span>
              <span>{availabilityPercent}% open</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-[#7c5af5]" style={{ width: `${availabilityPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex h-auto w-full items-center gap-1 overflow-x-auto whitespace-nowrap rounded-xl border border-white/[0.07] bg-[#0e1018] p-1">
          {[
            { value: "overview",  icon: Tags,       label: "Overview" },
            { value: "logistics", icon: MapPin,      label: "Logistics" },
            { value: "tickets",   icon: DollarSign,  label: "Tickets" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-white/40 transition-all data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-3">
          <div className="rounded-xl border border-white/[0.07] bg-[#0e1018] p-5 space-y-4">
            <p className="text-sm text-white/55 leading-relaxed">{event.description}</p>
            <div className="h-px bg-white/[0.06]" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Starts", date: event.startDate },
                { label: "Ends",   date: event.endDate },
              ].map(({ label, date }) => (
                <div key={label} className="rounded-lg border border-white/[0.06] bg-[#141720] p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-2">{label}</p>
                  <p className="text-sm font-semibold text-white">
                    {format(toZonedTime(new Date(date), userTimeZone), "EEEE, MMMM d")}
                  </p>
                  <p className="text-sm text-white/45">
                    {format(toZonedTime(new Date(date), userTimeZone), "h:mm a")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logistics" className="mt-3">
          <div className="rounded-xl border border-white/[0.07] bg-[#0e1018] p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.07]">
                  <MapPin className="h-4 w-4 text-white/35" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Location</p>
                  <p className="text-sm text-white/45">{event.location}</p>
                  {event.venueName && <p className="text-sm text-white/45">{event.venueName}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.07]">
                  <Calendar className="h-4 w-4 text-white/35" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Timeline</p>
                  <p className="text-sm text-white/45">
                    Starts {format(toZonedTime(new Date(event.startDate), userTimeZone), "MMM d, h:mm a")}
                  </p>
                  <p className="text-sm text-white/45">
                    Ends {format(toZonedTime(new Date(event.endDate), userTimeZone), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-3">
          <div className="rounded-xl border border-white/[0.07] bg-[#0e1018] p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.07]">
                <DollarSign className="h-4 w-4 text-white/35" />
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-0.5">Price</p>
                <p className="text-sm text-white/45">
                  {isFree ? "Free" : `${event.currency} ${event.price.toFixed(2)}`}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/35">
                <span>Seat availability</span>
                <span>{availabilityPercent}% open</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-[#7c5af5]" style={{ width: `${availabilityPercent}%` }} />
              </div>
              <p className="text-xs text-white/30">{event.availableSeats} seats remaining out of {event.capacity}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
