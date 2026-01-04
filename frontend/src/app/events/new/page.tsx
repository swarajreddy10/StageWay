"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/events/EventForm";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import type { CreateEventRequest } from "@/types/event";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";

export default function EventCreatePage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { createEvent, isLoading } = useEvents();
  const isHost = user?.role === "HOST" || user?.role === "ADMIN";

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
    if (isAuthenticated && !isHost) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isHydrated, isHost, router]);

  const handleSubmit = async (data: CreateEventRequest) => {
    try {
      const event = await createEvent(data);
      router.push(`/events/${event.id}`);
    } catch (error) {
      console.error("Failed to create event:", error);
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
        <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </main>
  );
}
