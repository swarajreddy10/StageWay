"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { fetchEventAnalytics } from "@/lib/analytics-api";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { EventAnalytics } from "@/types/analytics";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventId] = useState<number | null>(null);
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

  useEffect(() => {
    const fetchAnalytics = async (id: number) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const data = await fetchEventAnalytics(id);
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && eventId) {
      fetchAnalytics(eventId);
    }
  }, [isAuthenticated, eventId]);

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

  if (isLoading) {
    return (
      <main className="container mx-auto flex items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select an event to view analytics. Analytics will be available once you have events
              with registrations.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#1E5A55]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-[#D8573B]/15 blur-3xl" />
        <h1 className="font-display text-3xl font-bold">Event Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Track your event performance and attendee insights at a glance.
        </p>
      </div>

      <AnalyticsDashboard analytics={analytics} />
    </main>
  );
}
