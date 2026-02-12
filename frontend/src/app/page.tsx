"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Calendar, ChartLine, CheckCircle2, Loader2, Sparkles, Users2 } from "lucide-react";
import Link from "next/link";
import EventCarousel from "../components/EventCarousel";
import HappeningCarousel from "../components/HappeningCarousel";
import HeroSection from "../components/HeroSection";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { fetchEvents } from "../lib/event-api";
import { useBackendStatusStore } from "../hooks/useBackendStatus";
import type { Event } from "@/types/event";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Schedule open";
  }
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const experiencePillars = [
  {
    title: "Event Creation",
    description: "Build professional event pages with custom branding and ticketing in minutes.",
    icon: Calendar,
  },
  {
    title: "Analytics Dashboard",
    description: "Track registrations, revenue, and engagement with real-time insights.",
    icon: ChartLine,
  },
  {
    title: "QR Check-In",
    description: "Seamless entry with QR code scanning and instant attendee verification.",
    icon: CheckCircle2,
  },
];

const flowSteps = [
  {
    title: "Create Your Event",
    description: "Set dates, pricing, capacity, and upload event banners.",
  },
  {
    title: "Manage Registrations",
    description: "Accept registrations, handle waitlists, and send confirmations.",
  },
  {
    title: "Track Performance",
    description: "Monitor check-ins, revenue, and attendee engagement in real-time.",
  },
];

export default function HomePage() {
  const backendStatus = useBackendStatusStore((s) => s.status);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (backendStatus !== "awake" || hasFetched) return;
    setHasFetched(true);

    fetchEvents()
      .then((data) => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setIsLoadingEvents(false));
  }, [backendStatus, hasFetched]);

  const getEventStart = (event: Event) =>
    event.startsAt ?? event.startDate ?? event.createdAt;

  const sorted = [...events].sort(
    (a, b) => new Date(getEventStart(a)).getTime() - new Date(getEventStart(b)).getTime()
  );
  const featured = sorted.slice(0, 8);
  const nextEventLabel = featured[0]
    ? `${featured[0].name} - ${formatDate(getEventStart(featured[0]))}`
    : "Schedule open";

  return (
    <main className="flex-1">
      <HappeningCarousel />

      <HeroSection
        eventCount={events.length}
        upcomingCount={featured.length}
        nextEventLabel={nextEventLabel}
      />

      <section className="relative py-12 md:py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40" />
        <div className="container relative px-4 md:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge className="border-[#1E5A55]/20 bg-[#1E5A55]/10 text-[#1E5A55] font-semibold">
                Featured Events
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                Discover Upcoming Events
              </h2>
              <p className="text-base text-muted-foreground">Browse and register for events happening near you.</p>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-2 border-[#1E5A55]/20 bg-white hover:bg-[#1E5A55]/5 font-semibold"
            >
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {isLoadingEvents ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <EventCarousel events={featured.slice(0, 5)} />
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-8">
          <div className="mb-10 max-w-3xl space-y-3">
            <Badge className="border-[#D8573B]/20 bg-[#D8573B]/10 text-[#D8573B] font-semibold">
              Platform Features
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              Everything You Need to Run Events
            </h2>
            <p className="text-base text-muted-foreground">Professional tools for event management, registration, and analytics.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {experiencePillars.map((pillar) => (
              <Card
                key={pillar.title}
                className="border-2 border-[#1E5A55]/10 bg-gradient-to-br from-white to-[#1E5A55]/5 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="space-y-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E5A55]/10">
                    <pillar.icon className="h-6 w-6 text-[#1E5A55]" />
                  </div>
                  <CardTitle className="text-xl font-bold">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground p-6 pt-0">
                  {pillar.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="border-[#1E5A55]/20 bg-[#1E5A55]/10 text-[#1E5A55] font-semibold">
                How It Works
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                Simple Event Management Workflow
              </h2>
              <p className="text-base text-muted-foreground">From creation to analytics in three easy steps.</p>
              <div className="grid gap-4">
                {flowSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-xl border-2 border-[#1E5A55]/10 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E5A55] text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-base">{step.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="border-2 border-[#D8573B]/10 bg-gradient-to-br from-white to-[#D8573B]/5 shadow-xl">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold">Platform Insights</CardTitle>
                <p className="text-base text-muted-foreground">Real-time event performance metrics.</p>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                <div className="grid gap-3 rounded-xl border-2 border-[#1E5A55]/10 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Check-In Rate</span>
                    <span className="text-sm font-bold text-[#1E5A55]">
                      92%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-[92%] bg-[#1E5A55] rounded-full" />
                  </div>
                </div>
                <div className="grid gap-3 rounded-xl border-2 border-[#D8573B]/10 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Registration Growth</span>
                    <span className="text-sm font-bold text-[#D8573B]">
                      +24%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-[#D8573B]" />
                    Strong momentum this week
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
                >
                  <Link href="/analytics">View analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-8">
          <Tabs defaultValue="attendee" className="space-y-6">
            <TabsList className="flex w-full flex-wrap justify-start gap-2 border-2 border-gray-200 bg-white p-1">
              <TabsTrigger value="attendee" className="gap-2">
                <Users2 className="h-4 w-4" />
                Attendee mode
              </TabsTrigger>
              <TabsTrigger value="host" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Host mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendee">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Your personal event radar</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Find your crowd and keep tickets ready.
                    </p>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-foreground" />
                      Filter by location, date, and vibe.
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-foreground" />
                      QR passes synced to your registrations.
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-foreground" />
                      Reminders before every event.
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Popular this week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    {isLoadingEvents ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : featured.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">Events coming soon</p>
                    ) : (
                      featured.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3"
                        >
                          <span className="font-semibold text-foreground">{event.name}</span>
                          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {formatDate(getEventStart(event))}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="host">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Host stack essentials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                      <p className="font-semibold text-foreground">Event Builder</p>
                      <p>Draft, schedule, and publish in a single flow.</p>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                      <p className="font-semibold text-foreground">Attendee Ops</p>
                      <p>Track check-ins and handle waitlists on the fly.</p>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                      <p className="font-semibold text-foreground">Live Analytics</p>
                      <p>Spot what&apos;s resonating and scale the best ideas.</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Command your venue</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Keep every event moving from doors open to encore.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-foreground" />
                      Auto-save drafts with live preview.
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-foreground" />
                      Dashboards per event and team.
                    </div>
                    <Button
                      asChild
                      className="w-full bg-[#d69b6d] text-white shadow-lg hover:bg-[#261d10]"
                    >
                      <Link href="/auth/signin">Sign in to host</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-8">
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#1E5A55]/20 bg-gradient-to-br from-[#1E5A55]/5 to-[#D8573B]/5 p-10 md:p-16 shadow-2xl">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#1E5A55]/30 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[#D8573B]/30 blur-3xl" />
            <div className="flex flex-col items-center gap-6 text-center relative">
              <Badge className="border-[#1E5A55]/20 bg-white text-[#1E5A55] font-bold text-sm px-4 py-1.5">
                Get Started Today
              </Badge>
              <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl max-w-3xl">
                Start Managing Professional Events
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                Join event organizers using StageWay for seamless event management.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
              >
                <Link href="/auth/signin">
                  Sign in / Register
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
