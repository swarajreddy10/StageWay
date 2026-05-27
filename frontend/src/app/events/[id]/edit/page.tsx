"use client";

import { EventForm } from "@/components/events/EventForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { useAuthStore } from "@/stores/authStore";
import type { CreateEventRequest } from "@/types/event";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EventEditPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params?.id);
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { currentEvent, isLoading, fetchEvent, updateEvent } = useEvents();
  const isHost = user?.role === "HOST";
  const isAdmin = user?.role === "ADMIN";
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      return;
    }
    if (eventId && !isNaN(eventId)) {
      fetchEvent(eventId);
    }
  }, [isAuthenticated, isHydrated, isHost, isAdmin, eventId, router, fetchEvent]);

  const handleSubmit = async (data: CreateEventRequest) => {
    setSubmitError(null);
    setSubmitNotice("Updating event...");
    try {
      await updateEvent(eventId, data);
      toast.success("Event updated successfully!");
      setSubmitNotice(null);
      // Don't navigate, stay on page
    } catch (error) {
      console.error("Failed to update event:", error);
      const message = error instanceof Error ? error.message : "Failed to update event.";
      toast.error(message);
      setSubmitNotice(null);
      setSubmitError(message);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!isHydrated) return null;

  if (!isAuthenticated || !isHost) return null;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#060810]">
        <div className="container flex items-center justify-center px-4 py-24 md:px-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-white/20" />
            <p className="text-sm text-white/30">Loading event…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentEvent) {
    return (
      <main className="min-h-screen bg-[#060810]">
        <div className="container px-4 py-12 md:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-white">Event not found</h1>
            <Link href="/host">
              <Button variant="ghost" className="text-white/50 hover:text-white">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060810]">
      <div className="container max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" className="mb-5 text-white/50 hover:text-white hover:bg-white/[0.05]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
        </Link>

        <PageHeader
          badge={
            <Badge className="border-white/[0.10] bg-white/[0.05] text-white/55 text-xs font-bold uppercase tracking-wider">
              Edit Event
            </Badge>
          }
          title="Edit Event"
          description={`Update the details for ${currentEvent.name}`}
        />

        <EventForm
          initialData={{
            name: currentEvent.name,
            description: currentEvent.description,
            category: currentEvent.category || undefined,
            startDate: currentEvent.startDate
              ? format(new Date(currentEvent.startDate), "yyyy-MM-dd'T'HH:mm")
              : "",
            endDate: currentEvent.endDate
              ? format(new Date(currentEvent.endDate), "yyyy-MM-dd'T'HH:mm")
              : "",
            location: currentEvent.location,
            venueName: currentEvent.venueName || undefined,
            capacity: currentEvent.capacity,
            price: currentEvent.price,
            currency: currentEvent.currency,
            bannerUrl: currentEvent.bannerUrl || undefined,
            tags: currentEvent.tags || undefined,
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEditMode
          submitNotice={submitNotice}
          submitError={submitError}
        />
      </div>
    </main>
  );
}
