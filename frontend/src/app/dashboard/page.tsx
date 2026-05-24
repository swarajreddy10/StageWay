"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, Plus, Zap, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useRegistrations } from "@/hooks/useRegistrations";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrationCard } from "@/components/registration/RegistrationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { fetchEvents } from "@/lib/event-api";
import { EventCard } from "@/components/events/EventCard";
import type { Event } from "@/types/event";

function StatTile({ value, label, sub }: { value: string | number; label: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-5 space-y-1.5">
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="text-sm font-medium text-white/55">{label}</div>
      {sub && <div className="text-[11px] text-white/25">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { registrations, isLoading } = useRegistrations();
  const [suggested, setSuggested] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) { router.push("/auth/signin"); return; }
    if (user?.role === "ADMIN") { router.push("/admin/host-requests"); return; }
    if (user?.role === "HOST") { router.push("/host"); return; }
  }, [isAuthenticated, isHydrated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let live = true;
    setEventsLoading(true);
    fetchEvents(undefined, 6)
      .then((d) => { if (live) setSuggested(d); })
      .catch(() => {})
      .finally(() => { if (live) setEventsLoading(false); });
    return () => { live = false; };
  }, [isAuthenticated]);

  if (!isHydrated) return <main className="flex min-h-screen items-center justify-center bg-[#060810]"><Loader2 className="h-6 w-6 animate-spin text-white/20" /></main>;
  if (!isAuthenticated || !user) return null;

  const now  = new Date();
  const upcoming = registrations.filter((r) => r.event && new Date(r.event.startDate) > now);
  const past     = registrations.filter((r) => r.event && new Date(r.event.startDate) <= now);
  const upcomingEvents = suggested.filter((e) => new Date(e.startDate) > now).slice(0, 6);

  const initials = user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <main className="min-h-screen bg-[#060810]">
      {/* Header */}
      <div className="border-b border-white/[0.07]">
        <div className="container px-4 py-8 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-1 ring-white/10">
                <AvatarFallback className="bg-white/[0.07] text-white/70 font-bold text-sm rounded-full">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-xl font-bold text-white">Welcome back, {user.fullName.split(" ")[0]}</h1>
                <p className="text-xs text-white/40">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" asChild className="border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05] text-sm">
                <Link href="/registrations"><Ticket className="mr-2 h-4 w-4" />My Tickets</Link>
              </Button>
              <Button asChild className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold shadow-btn-violet">
                <Link href="/events"><ArrowRight className="mr-2 h-3.5 w-3.5" />Browse Events</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-8 space-y-10">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <StatTile value={registrations.length} label="Total Registrations" sub="All time" />
          <StatTile value={upcoming.length}       label="Upcoming Events"    sub="On your calendar" />
          <StatTile value={past.length}           label="Events Attended"    sub="Past events" />
        </motion.div>

        {/* Become host CTA */}
        {user.role !== "HOST" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
              <Zap className="h-4 w-4 text-white/50" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">Become a Host</p>
              <p className="text-xs text-white/40">Create and manage your own events on StageWay.</p>
            </div>
            <Button asChild variant="ghost" className="border border-white/[0.09] text-white/50 hover:text-white hover:bg-white/[0.05] shrink-0 text-sm">
              <Link href="/host/request"><Plus className="mr-2 h-4 w-4" />Request Access</Link>
            </Button>
          </motion.div>
        )}

        {/* Schedule tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display font-bold text-white text-lg">Your Schedule</h2>
            <Link href="/registrations" className="text-xs text-white/35 hover:text-white/70 transition-colors">View all →</Link>
          </div>

          <Tabs defaultValue="upcoming">
            <TabsList className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-0.5 mb-5">
              {[
                { value: "upcoming", label: "Upcoming", count: upcoming.length },
                { value: "past",     label: "Past",     count: past.length },
              ].map(({ value, label, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 rounded-md px-4 py-1.5 text-sm transition-all"
                >
                  {label}
                  {count > 0 && (
                    <span className="ml-2 text-[9px] font-mono text-white/30">{count}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-white/20" /></div>
              ) : upcoming.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-grid">
                  {upcoming.map((r) => <RegistrationCard key={r.id} registration={r} />)}
                </div>
              ) : eventsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-white/20" /></div>
              ) : upcomingEvents.length > 0 ? (
                <div>
                  <p className="text-xs text-white/30 mb-4">No upcoming registrations — discover events:</p>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-grid">
                    {upcomingEvents.map((e) => <EventCard key={e.id} event={e} className="max-w-none" />)}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Nothing upcoming"
                  description="Browse events and add something to your calendar."
                  icon={<Sparkles className="h-9 w-9 text-white/20" />}
                  action={<Button asChild className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-btn-white"><Link href="/events">Browse Events</Link></Button>}
                />
              )}
            </TabsContent>

            <TabsContent value="past">
              {past.length === 0 ? (
                <EmptyState title="No past events yet" description="Your attended events will appear here." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-grid">
                  {past.map((r) => <RegistrationCard key={r.id} registration={r} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
