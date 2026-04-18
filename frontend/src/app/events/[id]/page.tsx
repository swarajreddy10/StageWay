"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, MapPin, Users, Ticket, Clock,
  Edit, QrCode, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { EventDetails } from "@/components/events/EventDetails";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { QRCodeDisplay } from "@/components/registration/QRCodeDisplay";
import { WaitlistButton } from "@/components/waitlist/WaitlistButton";
import { AttendeeList, type Attendee } from "@/components/checkin/AttendeeList";
import { useEvents } from "@/hooks/useEvents";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Registration } from "@/types/registration";
import { fetchEventAttendees } from "@/lib/event-api";
import { checkInRegistration } from "@/lib/registration-api";

function formatDate(v: string) {
  return new Date(v).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function formatTime(v: string) {
  return new Date(v).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function EventDetailPage() {
  const params  = useParams();
  const eventId = Number(params?.id);
  const { isAuthenticated, user } = useAuthStore();
  const { currentEvent, isLoading: eventLoading, fetchEvent } = useEvents();
  const { registerForEvent, isLoading: registrationLoading } = useRegistrations();

  const [registration, setRegistration]     = useState<Registration | null>(null);
  const [showForm, setShowForm]             = useState(false);
  const [attendees, setAttendees]           = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [message, setMessage]               = useState<{ text: string; ok: boolean } | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const isHost  = user?.role === "HOST";
  const isAdmin = user?.role === "ADMIN";
  const ownsEvent  = isHost && currentEvent?.organizationId === user?.id;
  const canEdit    = ownsEvent;
  const canRegister = !ownsEvent && !isAdmin;

  useEffect(() => {
    if (eventId && !isNaN(eventId)) fetchEvent(eventId);
  }, [eventId, fetchEvent]);

  const loadAttendees = useCallback(async () => {
    if (!canEdit || !eventId) return;
    setAttendeesLoading(true);
    try {
      const data = await fetchEventAttendees(eventId);
      setAttendees(data.map((a) => ({
        id: a.registrationId, registrationId: a.registrationId,
        fullName: a.fullName, email: a.email, status: a.status,
        seatNumber: a.seatNumber ? String(a.seatNumber) : null,
        registeredAt: a.registeredAt, checkedInAt: a.checkedInAt ?? null,
      })));
    } catch { /* silent */ }
    finally { setAttendeesLoading(false); }
  }, [canEdit, eventId]);

  useEffect(() => { loadAttendees(); }, [loadAttendees]);

  async function handleRegister(data: { eventId: number; seatNumber?: string }) {
    setMessage(null);
    try {
      const reg = await registerForEvent(data);
      setRegistration(reg);
      setShowForm(false);
      setMessage({ text: "Registration complete! Scroll down to your QR pass.", ok: true });
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Registration failed.", ok: false });
    }
  }

  /* ── Loading ─────────────────────────────────────── */
  if (eventLoading) return (
    <main className="flex min-h-screen items-center justify-center bg-[#060810]">
      <Loader2 className="h-8 w-8 animate-spin text-white/20" />
    </main>
  );

  if (!currentEvent) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#060810] px-4">
      <div className="h-14 w-14 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
        <Calendar className="h-7 w-7 text-white/20" />
      </div>
      <p className="text-white/40 font-medium text-sm">Event not found</p>
      <Button variant="ghost" asChild className="text-white/50 hover:text-white border border-white/[0.08] text-sm">
        <Link href="/events"><ArrowLeft className="mr-2 h-3.5 w-3.5" />Back to Events</Link>
      </Button>
    </main>
  );

  const start = currentEvent.startsAt ?? currentEvent.startDate;
  const isFree = !currentEvent.price || currentEvent.price === 0;
  const isSoldOut = currentEvent.availableSeats === 0;

  return (
    <main className="min-h-screen bg-[#060810]">
      {/* Hero banner */}
      <div className="relative h-64 overflow-hidden md:h-80 lg:h-96">
        {currentEvent.bannerImageUrl ? (
          <img src={currentEvent.bannerImageUrl} alt={currentEvent.name} className="h-full w-full object-cover grayscale opacity-60" />
        ) : (
          <div className="h-full w-full bg-[#0e1018]" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Back button */}
        <div className="absolute left-4 top-4 md:left-8">
          <Button variant="ghost" asChild size="sm" className="text-white/70 hover:text-white bg-[#060810]/30 backdrop-blur-sm border border-white/10 hover:bg-[#060810]/50">
            <Link href="/events"><ArrowLeft className="mr-1.5 h-4 w-4" />Events</Link>
          </Button>
        </div>

        {/* Status badges */}
        <div className="absolute right-4 top-4 flex gap-2 md:right-8">
          <Badge className="text-[9px] font-bold uppercase tracking-wider bg-white/[0.08] text-white/50 border-white/[0.12]">
            {currentEvent.status}
          </Badge>
          {canEdit && (
            <Button size="sm" variant="ghost" asChild className="text-white/70 hover:text-white bg-[#060810]/30 backdrop-blur-sm border border-white/10 h-7 px-2 text-xs">
              <Link href={`/events/${eventId}/edit`}><Edit className="mr-1 h-3 w-3" />Edit</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="container px-4 pb-16 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start -mt-8 relative z-10">

          {/* Left — event details */}
          <div className="space-y-6">
            {/* Title + meta */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="font-display text-3xl font-bold text-white leading-tight md:text-4xl">
                {currentEvent.name}
              </h1>

              <div className="flex flex-wrap gap-3 text-sm text-white/50">
                {start && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-white/30" />
                    {formatDate(start)}
                  </div>
                )}
                {start && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-white/30" />
                    {formatTime(start)}
                  </div>
                )}
                {(currentEvent.venueName || currentEvent.location) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-white/30" />
                    {currentEvent.venueName ?? currentEvent.location}
                  </div>
                )}
                {currentEvent.capacity && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-white/40" />
                    {currentEvent.capacity} capacity
                  </div>
                )}
              </div>
            </motion.div>

            {/* EventDetails component (description, tags etc) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <EventDetails event={currentEvent} canEdit={canEdit} />
            </motion.div>

            {/* Host tools */}
            {canEdit && (
              <div className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-5 space-y-3">
                <h3 className="font-semibold text-white text-sm">Host Tools</h3>
                <p className="text-xs text-white/40">Manage check-ins and registrations for this event.</p>
                <Button asChild className="bg-violet-600 hover:bg-violet-500 text-white font-semibold w-full sm:w-auto text-sm shadow-btn-white">
                  <Link href="/check-in"><QrCode className="mr-2 h-4 w-4" />Open Check-In</Link>
                </Button>
              </div>
            )}

            {/* Attendee list (host) */}
            {canEdit && (
              <AttendeeList
                attendees={attendees}
                isLoading={attendeesLoading}
                onCheckIn={async (id) => { await checkInRegistration(id); await loadAttendees(); }}
              />
            )}
          </div>

          {/* Right — registration card (sticky) */}
          <div className="lg:sticky lg:top-24 space-y-4">
            {canRegister && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-xl border border-white/[0.09] bg-[#0e1018] p-6 space-y-5"
              >
                {/* Price */}
                <div>
                  <div className="font-display text-3xl font-bold text-white">
                    {isFree ? "Free" : `${currentEvent.currency ?? "$"}${currentEvent.price?.toFixed(2)}`}
                  </div>
                  <p className="text-xs text-white/35 mt-0.5">
                    {isSoldOut ? "Sold out" : `${currentEvent.availableSeats} seats remaining`}
                  </p>
                </div>

                {/* Capacity bar */}
                {currentEvent.capacity && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-white/30">
                      <span>Availability</span>
                      <span>{Math.round(((currentEvent.capacity - currentEvent.availableSeats) / currentEvent.capacity) * 100)}% filled</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(((currentEvent.capacity - currentEvent.availableSeats) / currentEvent.capacity) * 100)}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full rounded-full bg-[#7c5af5]"
                      />
                    </div>
                  </div>
                )}

                {/* Message */}
                {message && (
                  <div className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
                    message.ok
                      ? "bg-white/[0.06] border border-white/[0.12] text-white/70"
                      : "bg-white/[0.03] border border-white/[0.08] text-white/45"
                  }`}>
                    {message.ok
                      ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                    {message.text}
                  </div>
                )}

                {/* CTA */}
                {registration ? (
                  <Button
                    onClick={() => qrRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet"
                  >
                    <Ticket className="mr-2 h-4 w-4" />View QR Pass
                  </Button>
                ) : !isAuthenticated ? (
                  <Button asChild className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet">
                    <Link href="/auth/signin">Sign In to Register</Link>
                  </Button>
                ) : isSoldOut ? (
                  <WaitlistButton eventId={eventId} />
                ) : showForm ? (
                  <Button variant="ghost" onClick={() => setShowForm(false)} className="w-full text-white/40 hover:text-white border border-white/[0.08]">
                    Cancel
                  </Button>
                ) : (
                  <Button onClick={() => setShowForm(true)} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet">
                    Register Now
                  </Button>
                )}
              </motion.div>
            )}

            {/* Registration form */}
            {canRegister && showForm && isAuthenticated && !registration && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-5"
              >
                <h3 className="font-semibold text-white text-sm mb-4">Complete Registration</h3>
                <RegistrationForm
                  eventId={eventId}
                  availableSeats={currentEvent.availableSeats}
                  onSubmit={handleRegister}
                  isLoading={registrationLoading}
                />
              </motion.div>
            )}

            {/* QR pass */}
            {canRegister && registration?.qrCode && (
              <div ref={qrRef}>
                <QRCodeDisplay
                  qrCode={registration.qrCode}
                  registrationId={registration.id}
                  eventName={currentEvent.name}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
