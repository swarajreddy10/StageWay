"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Users, Search, CheckCircle2, Loader2, ScanLine, Zap } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCheckInSocket } from "@/hooks/useCheckInSocket";
import { QRScanner } from "@/components/checkin/QRScanner";
import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { fetchEventAttendees, fetchHostEvents as fetchHostEventsApi } from "@/lib/event-api";
import { checkInRegistration } from "@/lib/registration-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Event } from "@/types/event";
import type { Attendee } from "@/components/checkin/AttendeeList";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CheckInPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [hostEvents, setHostEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [lastScan, setLastScan] = useState<{ name: string; success: boolean } | null>(null);

  const isHost = user?.role === "HOST";
  const isAdmin = user?.role === "ADMIN";
  const { token } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) { router.push("/auth/signin"); return; }
    if (isAdmin) { router.push("/admin/host-requests"); return; }
    if (!isHost) { router.push("/host/request"); }
  }, [isAuthenticated, isHydrated, isHost, isAdmin, router]);

  // Real-time check-in updates via WebSocket
  useCheckInSocket(selectedEventId, (broadcast) => {
    setAttendees((prev) =>
      prev.map((a) =>
        a.registrationId === broadcast.registrationId
          ? { ...a, checkedInAt: broadcast.checkedInAt, status: "CHECKED_IN" }
          : a
      )
    );
    setLastScan({ name: broadcast.attendeeName, success: true });
  }, token);

  const fetchAttendees = useCallback(async (id: number) => {
    if (!isAuthenticated) return;
    setAttendeesLoading(true);
    try {
      const data = await fetchEventAttendees(id);
      setAttendees(data.map((a) => ({
        id: a.registrationId,
        registrationId: a.registrationId,
        fullName: a.fullName,
        email: a.email,
        status: a.status,
        seatNumber: a.seatNumber ? String(a.seatNumber) : null,
        registeredAt: a.registeredAt,
        checkedInAt: a.checkedInAt ?? null,
      })));
      setSelectedEventId(id);
    } catch {
      toast.error("Failed to fetch attendees");
    } finally {
      setAttendeesLoading(false);
    }
  }, [isAuthenticated]);

  const handleScanSuccess = async (decodedText: string) => {
    if (!isAuthenticated) return;
    try {
      const response = await apiClient.post<{ registration: { user?: { fullName?: string } } }>(
        API_ROUTES.checkins,
        { qrData: decodedText }
      );
      const name = response.registration?.user?.fullName || "Attendee";
      setLastScan({ name, success: true });
      toast.success(`${name} checked in!`);
      if (selectedEventId) await fetchAttendees(selectedEventId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Check-in failed";
      setLastScan({ name: message, success: false });
      toast.error(message);
    }
  };

  const loadHostEvents = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await fetchHostEventsApi();
      setHostEvents(data);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  const handleManualCheckIn = async (registrationId: number) => {
    setCheckingIn(registrationId);
    try {
      await checkInRegistration(registrationId);
      if (selectedEventId) await fetchAttendees(selectedEventId);
      toast.success("Checked in successfully!");
    } catch {
      toast.error("Manual check-in failed");
    } finally {
      setCheckingIn(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isHost) loadHostEvents();
  }, [loadHostEvents, isAuthenticated, isHost]);

  if (!isHydrated) return (
    <main className="flex min-h-screen items-center justify-center bg-[#060810]">
      <Loader2 className="h-6 w-6 animate-spin text-white/20" />
    </main>
  );
  if (!isAuthenticated || !isHost) return null;

  const checkedInCount = attendees.filter((a) => a.checkedInAt).length;
  const filtered = attendees.filter((a) =>
    a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#060810]">
      {/* Header */}
      <div className="border-b border-white/[0.07]">
        <div className="container px-4 py-8 md:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                <QrCode className="h-4 w-4 text-white/50" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">Check-In Management</h1>
                <p className="mt-1 text-sm text-white/40">Scan QR codes or manually check in attendees.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Tabs defaultValue="scanner">
            <TabsList className="mb-6 w-full overflow-x-auto whitespace-nowrap rounded-lg border border-white/[0.07] bg-white/[0.04] p-0.5">
              {[
                { value: "scanner", label: "QR Scanner", icon: <ScanLine className="h-3.5 w-3.5" /> },
                { value: "manual",  label: "Manual Check-In", icon: <Users className="h-3.5 w-3.5" /> },
              ].map(({ value, label, icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-white/40 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
                >
                  {icon}{label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Scanner tab */}
            <TabsContent value="scanner">
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Scanner card */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-sm font-medium text-white/70">Scanner Active</span>
                  </div>

                  {/* Scan frame */}
                  <div className="relative mx-auto max-w-sm">
                    <div className="relative overflow-hidden rounded-xl border border-white/[0.12] bg-[#060810]">
                      {/* Corner accents */}
                      <div className="pointer-events-none absolute inset-0 z-10">
                        <div className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-white/35 rounded-tl-sm" />
                        <div className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-white/35 rounded-tr-sm" />
                        <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-white/35 rounded-bl-sm" />
                        <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-white/35 rounded-br-sm" />
                        {/* Scan line */}
                        <motion.div
                          className="absolute left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
                          animate={{ top: ["15%", "85%", "15%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <QRScanner onScanSuccess={handleScanSuccess} />
                    </div>
                  </div>

                  <p className="text-center text-xs text-white/30">
                    Point camera at attendee&apos;s QR code pass
                  </p>
                </div>

                {/* Scan result panel */}
                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {lastScan && (
                      <motion.div
                        key={lastScan.name}
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="rounded-lg border border-white/[0.09] bg-[#0e1018] p-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04]">
                            {lastScan.success
                              ? <CheckCircle2 className="h-4 w-4 text-white/70" />
                              : <Zap className="h-4 w-4 text-white/40" />
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-white/80">
                              {lastScan.success ? "Check-in successful!" : "Check-in failed"}
                            </p>
                            <p className="text-xs text-white/50 mt-0.5">{lastScan.name}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Event selector for scanner */}
                  <div className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-5 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Event</p>
                    {hostEvents.length === 0 ? (
                      <p className="text-sm text-white/40">No hosted events yet.</p>
                    ) : (
                      <Select
                        value={selectedEventId ? String(selectedEventId) : ""}
                        onValueChange={(v) => fetchAttendees(Number(v))}
                      >
                        <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white text-sm">
                          <SelectValue placeholder="Select event…" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0e1018] border-white/[0.08]">
                          {hostEvents.map((e) => (
                            <SelectItem key={e.id} value={String(e.id)} className="text-white/80 focus:bg-white/[0.06] focus:text-white">
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Live stats */}
                  {selectedEventId && (
                    <div className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-5 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Live Stats</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-white/50 text-sm">Checked in</span>
                        <span className="font-display font-bold text-white text-xl">{checkedInCount}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-white/50 text-sm">Total registered</span>
                        <span className="font-display font-bold text-white text-xl">{attendees.length}</span>
                      </div>
                      {attendees.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-white/30">
                            <span>Check-in rate</span>
                            <span>{Math.round((checkedInCount / attendees.length) * 100)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-[#7c5af5]"
                              initial={{ width: 0 }}
                              animate={{ width: `${(checkedInCount / attendees.length) * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Manual tab */}
            <TabsContent value="manual">
              <div className="space-y-5">
                {/* Event selector */}
                <div className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Select Event</p>
                  {hostEvents.length === 0 ? (
                    <p className="text-sm text-white/40">No hosted events yet. Create an event to manage attendees.</p>
                  ) : (
                    <Select
                      value={selectedEventId ? String(selectedEventId) : ""}
                      onValueChange={(v) => fetchAttendees(Number(v))}
                    >
                      <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white text-sm max-w-sm">
                        <SelectValue placeholder="Choose an event…" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0e1018] border-white/[0.08]">
                        {hostEvents.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)} className="text-white/80 focus:bg-white/[0.06] focus:text-white">
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Attendee list */}
                {selectedEventId && (
                  <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">Attendees</h3>
                        <Badge className="bg-white/[0.06] text-white/50 border-none text-[10px]">{attendees.length}</Badge>
                        {checkedInCount > 0 && (
                          <Badge className="bg-white/[0.06] text-white/45 border-white/[0.09] text-[9px]">
                            {checkedInCount} in
                          </Badge>
                        )}
                      </div>
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search attendees…"
                          className="w-full pl-8 pr-4 py-1.5 rounded-md bg-[#0e1018] border border-white/[0.09] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20"
                        />
                      </div>
                    </div>

                    {attendeesLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-white/20" />
                      </div>
                    ) : filtered.length === 0 ? (
                      <div className="py-12 text-center text-white/30 text-sm">No attendees found</div>
                    ) : (
                      <div className="divide-y divide-white/[0.04]">
                        {filtered.map((attendee) => (
                          <motion.div
                            key={attendee.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-white text-sm">{attendee.fullName}</p>
                                {attendee.checkedInAt ? (
                                          <Badge className="bg-white/[0.08] text-white/65 border-white/[0.12] text-[9px] gap-1">
                                    <CheckCircle2 className="h-2.5 w-2.5" />Checked In
                                  </Badge>
                                ) : (
                                  <Badge className="bg-white/[0.06] text-white/40 border-white/[0.08] text-[10px]">Pending</Badge>
                                )}
                              </div>
                              <p className="text-xs text-white/40 mt-0.5">{attendee.email}</p>
                              <div className="flex gap-3 mt-1 text-[11px] text-white/25">
                                {attendee.seatNumber && <span>Seat {attendee.seatNumber}</span>}
                                <span>Reg. {format(new Date(attendee.registeredAt), "MMM d, yyyy")}</span>
                                {attendee.checkedInAt && (
                                  <span className="text-white/30">
                                    In at {format(new Date(attendee.checkedInAt), "h:mm a")}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!attendee.checkedInAt && (
                              <Button
                                size="sm"
                                onClick={() => handleManualCheckIn(attendee.registrationId)}
                                disabled={checkingIn === attendee.registrationId}
                                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shrink-0 shadow-btn-white"
                              >
                                {checkingIn === attendee.registrationId ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : "Check In"}
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
