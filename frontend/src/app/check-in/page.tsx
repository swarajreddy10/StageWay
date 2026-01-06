"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { QRScanner } from "@/components/checkin/QRScanner";
import { AttendeeList, type Attendee } from "@/components/checkin/AttendeeList";
import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { fetchEventAttendees, fetchHostEvents as fetchHostEventsApi } from "@/lib/event-api";
import { checkInRegistration } from "@/lib/registration-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Event } from "@/types/event";

export default function CheckInPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [hostEvents, setHostEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const isHost = user?.role === "HOST" || user?.role === "ADMIN";

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
    if (isAuthenticated && !isHost) {
      router.push("/host/request");
    }
  }, [isAuthenticated, isHydrated, isHost, router]);

  const fetchAttendees = useCallback(
    async (id: number) => {
      if (!isAuthenticated) return;
      setAttendeesLoading(true);
      try {
        const data = await fetchEventAttendees(id);
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
        setSelectedEventId(id);
      } catch (error) {
        console.error("Failed to fetch attendees:", error);
      } finally {
        setAttendeesLoading(false);
      }
    },
    [isAuthenticated]
  );

  const handleScanSuccess = async (decodedText: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await apiClient.post<{
        registration: { user?: { fullName?: string } };
        checkIn: unknown;
      }>(API_ROUTES.checkins, { qrData: decodedText });

      // Refresh attendees list
      if (selectedEventId) {
        await fetchAttendees(selectedEventId);
      }

      alert(
        `Check-in successful! ${response.registration?.user?.fullName || "Attendee"} checked in.`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Check-in failed";
      alert(`Error: ${message}`);
    }
  };

  const loadHostEvents = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await fetchHostEventsApi();
      setHostEvents(data);
    } catch (error) {
      console.error("Failed to load host events:", error);
    }
  }, [isAuthenticated]);

  const handleManualCheckIn = async (registrationId: number) => {
    try {
      await checkInRegistration(registrationId);
      if (selectedEventId) {
        await fetchAttendees(selectedEventId);
      }
    } catch (error) {
      console.error("Manual check-in failed:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isHost) {
      loadHostEvents();
    }
  }, [loadHostEvents, isAuthenticated, isHost]);

  if (!isHydrated) {
    return (
      <main className="container mx-auto flex items-center justify-center px-4 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated || !isHost) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#1E5A55]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-[#D8573B]/15 blur-3xl" />
        <h1 className="font-display text-3xl font-bold">Check-In Management</h1>
        <p className="mt-2 text-muted-foreground">Scan QR codes or manually check in attendees.</p>
      </div>

      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList className="rounded-full border border-white/70 bg-white/80">
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="manual">Manual Check-In</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <QRScanner onScanSuccess={handleScanSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle>Select Event</CardTitle>
            </CardHeader>
            <CardContent>
              {hostEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hosted events yet. Create an event to manage attendees.
                </p>
              ) : (
                <Select
                  value={selectedEventId ? String(selectedEventId) : ""}
                  onValueChange={(value) => fetchAttendees(Number(value))}
                >
                  <SelectTrigger className="bg-white/90">
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostEvents.map((event) => (
                      <SelectItem key={event.id} value={String(event.id)}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
          {selectedEventId && (
            <AttendeeList
              attendees={attendees}
              isLoading={attendeesLoading}
              onCheckIn={handleManualCheckIn}
            />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
