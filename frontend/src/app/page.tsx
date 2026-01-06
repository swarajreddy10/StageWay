import Link from "next/link";
import { ArrowRight, Calendar, ChartLine, CheckCircle2, Sparkles, Users2 } from "lucide-react";
import { fetchEvents } from "../lib/event-api";
import HeroSection from "../components/HeroSection";
import EventCarousel from "../components/EventCarousel";
import HappeningCarousel from "../components/HappeningCarousel";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

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
    title: "Plan with clarity",
    description: "Shape lineups, schedules, and guest flow in minutes.",
    icon: Calendar,
  },
  {
    title: "Audience intelligence",
    description: "Track demand and keep momentum high.",
    icon: ChartLine,
  },
  {
    title: "Check-in, reimagined",
    description: "Fast entry, happy guests, no bottlenecks.",
    icon: Sparkles,
  },
];

const flowSteps = [
  {
    title: "Draft your experience",
    description: "Dates, pricing, and a polished page.",
  },
  {
    title: "Publish with confidence",
    description: "Launch fast and stay flexible.",
  },
  {
    title: "Track the room",
    description: "See registrations and check-ins live.",
  },
];

export default async function HomePage() {
  let events = [] as Awaited<ReturnType<typeof fetchEvents>>;

  try {
    events = await fetchEvents();
  } catch {
    events = [];
  }

  const getEventStart = (event: (typeof events)[number]) =>
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

      <section className="relative py-12 md:py-16">
        <div className="absolute inset-0 bg-white/60" />
        <div className="container relative px-4 md:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge className="bg-white/80 text-foreground border border-white/70">
                Live right now
              </Badge>
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Tonight&apos;s headline moments
              </h2>
              <p className="text-muted-foreground">Curated picks across the city.</p>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-white/70 bg-white/70 hover:bg-white"
            >
              <Link href="/events">
                Explore all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <EventCarousel events={featured.slice(0, 5)} />
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-8">
          <div className="mb-10 max-w-3xl space-y-3">
            <Badge className="bg-white/80 text-foreground border border-white/70">
              The StageWay edge
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              A live events studio, built in.
            </h2>
            <p className="text-muted-foreground">Everything you need to move faster.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {experiencePillars.map((pillar) => (
              <Card
                key={pillar.title}
                className="rounded-3xl border border-white/70 bg-white/80 shadow-sm"
              >
                <CardHeader className="space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80">
                    <pillar.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-xl">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {pillar.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="bg-white/80 text-foreground border border-white/70">
                End-to-end flow
              </Badge>
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                From idea to check-in.
              </h2>
              <p className="text-muted-foreground">A tight flow for every team.</p>
              <div className="grid gap-4">
                {flowSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-2xl border border-white/70 bg-white/80 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <CardHeader>
                <CardTitle className="text-2xl">Stage pulse</CardTitle>
                <p className="text-sm text-muted-foreground">Live signals across the room.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 rounded-2xl border border-white/70 bg-white/80 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Attendance readiness</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      92%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                    <div className="h-full w-[92%] bg-[#1E5A55]" />
                  </div>
                </div>
                <div className="grid gap-3 rounded-2xl border border-white/70 bg-white/80 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Registrations this week</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      +24%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-foreground" />
                    Momentum is climbing across cities.
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

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-8">
          <Tabs defaultValue="attendee" className="space-y-6">
            <TabsList className="flex w-full flex-wrap justify-start gap-2 border border-white/70 bg-white/70">
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
                    {featured.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3"
                      >
                        <span className="font-semibold text-foreground">{event.name}</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {formatDate(getEventStart(event))}
                        </span>
                      </div>
                    ))}
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
                      className="w-full bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]"
                    >
                      <Link href="/host/request">Create an event</Link>
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
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-10 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#1E5A55]/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[#D8573B]/20 blur-3xl" />
            <div className="flex flex-col items-center gap-6 text-center">
              <Badge className="bg-white/80 text-foreground border border-white/70">
                Ready to launch
              </Badge>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Your next live event deserves a flagship experience.
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Registration, check-in, and insights—built to feel premium.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
              >
                <Link href="/events">
                  Get started
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
