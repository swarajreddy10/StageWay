"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { fetchHostAnalytics } from "@/lib/analytics-api";
import { HostAnalyticsDashboard } from "@/components/analytics/HostAnalyticsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { HostAnalytics } from "@/types/analytics";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [analytics, setAnalytics] = useState<HostAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    const loadAnalytics = async () => {
      if (!isAuthenticated || !isHost) return;

      setIsLoading(true);
      try {
        const data = await fetchHostAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isHost) {
      loadAnalytics();
    }
  }, [isAuthenticated, isHost]);

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
              Create events to view analytics. Analytics will be available once you have events
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
        <h1 className="font-display text-3xl font-bold">Host Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive insights into your events performance and audience engagement.
        </p>
      </div>

      <HostAnalyticsDashboard analytics={analytics} />
    </main>
  );
}
