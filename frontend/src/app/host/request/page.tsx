"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
  createHostAccessRequest,
  fetchMyHostAccessRequest,
} from "@/lib/host-requests-api";
import type { HostAccessRequest } from "@/types/host-requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";

type StatusTone = "pending" | "approved" | "rejected" | "none";

const statusToneMap: Record<StatusTone, string> = {
  pending: "bg-[#F0B34B]/20 text-[#A46309] border-[#F0B34B]/40",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  none: "bg-white/80 text-muted-foreground border-white/70",
};

const statusLabelMap: Record<StatusTone, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  none: "Not requested",
};

export default function HostAccessRequestPage() {
  const { user, isAuthenticated, isHydrated, hydrateUser } = useAuthStore();
  const [request, setRequest] = useState<HostAccessRequest | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [roleRefreshed, setRoleRefreshed] = useState(false);

  const isHost = user?.role === "HOST" || user?.role === "ADMIN";

  const statusTone: StatusTone = useMemo(() => {
    if (!request) return "none";
    if (request.status === "PENDING") return "pending";
    if (request.status === "APPROVED") return "approved";
    return "rejected";
  }, [request]);

  const canSubmit = !request || request.status === "REJECTED";

  const loadRequest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyHostAccessRequest();
      setRequest(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load host request.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      return;
    }
    loadRequest();
  }, [isAuthenticated, isHydrated, loadRequest]);

  useEffect(() => {
    if (!request || request.status !== "APPROVED" || isHost || roleRefreshed) {
      return;
    }
    hydrateUser().finally(() => setRoleRefreshed(true));
  }, [request, isHost, roleRefreshed, hydrateUser]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await createHostAccessRequest({ note });
      setRequest(response);
      setNotice("Request submitted. We will review it shortly.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to submit request.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <main className="container mx-auto flex items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto px-4 py-10">
        <PageHeader
          badge={<Badge className="bg-white/80 text-foreground border border-white/70">Host</Badge>}
          title="Host access request"
          description="Sign in to request host access and start creating events."
        />
        <Card className="mt-8 rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              You need an account to request host access.
            </p>
            <Button
              asChild
              className="mt-4 bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
            >
              <Link href="/auth/signin">
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isHost) {
    return (
      <main className="container mx-auto px-4 py-10">
        <PageHeader
          badge={<Badge className="bg-white/80 text-foreground border border-white/70">Host</Badge>}
          title="You already have host access"
          description="Jump into your host dashboard to manage events."
        />
        <Card className="mt-8 rounded-3xl border border-white/70 bg-white/80 shadow-sm">
          <CardContent className="py-10 text-center">
            <Button
              asChild
              className="bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]"
            >
              <Link href="/host">
                Go to host dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <PageHeader
        badge={<Badge className="bg-white/80 text-foreground border border-white/70">Host</Badge>}
        title="Request host access"
        description="Tell us a bit about your event plans and we will review your request."
      />

      <Card className="mt-8 rounded-3xl border border-white/70 bg-white/80 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-xl">Request status</CardTitle>
            <Badge className={`border ${statusToneMap[statusTone]}`}>
              {statusLabelMap[statusTone]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            We review host requests during business hours and notify you once approved.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {notice && (
            <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>
          )}
          {request && request.note && (
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-muted-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Your note
              </p>
              <p className="mt-2">{request.note}</p>
            </div>
          )}
          {request?.status === "APPROVED" ? (
            <Button
              asChild
              className="bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]"
            >
              <Link href="/host">
                Go to host dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              {canSubmit && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Share why you want to host (optional)
                  </label>
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Tell us about the events you plan to host."
                    className="min-h-[120px] bg-white/90"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
                >
                  {isSubmitting ? "Submitting..." : "Submit request"}
                </Button>
                <Button
                  variant="outline"
                  onClick={loadRequest}
                  disabled={isLoading}
                  className="border-white/70 bg-white/70 hover:bg-white"
                >
                  {isLoading ? "Refreshing..." : "Refresh status"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
