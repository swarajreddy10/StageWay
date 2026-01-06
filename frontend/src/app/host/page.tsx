"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { fetchAnalyticsOverview } from "@/lib/analytics-api";
import { fetchHostEvents } from "@/lib/event-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, BarChart3, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types/event";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { HostEventCard } from "@/components/events/HostEventCard";
import { motion } from "framer-motion";
import { fadeUp, pageTransition, staggerContainer } from "@/lib/motion";

export default function HostPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalRegistrations: 0,
  });

  const isHost = user?.role === "HOST";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
    if (isAuthenticated && isAdmin) {
      router.push("/admin/host-requests");
      return;
    }
    if (isAuthenticated && !isHost) {
      router.push("/host/request");
    }
  }, [isAuthenticated, isHydrated, isHost, isAdmin, router]);

  useEffect(() => {
    const loadHostEvents = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const events = await fetchHostEvents();
        setMyEvents(events);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadStats = async () => {
      if (!isAuthenticated) return;

      try {
        const data = await fetchAnalyticsOverview();
        setStats({
          totalEvents: data.totalEvents,
          publishedEvents: data.publishedEvents,
          totalRegistrations: data.totalRegistrations,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    if (isAuthenticated && isHost) {
      loadHostEvents();
      loadStats();
    }
  }, [isAuthenticated, isHost]);

  const filteredEvents = useMemo(() => {
    switch (activeTab) {
      case "published":
        return myEvents.filter((event) => event.status === "PUBLISHED");
      case "drafts":
        return myEvents.filter((event) => event.status === "DRAFT");
      case "completed":
        return myEvents.filter(
          (event) => event.status === "COMPLETED" || event.status === "CANCELLED"
        );
      default:
        return myEvents;
    }
  }, [activeTab, myEvents]);

  if (!isHydrated) {
    return (
      <main className="container mx-auto flex items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated || !isHost) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const pageEvents = filteredEvents.slice(page * pageSize, page * pageSize + pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <PageHeader
        badge={
          <Badge className="bg-white/80 text-foreground border border-white/70">
            Host Dashboard
          </Badge>
        }
        title="Create, launch, and track."
        description="Manage your events, registrations, and analytics in one creative cockpit."
        actions={
          <>
            <Link href="/analytics">
              <Button variant="outline" className="border-white/70 bg-white/70 hover:bg-white">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/events/new">
              <Button className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <StatCard
          label="Total Events"
          value={stats.totalEvents}
          helper={`${stats.publishedEvents} published`}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          accent="sky"
        />
        <StatCard
          label="Total Registrations"
          value={stats.totalRegistrations}
          helper="Across all events"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          accent="coral"
        />
        <StatCard
          label="Quick Actions"
          value="Boost"
          helper="Keep momentum"
          icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
          accent="lime"
          footer={
            <Link href="/check-in">
              <Button
                variant="outline"
                className="w-full border-white/70 bg-white/70 hover:bg-white"
              >
                Go to Check-in
              </Button>
            </Link>
          }
        />
      </div>

      <div className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Events</h2>
            <p className="text-sm text-muted-foreground">Track performance and update listings.</p>
          </div>
          <Link href="/events/new">
            <Button variant="outline" className="border-white/70 bg-white/70 hover:bg-white">
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setPage(0);
          }}
        >
          <TabsList className="flex w-full flex-wrap justify-start gap-2 border border-white/70 bg-white/70">
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                {myEvents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              Published
              <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                {myEvents.filter((event) => event.status === "PUBLISHED").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              Drafts
              <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                {myEvents.filter((event) => event.status === "DRAFT").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completed
              <Badge variant="outline" className="border-white/70 bg-white/80 text-xs">
                {
                  myEvents.filter(
                    (event) => event.status === "COMPLETED" || event.status === "CANCELLED"
                  ).length
                }
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <EmptyState
                title="No events yet"
                description="Create your first event to get started."
                icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
                action={
                  <Link href="/events/new">
                    <Button className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                }
              />
            ) : (
              <>
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  transition={pageTransition}
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {pageEvents.map((event) => (
                    <motion.div key={event.id} variants={fadeUp}>
                      <HostEventCard event={event} />
                    </motion.div>
                  ))}
                </motion.div>
                {filteredEvents.length > pageSize && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
