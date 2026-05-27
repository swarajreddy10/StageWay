"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Plus, BarChart3, QrCode, Loader2, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { fetchAnalyticsOverview } from "@/lib/analytics-api";
import { fetchHostEvents } from "@/lib/event-api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { HostEventCard } from "@/components/events/HostEventCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Event } from "@/types/event";

function StatTile({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="space-y-1.5 rounded-xl border border-white/[0.08] bg-[#0e1018] p-5 transition-colors duration-200 hover:border-white/[0.13]"
    >
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="text-sm font-medium text-white/60">{label}</div>
      {sub && <div className="text-[11px] text-white/30">{sub}</div>}
    </motion.div>
  );
}

export default function HostPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const [stats, setStats] = useState({ totalEvents: 0, publishedEvents: 0, totalRegistrations: 0 });

  const isHost = user?.role === "HOST";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) { router.push("/auth/signin"); return; }
    if (isAdmin) { router.push("/admin/host-requests"); return; }
    if (!isHost) { router.push("/host/request"); }
  }, [isAuthenticated, isHydrated, isHost, isAdmin, router]);

  useEffect(() => {
    if (!isAuthenticated || !isHost) return;

    setIsLoading(true);
    fetchHostEvents()
      .then(setMyEvents)
      .catch(() => {})
      .finally(() => setIsLoading(false));

    fetchAnalyticsOverview()
      .then((d) => setStats({ totalEvents: d.totalEvents, publishedEvents: d.publishedEvents, totalRegistrations: d.totalRegistrations }))
      .catch(() => {});
  }, [isAuthenticated, isHost]);

  const filteredEvents = useMemo(() => {
    switch (activeTab) {
      case "published":  return myEvents.filter((e) => e.status === "PUBLISHED");
      case "drafts":     return myEvents.filter((e) => e.status === "DRAFT");
      case "completed":  return myEvents.filter((e) => e.status === "COMPLETED" || e.status === "CANCELLED");
      default:           return myEvents;
    }
  }, [activeTab, myEvents]);

  const publishedCount = useMemo(() => myEvents.filter((e) => e.status === "PUBLISHED").length, [myEvents]);
  const draftCount = useMemo(() => myEvents.filter((e) => e.status === "DRAFT").length, [myEvents]);
  const completedCount = useMemo(
    () => myEvents.filter((e) => e.status === "COMPLETED" || e.status === "CANCELLED").length,
    [myEvents]
  );

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const pageEvents = filteredEvents.slice(page * pageSize, page * pageSize + pageSize);

  if (!isHydrated) return (
    <main className="flex min-h-screen items-center justify-center bg-[#060810]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-white/20" />
        <p className="text-xs text-white/30">Loading your host dashboard…</p>
      </div>
    </main>
  );
  if (!isAuthenticated || !isHost) return null;

  return (
    <main className="min-h-screen bg-[#060810]">
      {/* Header */}
      <div className="border-b border-white/[0.07]">
        <div className="container px-4 py-8 md:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 border border-white/[0.08] px-2 py-0.5 rounded-full">Host Dashboard</span>
                </div>
                <h1 className="font-display text-2xl font-bold text-white">Create, launch, and grow your events.</h1>
                <p className="mt-0.5 text-sm text-white/40">Everything from publishing to check-ins, in one focused control room.</p>
              </div>
              <div className="grid w-full gap-2 sm:w-auto sm:grid-flow-col sm:auto-cols-max">
                <Button asChild variant="ghost" className="w-full justify-center border border-white/[0.08] text-sm text-white/50 transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:text-white active:scale-[0.99] sm:w-auto">
                  <Link href="/analytics"><BarChart3 className="mr-2 h-4 w-4" />Analytics</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-center border border-white/[0.08] text-sm text-white/50 transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:text-white active:scale-[0.99] sm:w-auto">
                  <Link href="/check-in"><QrCode className="mr-2 h-4 w-4" />Check-In</Link>
                </Button>
                <Button asChild className="w-full justify-center bg-violet-600 text-sm font-semibold text-white shadow-btn-white transition-all duration-200 hover:-translate-y-px hover:bg-violet-500 active:scale-[0.99] sm:w-auto">
                  <Link href="/events/new"><Plus className="mr-2 h-3.5 w-3.5" />Create Event</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-8 space-y-10">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatTile value={stats.totalEvents} label="Total Events" sub={`${publishedCount} currently published`} />
          <StatTile value={stats.totalRegistrations} label="Total Registrations" sub="Across all events" />
          <StatTile value={draftCount} label="Draft Events" sub="Ready to be completed and published" />
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="space-y-2 rounded-xl border border-white/[0.08] bg-[#0e1018] p-5 transition-colors duration-200 hover:border-white/[0.13]"
          >
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-white/35" />
              <p className="text-sm font-semibold text-white/75">Completion Snapshot</p>
            </div>
            <p className="text-xs text-white/35">
              {publishedCount} live · {completedCount} completed
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-[#7c5af5]"
                initial={{ width: 0 }}
                animate={{ width: `${stats.totalEvents > 0 ? Math.round((publishedCount / stats.totalEvents) * 100) : 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-4 transition-colors duration-200 hover:border-white/[0.12]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white/35" />
              <p className="text-sm font-semibold text-white/75">Quick Actions</p>
            </div>
            <div className="grid w-full gap-2 sm:w-auto sm:grid-flow-col sm:auto-cols-max">
              <Button asChild variant="ghost" size="sm" className="w-full border border-white/[0.08] text-white/50 transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:text-white active:scale-[0.99] sm:w-auto">
                <Link href="/events/new"><Plus className="mr-1.5 h-3.5 w-3.5" />Create Event</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full border border-white/[0.08] text-white/50 transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:text-white active:scale-[0.99] sm:w-auto">
                <Link href="/check-in"><QrCode className="mr-1.5 h-3.5 w-3.5" />Go to Check-In</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full border border-white/[0.08] text-white/50 transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:text-white active:scale-[0.99] sm:w-auto">
                <Link href="/analytics"><BarChart3 className="mr-1.5 h-3.5 w-3.5" />View Analytics</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Events list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-white text-lg">My Events</h2>
              <p className="text-xs text-white/30">Track performance, edit details, and manage lifecycle status.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="border border-white/[0.08] text-white/50 text-xs transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:text-white active:scale-[0.99]">
              <Link href="/events/new"><Plus className="mr-1.5 h-3.5 w-3.5" />New Event</Link>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(0); }}>
            <TabsList className="mb-6 w-full overflow-x-auto rounded-lg border border-white/[0.07] bg-white/[0.04] p-0.5">
              {[
                { value: "all",       label: "All",       count: myEvents.length },
                { value: "published", label: "Published", count: publishedCount },
                { value: "drafts",    label: "Drafts",    count: draftCount },
                { value: "completed", label: "Completed", count: completedCount },
              ].map(({ value, label, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-white/40 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
                >
                  {label}
                  <span className="ml-1.5 text-[10px] font-mono text-white/35">{count}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {["all", "published", "drafts", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-white/20" />
                      <p className="text-xs text-white/30">Loading events…</p>
                    </div>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <EmptyState
                    title="No events yet"
                    description="Create your first event to get started."
                    icon={<Calendar className="h-9 w-9 text-white/20" />}
                    action={
                      <Button asChild className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-btn-white">
                        <Link href="/events/new"><Plus className="mr-2 h-3.5 w-3.5" />Create Event</Link>
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-grid">
                      {pageEvents.map((event) => (
                        <HostEventCard key={event.id} event={event} />
                      ))}
                    </div>
                    {filteredEvents.length > pageSize && (
                      <div className="mt-8 flex justify-center">
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
