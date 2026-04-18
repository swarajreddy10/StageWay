import { memo, type ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Registration } from "@/types/registration";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface RegistrationCardProps {
  registration: Registration;
  showQr?: boolean;
  actions?: ReactNode;
  onCancel?: () => void;
}

const STATUS_STYLE: Record<Registration["status"], string> = {
  CONFIRMED:  "bg-white/[0.08] text-white/75  border-white/[0.14]",
  WAITLISTED: "bg-white/[0.05] text-white/50  border-white/[0.09]",
  CANCELLED:  "bg-white/[0.03] text-white/30  border-white/[0.06]",
  EXPIRED:    "bg-white/[0.03] text-white/25  border-white/[0.05]",
};

export const RegistrationCard = memo(function RegistrationCard({ registration, showQr, actions, onCancel }: RegistrationCardProps) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0e1018] overflow-hidden group hover:border-white/[0.14] hover:bg-[#141720] transition-all duration-200">

      <div className="p-5 space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
            {registration.event?.name || "Event"}
          </h3>
          <Badge className={`shrink-0 border text-[10px] font-bold ${STATUS_STYLE[registration.status]}`}>
            {registration.status}
          </Badge>
        </div>

        {/* Details */}
        {registration.event && (
          <div className="space-y-1.5 text-xs text-white/40">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{format(new Date(registration.event.startDate), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{registration.event.location}</span>
            </div>
            {registration.seatNumber && (
              <div className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 shrink-0" />
                <span>Seat {registration.seatNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* QR code */}
        {showQr && registration.qrCode && (
          <div className="border-t border-white/[0.06] pt-4">
            <QRCodeDisplay
              qrCode={registration.qrCode}
              registrationId={registration.id}
              eventName={registration.event?.name}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/registrations/${registration.id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05] text-xs">
              View Pass
            </Button>
          </Link>
          {actions}
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              aria-label="Cancel registration"
              className="border border-white/[0.10] text-white/40 hover:bg-white/[0.05] hover:text-white/70 text-xs"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
