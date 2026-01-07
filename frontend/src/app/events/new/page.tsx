"use client";

import { EventForm } from "@/components/events/EventForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { useAuthStore } from "@/stores/authStore";
import type { CreateEventRequest } from "@/types/event";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EventCreatePage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { createEvent, isLoading } = useEvents();
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
    }
  }, [isAuthenticated, isHydrated, isHost, isAdmin, router]);

  const handleSubmit = async (data: CreateEventRequest) => {
    setSubmitError(null);
    setSubmitNotice("Creating event...");
    try {
      const event = await createEvent(data);
      toast.success("Event created successfully!");
      
      // Navigate without page reload using shallow routing
      router.push(`/events/${event.id}`, { scroll: false });
      
      // Optional: Show success modal instead of navigation
      // setSubmitNotice("Event created! Redirecting...");
      // setTimeout(() => router.push(`/events/${event.id}`), 1500);
    } catch (error) {
      console.error("Failed to create event:", error);
      const message = error instanceof Error ? error.message : "Failed to create event.";
      toast.error(message);
      setSubmitNotice(null);
      setSubmitError(message);
    }
  };

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated || !isHost) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <Link href="/events">
        <Button variant="outline" className="mb-6 border-white/70 bg-white/70 hover:bg-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <PageHeader
        badge={
          <Badge className="bg-white/80 text-foreground border border-white/70">New Event</Badge>
        }
        title="Create New Event"
        description="Fill in the details below to create your event."
      />

      <div className="mt-8">
        <EventForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitNotice={submitNotice}
          submitError={submitError}
        />
      </div>
    </main>
  );
}
