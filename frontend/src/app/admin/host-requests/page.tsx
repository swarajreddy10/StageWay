"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { fetchHostAccessRequests, reviewHostAccessRequest } from "@/lib/host-requests-api";
import type {
  HostAccessRequestAdmin,
  HostAccessRequestDecisionPayload,
  HostAccessRequestStatus,
} from "@/types/host-requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type FilterStatus = HostAccessRequestStatus | "ALL";

const STATUS_STYLE: Record<HostAccessRequestStatus, { badge: string; icon: React.ReactNode }> = {
  PENDING:  { badge: "bg-white/[0.08] text-white/70 border-white/[0.15]",  icon: <Clock       className="h-3 w-3" /> },
  APPROVED: { badge: "bg-white/[0.06] text-white/60 border-white/[0.12]",  icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { badge: "bg-white/[0.03] text-white/35 border-white/[0.07]",  icon: <XCircle     className="h-3 w-3" /> },
};

export default function AdminHostRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [filter, setFilter] = useState<FilterStatus>("PENDING");
  const [requests, setRequests] = useState<HostAccessRequestAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const isAdmin = user?.role === "ADMIN";

  const loadRequests = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const status = filter === "ALL" ? undefined : filter;
      setRequests(await fetchHostAccessRequests(status));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load requests.");
    } finally {
      setIsLoading(false);
    }
  }, [filter, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) { router.push("/auth/signin"); return; }
    if (!isAdmin) { router.push("/dashboard"); }
  }, [isAuthenticated, isHydrated, isAdmin, router]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleDecision = async (requestId: number, status: HostAccessRequestDecisionPayload["status"]) => {
    setActionId(requestId);
    try {
      await reviewHostAccessRequest(requestId, { status });
      await loadRequests();
      toast.success(status === "APPROVED" ? "Host access approved." : "Host access rejected.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to update request.";
      setError(msg);
      toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  const tabs = useMemo<FilterStatus[]>(() => ["PENDING", "APPROVED", "REJECTED", "ALL"], []);

  if (!isHydrated) return (
    <main className="flex min-h-screen items-center justify-center bg-[#060810]">
      <Loader2 className="h-8 w-8 animate-spin text-white/20" />
    </main>
  );
  if (!isAuthenticated || !isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#060810]">
      {/* Header */}
      <div className="border-b border-white/[0.07]">
        <div className="container px-4 py-8 md:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-1 flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                <ShieldCheck className="h-4 w-4 text-white/50" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-white">Host Requests</h1>
                  <Badge className="bg-white/[0.06] text-white/50 border-white/[0.10] text-[10px] font-bold">ADMIN</Badge>
                </div>
                <p className="text-sm text-white/40">Review submissions and approve qualified organizers.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-8">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
          <TabsList className="mb-6 w-full overflow-x-auto rounded-lg border border-white/[0.07] bg-white/[0.04] p-0.5">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm capitalize text-white/40 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white"
              >
                {tab === "ALL" ? "All" : tab.toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white/50">{error}</div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-7 w-7 animate-spin text-white/20" />
                </div>
              ) : requests.length === 0 ? (
                <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-12 text-center">
                  <Users className="h-10 w-10 text-white/15 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">No host access requests for this filter.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {requests.map((req, i) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="rounded-xl border border-white/[0.08] bg-[#0e1018] overflow-hidden hover:border-white/[0.14] transition-colors duration-200"
                    >
                      {/* Status accent line */}
                      <div className={`h-px w-full ${req.status === "APPROVED" ? "bg-white/25" : req.status === "REJECTED" ? "bg-white/[0.08]" : "bg-white/40"}`} />

                      <div className="p-5 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-white">{req.fullName || "Unknown user"}</h3>
                            <p className="text-sm text-white/40 mt-0.5">{req.email || "No email"}</p>
                          </div>
                          <Badge className={`flex items-center gap-1 border text-[10px] font-bold ${STATUS_STYLE[req.status].badge}`}>
                            {STATUS_STYLE[req.status].icon}
                            {req.status.toLowerCase()}
                          </Badge>
                        </div>

                        {/* Fields */}
                        <div className="space-y-3">
                          {req.note && (
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Request Note</p>
                              <p className="text-sm text-white/60">{req.note}</p>
                            </div>
                          )}
                          {req.companyName && (
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Organization</p>
                              <p className="text-sm text-white/60">{req.companyName}</p>
                            </div>
                          )}
                          {req.eventPlan && (
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Event Plan</p>
                              <p className="text-sm text-white/60 whitespace-pre-wrap">{req.eventPlan}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {req.status === "PENDING" && (
                          <div className="grid gap-3 pt-1 sm:grid-cols-2">
                            <Button
                              size="sm"
                              disabled={actionId === req.id}
                              onClick={() => handleDecision(req.id, "APPROVED")}
                              className="w-full justify-center bg-violet-600 text-xs font-semibold text-white shadow-btn-white hover:bg-violet-500"
                            >
                              {actionId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                                <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Approve</>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={actionId === req.id}
                              onClick={() => handleDecision(req.id, "REJECTED")}
                              className="w-full justify-center border border-white/[0.12] text-xs text-white/45 hover:bg-white/[0.05] hover:text-white/70"
                            >
                              <XCircle className="mr-1.5 h-3.5 w-3.5" />Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
