"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { createHostAccessRequest, fetchMyHostAccessRequest } from "@/lib/host-requests-api";
import type { HostAccessRequest } from "@/types/host-requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type StatusTone = "pending" | "approved" | "rejected" | "none";

const statusStyleMap: Record<StatusTone, string> = {
  pending:  "bg-white/[0.08] text-white/70 border-white/[0.15]",
  approved: "bg-white/[0.06] text-white/60 border-white/[0.12]",
  rejected: "bg-white/[0.03] text-white/35 border-white/[0.07]",
  none:     "bg-white/[0.04] text-white/40 border-white/[0.08]",
};

const statusIconMap: Record<StatusTone, React.ReactNode> = {
  pending:  <Clock       className="h-3 w-3" />,
  approved: <CheckCircle2 className="h-3 w-3" />,
  rejected: <XCircle    className="h-3 w-3" />,
  none:     null,
};

const statusLabelMap: Record<StatusTone, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  none: "Not requested",
};

export default function HostAccessRequestPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, hydrateUser } = useAuthStore();
  const [request, setRequest] = useState<HostAccessRequest | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [eventPlan, setEventPlan] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [roleRefreshed, setRoleRefreshed] = useState(false);

  const isHost = user?.role === "HOST";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) { router.push("/auth/signin"); return; }
    if (isAuthenticated && isAdmin) { router.push("/admin/host-requests"); }
  }, [isAuthenticated, isHydrated, isAdmin, router]);

  const statusTone: StatusTone = useMemo(() => {
    if (!request) return "none";
    if (request.status === "PENDING") return "pending";
    if (request.status === "APPROVED") return "approved";
    return "rejected";
  }, [request]);

  const canSubmit = !request || request.status === "REJECTED";

  const loadRequest = useCallback(async (showToast = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyHostAccessRequest();
      setRequest(data);
      if (showToast) {
        toast.success(data ? "Status refreshed." : "No host request found yet.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load host request.";
      setError(message);
      if (showToast) { toast.error(message); }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    loadRequest();
  }, [isAuthenticated, isHydrated, loadRequest]);

  useEffect(() => {
    if (!request || request.status !== "APPROVED" || isHost || roleRefreshed) return;
    hydrateUser().finally(() => setRoleRefreshed(true));
  }, [request, isHost, roleRefreshed, hydrateUser]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await createHostAccessRequest({ note, companyName, eventPlan });
      setRequest(response);
      setNotice("Request submitted. We will review it shortly.");
      toast.success("Host request submitted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to submit request.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060810]">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </main>
    );
  }

  if (isHost) {
    return (
      <main className="min-h-screen bg-[#060810]">
        <div className="container px-4 py-16 md:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-10 text-center space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] mx-auto">
                <ShieldCheck className="h-5 w-5 text-white/50" />
              </div>
              <h1 className="font-display text-xl font-bold text-white">You already have host access</h1>
              <p className="text-sm text-white/40">Jump into your host dashboard to manage events.</p>
              <Button asChild className="w-full bg-violet-600 font-semibold text-white shadow-btn-violet hover:bg-violet-500 sm:w-auto">
                <Link href="/host">
                  Go to host dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

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
                <h1 className="font-display text-2xl font-bold text-white">Request Host Access</h1>
                <p className="text-sm text-white/40">Tell us about your event plans and we&apos;ll review your request.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-2xl px-4 py-8 md:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">

          {/* Status card */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">Request Status</p>
              <Badge className={`flex items-center gap-1 border text-[10px] font-bold ${statusStyleMap[statusTone]}`}>
                {statusIconMap[statusTone]}
                {statusLabelMap[statusTone]}
              </Badge>
            </div>
            <p className="text-xs text-white/35">We review requests during business hours and notify you once approved.</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white/50">{error}</div>
          )}
          {notice && (
            <div className="rounded-xl border border-white/[0.10] bg-white/[0.05] p-4 text-sm text-white/65">{notice}</div>
          )}

          {/* Existing request fields */}
          {request && (
            <div className="space-y-3">
              {request.note && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Your note</p>
                  <p className="text-sm text-white/55">{request.note}</p>
                </div>
              )}
              {request.companyName && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Organization</p>
                  <p className="text-sm text-white/55">{request.companyName}</p>
                </div>
              )}
              {request.eventPlan && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Event plan</p>
                  <p className="text-sm text-white/55 whitespace-pre-wrap">{request.eventPlan}</p>
                </div>
              )}
            </div>
          )}

          {/* Form or approved action */}
          {request?.status === "APPROVED" ? (
            <Button asChild className="w-full bg-violet-600 font-semibold text-white shadow-btn-violet hover:bg-violet-500 sm:w-auto">
              <Link href="/host">
                Go to host dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : canSubmit ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/30">Organization / Company</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="StageWay Studios"
                  className="w-full rounded-lg bg-white/[0.04] border border-white/[0.09] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/30">Event plan <span className="text-white/20 normal-case font-normal">(optional)</span></label>
                <textarea
                  value={eventPlan}
                  onChange={(e) => setEventPlan(e.target.value)}
                  placeholder="Tell us about the events you plan to host."
                  rows={4}
                  className="w-full rounded-lg bg-white/[0.04] border border-white/[0.09] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/30">Additional notes <span className="text-white/20 normal-case font-normal">(optional)</span></label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything else we should know?"
                  rows={3}
                  className="w-full rounded-lg bg-white/[0.04] border border-white/[0.09] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors resize-none"
                />
              </div>
              <div className="grid gap-3 pt-1 sm:grid-cols-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="w-full justify-center bg-violet-600 font-semibold text-white shadow-btn-violet hover:bg-violet-500"
                >
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit request"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => loadRequest(true)}
                  disabled={isLoading}
                  className="w-full justify-center border border-white/[0.09] text-sm text-white/45 hover:bg-white/[0.05] hover:text-white"
                >
                  {isLoading ? "Refreshing..." : "Refresh status"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => loadRequest(true)}
              disabled={isLoading}
              className="w-full justify-center border border-white/[0.09] text-sm text-white/45 hover:bg-white/[0.05] hover:text-white sm:w-auto"
            >
              {isLoading ? "Refreshing..." : "Refresh status"}
            </Button>
          )}
        </motion.div>
      </div>
    </main>
  );
}
