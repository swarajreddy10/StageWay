"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Plus, BarChart3, QrCode, Loader2, Sparkles } from "lucide-react";
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

function StatTile({ value, label, sub }: { value: string | number; label: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-5 space-y-1.5">
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="text-sm font-medium text-white/55">{label}</div>
      {sub && <div className="text-[11px] text-white/25">{sub}</div>}
    </div>
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

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const pageEvents = filteredEvents.slice(page * pageSize, page * pageSize + pageSize);

  if (!isHydrated) return (
    <main className="flex min-h-screen items-center justify-center bg-[#060810]">
      <Loader2 className="h-6 w-6 animate-spin text-white/20" />
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
                <h1 className="font-display text-2xl font-bold text-white">Create, launch, and track.</h1>
                <p className="text-white/40 text-sm mt-0.5">Manage your events, registrations, and analytics in one place.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button asChild variant="ghost" className="border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05] text-sm">
                  <Link href="/analytics"><BarChart3 className="mr-2 h-4 w-4" />Analytics</Link>
                </Button>
                <Button asChild variant="ghost" className="border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05] text-sm">
                  <Link href="/check-in"><QrCode className="mr-2 h-4 w-4" />Check-In</Link>
                </Button>
                <Button asChild className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-btn-white">
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
          className="grid gap-4 sm:grid-cols-3"
        >
          <StatTile value={stats.totalEvents} label="Total Events" sub={`${stats.publishedEvents} published`} />
          <StatTile value={stats.totalRegistrations} label="Total Registrations" sub="Across all events" />
          <div className="rounded-lg border border-white/[0.08] bg-[#0e1018] p-5 space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white/30" />
              <div className="font-display text-lg font-bold text-white">Quick Actions</div>
            </div>
            <div className="text-[11px] text-white/25 pb-2">Keep momentum going</div>
            <Button asChild variant="ghost" size="sm" className="w-full border border-white/[0.08] text-white/45 hover:text-white text-xs">
              <Link href="/check-in">Go to Check-In</Link>
            </Button>
          </div>
        </motion.div>

        {/* Events list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-white text-lg">My Events</h2>
              <p className="text-xs text-white/30">Track performance and update listings.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="border border-white/[0.08] text-white/50 hover:text-white text-xs">
              <Link href="/events/new"><Plus className="mr-1.5 h-3.5 w-3.5" />New Event</Link>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(0); }}>
            <TabsList className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-0.5 mb-6">
              {[
                { value: "all",       label: "All",       count: myEvents.length },
                { value: "published", label: "Published", count: myEvents.filter((e) => e.status === "PUBLISHED").length },
                { value: "drafts",    label: "Drafts",    count: myEvents.filter((e) => e.status === "DRAFT").length },
                { value: "completed", label: "Completed", count: myEvents.filter((e) => e.status === "COMPLETED" || e.status === "CANCELLED").length },
              ].map(({ value, label, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 rounded-md px-3 py-1.5 text-sm"
                >
                  {label}
                  {count > 0 && (
                    <span className="ml-1.5 text-[9px] font-mono text-white/25">{count}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {["all", "published", "drafts", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-white/20" />
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
