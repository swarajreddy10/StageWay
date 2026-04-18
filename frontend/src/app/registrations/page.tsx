"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, Calendar, Loader2 } from "lucide-react";
import { RegistrationGridSkeleton } from "@/components/registration/RegistrationCardSkeleton";
import Link from "next/link";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrationCard } from "@/components/registration/RegistrationCard";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/shared/EmptyState";

export default function RegistrationsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { registrations, isLoading, cancelRegistration } = useRegistrations();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 9;

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/auth/signin");
  }, [isHydrated, isAuthenticated, router]);

  // Stable "now" so useMemo doesn't re-run on every render
  const now = useMemo(() => new Date(), []);
  const filtered = useMemo(() => {
    switch (activeTab) {
      case "upcoming": return registrations.filter((r) => r.event && new Date(r.event.startDate) > now);
      case "past":     return registrations.filter((r) => r.event && new Date(r.event.startDate) <= now);
      case "cancelled":return registrations.filter((r) => r.status === "CANCELLED");
      default:         return registrations.filter((r) => r.status !== "CANCELLED");
    }
  }, [registrations, activeTab, now]);

  const paginated  = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  if (!isHydrated) return <main className="flex min-h-screen items-center justify-center bg-[#060810]"><Loader2 className="h-8 w-8 animate-spin text-white/20" /></main>;
  if (!isAuthenticated) return null;

  const STATUS_COUNTS: Record<string, number> = {
    all:       registrations.filter((r) => r.status !== "CANCELLED").length,
    upcoming:  registrations.filter((r) => r.event && new Date(r.event.startDate) > now).length,
    past:      registrations.filter((r) => r.event && new Date(r.event.startDate) <= now).length,
    cancelled: registrations.filter((r) => r.status === "CANCELLED").length,
  };

  return (
    <main className="min-h-screen bg-[#060810]">
      {/* Page header */}
      <div className="border-b border-white/[0.06]">
        <div className="container px-4 py-8 md:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-white">My Passes</h1>
              {registrations.length > 0 && (
                <Badge className="bg-white/[0.07] text-white/55 border-white/[0.12] text-[10px] font-bold">
                  {registrations.length}
                </Badge>
              )}
            </div>
            <p className="text-white/40 text-sm">Your event registrations and QR passes.</p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-8">
        {isLoading ? (
          <RegistrationGridSkeleton count={9} />
        ) : registrations.length === 0 ? (
          <EmptyState
            title="No registrations yet"
            description="Register for events to see your passes here."
            icon={<Ticket className="h-10 w-10 text-white/20" />}
            action={<Button asChild className="bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet"><Link href="/events">Browse Events</Link></Button>}
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(0); }}>
              <TabsList className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-0.5 mb-6">
                {[
                  { value: "all",       label: "All" },
                  { value: "upcoming",  label: "Upcoming" },
                  { value: "past",      label: "Past" },
                  { value: "cancelled", label: "Cancelled" },
                ].map(({ value, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 rounded-md px-3 py-1.5 text-sm"
                  >
                    {label}
                    {STATUS_COUNTS[value] > 0 && (
                      <Badge className="ml-1.5 bg-white/[0.08] text-white/50 border-none text-[10px] px-1.5 py-0">
                        {STATUS_COUNTS[value]}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {["all", "upcoming", "past", "cancelled"].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  {paginated.length === 0 ? (
                    <EmptyState
                      title={`No ${tab} registrations`}
                      description={tab === "upcoming" ? "Browse events and register to see them here." : "Nothing here yet."}
                      icon={<Calendar className="h-8 w-8 text-white/20" />}
                      action={tab === "upcoming" ? (
                        <Button asChild variant="ghost" className="border border-white/[0.08] text-white/50 hover:text-white">
                          <Link href="/events">Browse Events</Link>
                        </Button>
                      ) : undefined}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-grid">
                      {paginated.map((r) => (
                        <RegistrationCard
                          key={r.id}
                          registration={r}
                          onCancel={r.status === "CONFIRMED" ? () => cancelRegistration(r.id) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
