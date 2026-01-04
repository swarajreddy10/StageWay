import type { ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Registration } from "@/types/registration";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface RegistrationCardProps {
  registration: Registration;
  showQr?: boolean;
  actions?: ReactNode;
}

const statusClassName: Record<Registration["status"], string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  WAITLISTED: "bg-amber-100 text-amber-700 border-amber-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
};

export function RegistrationCard({ registration, showQr, actions }: RegistrationCardProps) {
  return (
    <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{registration.event?.name || "Event"}</CardTitle>
          <Badge className={statusClassName[registration.status]}>{registration.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {registration.event && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(registration.event.startDate), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{registration.event.location}</span>
            </div>
            {registration.seatNumber && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ticket className="h-4 w-4" />
                <span>Seat: {registration.seatNumber}</span>
              </div>
            )}
          </div>
        )}

        {showQr && registration.qrCode && (
          <div className="border-t border-white/60 pt-4">
            <QRCodeDisplay
              qrCode={registration.qrCode}
              registrationId={registration.id}
              eventName={registration.event?.name}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Link href={`/registrations/${registration.id}`} className="flex-1">
            <Button variant="outline" className="w-full border-white/70 bg-white/70 hover:bg-white">
              View Details
            </Button>
          </Link>
          {actions}
        </div>
      </CardContent>
    </Card>
  );
}
