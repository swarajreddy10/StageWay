import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event } from "@/types/event";

interface HostEventCardProps {
  event: Event;
}

export function HostEventCard({ event }: HostEventCardProps) {
  const availabilityPercent = event.capacity
    ? Math.max(0, Math.min(100, Math.round((event.availableSeats / event.capacity) * 100)))
    : 0;

  return (
    <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">{event.name}</CardTitle>
          <Badge variant={event.status === "PUBLISHED" ? "default" : "secondary"}>
            {event.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(event.startDate), "MMM d, yyyy")}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {event.availableSeats} / {event.capacity} seats
            </span>
          </div>
          <span>{availabilityPercent}% open</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
          <div className="h-full bg-[#1E5A55]" style={{ width: `${availabilityPercent}%` }} />
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button variant="outline" className="w-full border-white/70 bg-white/70 hover:bg-white">
              View
            </Button>
          </Link>
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="outline" className="border-white/70 bg-white/70 hover:bg-white">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
