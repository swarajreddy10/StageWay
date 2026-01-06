"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { fetchHostAccessRequests, reviewHostAccessRequest } from "@/lib/host-requests-api";
import type {
  HostAccessRequestAdmin,
  HostAccessRequestDecisionPayload,
  HostAccessRequestStatus,
} from "@/types/host-requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";

type FilterStatus = HostAccessRequestStatus | "ALL";

const statusTone: Record<HostAccessRequestStatus, string> = {
  PENDING: "bg-[#F0B34B]/20 text-[#A46309] border-[#F0B34B]/40",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
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
      const data = await fetchHostAccessRequests(status);
      setRequests(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load requests.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filter, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
    if (isAuthenticated && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isHydrated, isAdmin, router]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleDecision = async (
    requestId: number,
    status: HostAccessRequestDecisionPayload["status"]
  ) => {
    setActionId(requestId);
    try {
      await reviewHostAccessRequest(requestId, { status });
      await loadRequests();
      toast.success(status === "APPROVED" ? "Host access approved." : "Host access rejected.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update request.";
      setError(message);
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const tabs = useMemo<FilterStatus[]>(() => ["PENDING", "APPROVED", "REJECTED", "ALL"], []);

  if (!isHydrated) {
    return (
      <main className="container mx-auto flex items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <PageHeader
        badge={<Badge className="bg-white/80 text-foreground border border-white/70">Admin</Badge>}
        title="Host access requests"
        description="Review host access submissions and approve qualified organizers."
      />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
        <TabsList className="mt-6 flex w-full flex-wrap justify-start gap-2 border border-white/70 bg-white/70">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="gap-2">
              {tab === "ALL" ? "All" : tab.toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filter} className="mt-6 space-y-4">
          {error && (
            <Card className="rounded-2xl border border-rose-200 bg-rose-50/60">
              <CardContent className="py-4 text-sm text-rose-700">{error}</CardContent>
            </Card>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                No host access requests for this filter.
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card
                key={request.id}
                className="rounded-3xl border border-white/70 bg-white/80 shadow-sm"
              >
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-lg">{request.fullName || "Unknown user"}</CardTitle>
                    <Badge className={`border ${statusTone[request.status]}`}>
                      {request.status.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.email || "No email"}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.note && (
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-muted-foreground">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Request note
                      </p>
                      <p className="mt-2">{request.note}</p>
                    </div>
                  )}
                  {request.companyName && (
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-muted-foreground">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Organization
                      </p>
                      <p className="mt-2">{request.companyName}</p>
                    </div>
                  )}
                  {request.eventPlan && (
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-muted-foreground">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Event plan
                      </p>
                      <p className="mt-2 whitespace-pre-wrap">{request.eventPlan}</p>
                    </div>
                  )}
                  {request.status === "PENDING" && (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        disabled={actionId === request.id}
                        className="bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]"
                        onClick={() => handleDecision(request.id, "APPROVED")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        disabled={actionId === request.id}
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDecision(request.id, "REJECTED")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
