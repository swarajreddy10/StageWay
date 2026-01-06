"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Registration } from "@/types/registration";
import { fetchEventAttendees } from "@/lib/event-api";
import { checkInRegistration } from "@/lib/registration-api";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params.id);
  const { isAuthenticated, user } = useAuthStore();
  const { currentEvent, isLoading: eventLoading, fetchEvent } = useEvents();
  const { registerForEvent, isLoading: registrationLoading } = useRegistrations();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const qrSectionRef = useRef<HTMLDivElement | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [registrationTone, setRegistrationTone] = useState<"error" | "success">("success");

  const canEdit = user?.role === "HOST";
  const canRegister = !canEdit;

  useEffect(() => {
    if (eventId && !isNaN(eventId)) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent]);

  const fetchAttendees = useCallback(async () => {
    if (!canEdit || !eventId) {
      return;
    }
    setAttendeesLoading(true);
    try {
      const data = await fetchEventAttendees(eventId);
      setAttendees(
        data.map((attendee) => ({
          id: attendee.registrationId,
          registrationId: attendee.registrationId,
          fullName: attendee.fullName,
          email: attendee.email,
          status: attendee.status,
          seatNumber: attendee.seatNumber ? String(attendee.seatNumber) : null,
          registeredAt: attendee.registeredAt,
          checkedInAt: attendee.checkedInAt ?? null,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch attendees:", error);
    } finally {
      setAttendeesLoading(false);
    }
  }, [canEdit, eventId]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const handleRegister = async (data: { eventId: number; seatNumber?: string }) => {
    setRegistrationMessage(null);
    try {
      const newRegistration = await registerForEvent(data);
      setRegistration(newRegistration);
      setShowRegistrationForm(false);
      setRegistrationTone("success");
      setRegistrationMessage("Registration complete. Scroll down to your QR pass.");
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationTone("error");
      setRegistrationMessage(
        error instanceof Error ? error.message : "Registration failed. Please try again."
      );
    }
  };

  const hasRegistration = canRegister && registration !== null;

  if (eventLoading) {
    return (
      <main className="container mx-auto flex items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!currentEvent) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Event not found</h1>
          <Link href="/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto min-h-screen px-4 pb-16 pt-8">
      <Link href="/events">
        <Button variant="outline" className="mb-6 border-white/70 bg-white/70 hover:bg-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="space-y-6">
        <EventDetails event={currentEvent} canEdit={canEdit} />

        {canRegister && (
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Badge className="border border-white/70 bg-white/80 text-foreground">
                  Tickets
                </Badge>
                <h2 className="text-lg font-semibold text-foreground">
                  {hasRegistration ? "You're registered" : "Reserve your spot"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentEvent.price === 0
                    ? "Free entry"
                    : `${currentEvent.currency} ${currentEvent.price.toFixed(2)}`}{" "}
                  ·{" "}
                  {currentEvent.availableSeats === 0
                    ? "Sold out"
                    : `${currentEvent.availableSeats} seats left`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {hasRegistration ? (
                  <Button
                    variant="outline"
                    className="border-white/70 bg-white/70 hover:bg-white"
                    onClick={() =>
                      qrSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  >
                    View QR Pass
                  </Button>
                ) : !isAuthenticated ? (
                  <Link href="/auth/signin">
                    <Button className="bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]">
                      Sign In to Register
                    </Button>
                  </Link>
                ) : currentEvent.availableSeats === 0 ? (
                  <div className="min-w-[220px]">
                    <WaitlistButton eventId={eventId} />
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowRegistrationForm(true)}
                    className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
                  >
                    Register Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {canRegister && registrationMessage && (
          <div
            className={`rounded-2xl border border-white/70 px-4 py-3 text-sm shadow-sm ${
              registrationTone === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {registrationMessage}
          </div>
        )}

        {canRegister && showRegistrationForm && isAuthenticated && !hasRegistration && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Complete registration</h3>
                <p className="text-sm text-muted-foreground">
                  Add attendee details to finalize your tickets.
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowRegistrationForm(false)}
              >
                Close
              </Button>
            </div>
            <RegistrationForm
              eventId={eventId}
              availableSeats={currentEvent.availableSeats}
              onSubmit={handleRegister}
              isLoading={registrationLoading}
            />
          </div>
        )}

        {canRegister && registration?.qrCode && (
          <div ref={qrSectionRef}>
            <QRCodeDisplay
              qrCode={registration.qrCode}
              registrationId={registration.id}
              eventName={currentEvent.name}
            />
          </div>
        )}

        {canEdit && (
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Host tools</h3>
                <p className="text-sm text-muted-foreground">
                  Manage check-ins and registrations for this event.
                </p>
              </div>
              <Link href="/check-in">
                <Button className="bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]">
                  Open Check-In
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {canEdit && (
          <AttendeeList
            attendees={attendees}
            isLoading={attendeesLoading}
            onCheckIn={async (registrationId) => {
              await checkInRegistration(registrationId);
              await fetchAttendees();
            }}
          />
        )}
      </div>
    </main>
  );
}
