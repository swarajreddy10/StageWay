"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { fetchHostAnalytics } from "@/lib/analytics-api";
import { HostAnalyticsDashboard } from "@/components/analytics/HostAnalyticsDashboard";
import type { HostAnalytics } from "@/types/analytics";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [analytics, setAnalytics] = useState<HostAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    fetchHostAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, isHost]);

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
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                <BarChart3 className="h-4 w-4 text-white/50" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">Host Analytics</h1>
                <p className="mt-1 text-sm text-white/40">
                  Comprehensive insights into your events&apos; performance and audience engagement.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-8">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-white/20" />
          </div>
        ) : !analytics ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-12 text-center">
            <BarChart3 className="h-9 w-9 text-white/15 mx-auto mb-4" />
            <p className="text-white/40 text-sm">Create events to view analytics. Data will appear once you have events with registrations.</p>
          </div>
        ) : (
          <HostAnalyticsDashboard analytics={analytics} />
        )}
      </div>
    </main>
  );
}
