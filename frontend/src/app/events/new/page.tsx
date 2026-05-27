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
      
      // Navigate without scrolling
      router.push(`/events/${event.id}`);
      
      // Optional: Show success modal instead of navigation
      // setSubmitNotice("Event created! Redirecting...");
      // setTimeout(() => router.push(`/events/${event.id}`), 1500);
    } catch (error) {
      console.error("Failed to create event:", error);
      const message = error instanceof Error ? error.message : "Failed to create event.";
      toast.error(message);
      setSubmitNotice(null);
      setSubmitError(message);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated || !isHost) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#060810]">
      <div className="container max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <Link href="/events">
          <Button variant="ghost" className="mb-5 text-white/50 hover:text-white hover:bg-white/[0.05]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        <PageHeader
          badge={
            <Badge className="border-white/[0.10] bg-white/[0.05] text-white/55 text-xs font-bold uppercase tracking-wider">
              New Event
            </Badge>
          }
          title="Create New Event"
          description="Fill in the details below to craft your next great event."
        />

        <div className="mt-6 md:mt-8">
          <EventForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitNotice={submitNotice}
            submitError={submitError}
          />
        </div>
      </div>
    </main>
  );
}
