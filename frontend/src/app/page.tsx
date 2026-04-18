"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChartLine,
  QrCode,
  Users,
  Loader2,
  CheckCircle2,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import { fetchEvents } from "@/lib/event-api";
import { useBackendStatusStore } from "@/hooks/useBackendStatus";
import type { Event } from "@/types/event";

const FloatingCard = dynamic(() => import("@/components/three/FloatingCard"), { ssr: false });

/* ─── helpers ─────────────────────────────────────────────────── */
function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function getStart(e: Event) {
  return e.startsAt ?? e.startDate ?? e.createdAt;
}

/* ─── static data ─────────────────────────────────────────────── */
const PILLARS = [
  {
    icon: Calendar,
    title: "Event Creation",
    desc: "Build professional event pages with custom branding, ticketing, and seat management in minutes.",
    num: "01",
  },
  {
    icon: ChartLine,
    title: "Live Analytics",
    desc: "Track registrations, revenue, and engagement with real-time charts and per-event breakdowns.",
    num: "02",
  },
  {
    icon: QrCode,
    title: "QR Check-In",
    desc: "HMAC-SHA256 signed QR codes for fraud-proof entry scanning with instant attendee verification.",
    num: "03",
  },
];

const FLOW_STEPS = [
  {
    n: "01",
    title: "Create Your Event",
    desc: "Set dates, pricing, capacity, and upload event banners. Publish in minutes.",
    icon: Sparkles,
  },
  {
    n: "02",
    title: "Manage Registrations",
    desc: "Accept registrations automatically. Handle waitlists and seat assignments hands-free.",
    icon: Users,
  },
  {
    n: "03",
    title: "Track Performance",
    desc: "Monitor check-ins, revenue, and attendee engagement — live, from any device.",
    icon: ChartLine,
  },
];

const TRUST_ITEMS = [
  { value: "99.9%",     label: "Uptime SLA" },
  { value: "< 200ms",   label: "Check-in speed" },
  { value: "HMAC-256",  label: "QR security" },
  { value: "WebSocket", label: "Real-time sync" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

/* ─── EventCard ───────────────────────────────────────────────── */
function EventCard({ event }: { event: Event }) {
  const start = getStart(event);
  const isFree = !event.price || event.price === 0;

  return (
    <div className="group relative flex flex-col h-full border border-white/[0.08] bg-[#0e1018] rounded-lg overflow-hidden hover:border-white/[0.15] hover:bg-[#141720] transition-all duration-200">
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30 border border-white/[0.08] px-2 py-0.5 rounded-full">
            {event.category ?? event.status ?? "Event"}
          </span>
          <span className="text-[10px] text-white/25 tabular-nums font-mono">{formatDate(start)}</span>
        </div>

        <h3 className="font-display font-semibold text-white/90 text-base leading-snug line-clamp-2 group-hover:text-white transition-colors duration-150">
          {event.name}
        </h3>

        {(event.venueName || event.location) && (
          <p className="text-xs text-white/30 truncate">{event.venueName ?? event.location}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <span className="text-sm font-bold text-white/80">
            {isFree ? "Free" : `$${event.price}`}
          </span>
          {event.capacity != null && (
            <span className="text-[10px] text-white/25 font-mono">{event.capacity} seats</span>
          )}
        </div>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowRight className="h-3.5 w-3.5 text-white/50" />
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function HomePage() {
  const backendStatus = useBackendStatusStore((s) => s.status);
  const [events, setEvents]       = useState<Event[]>([]);
  const [isLoadingEvents, setLoading] = useState(true);
  const [hasFetched, setHasFetched]   = useState(false);

  useEffect(() => {
    if (backendStatus !== "awake" || hasFetched) return;
    setHasFetched(true);
    fetchEvents()
      .then((d) => setEvents(d))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [backendStatus, hasFetched]);

  const sorted   = [...events].sort((a, b) => new Date(getStart(a)).getTime() - new Date(getStart(b)).getTime());
  const featured = sorted.slice(0, 6);
  const nextLabel = featured[0] ? `${featured[0].name} — ${formatDate(getStart(featured[0]))}` : "Schedule open";

  return (
    <main className="flex-1 bg-[#060810]">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <HeroSection eventCount={events.length} upcomingCount={featured.length} nextEventLabel={nextLabel} />

      {/* ── Trust bar ────────────────────────────────────────── */}
      <div className="border-y border-white/[0.05] bg-[#060810]">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-2 divide-x divide-white/[0.05] sm:grid-cols-4">
            {TRUST_ITEMS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-1 py-5 px-4 text-center">
                <span className="font-display text-sm font-bold text-white/80 tabular-nums tracking-tight">{value}</span>
                <span className="text-[10px] text-white/25 tracking-[0.08em] uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Events ──────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-12 flex flex-wrap items-end justify-between gap-4"
          >
            <motion.div variants={fadeUp} custom={0} className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                Featured Events
              </p>
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Discover what&apos;s happening
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} custom={0.08}>
              <Button
                variant="ghost"
                asChild
                className="border border-white/[0.08] text-white/40 hover:text-white hover:border-white/[0.16] text-sm h-9"
              >
                <Link href="/events">
                  View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {isLoadingEvents ? (
            <div className="flex items-center justify-center py-28">
              <Loader2 className="h-6 w-6 animate-spin text-white/20" />
            </div>
          ) : featured.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-28 text-center">
              <div className="h-14 w-14 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                <Calendar className="h-7 w-7 text-white/20" />
              </div>
              <p className="text-sm text-white/25">Events coming soon</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
              {featured.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block h-full">
                  <EventCard event={event} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section divider ───────────────────────────────────── */}
      <div className="section-divider container" />

      {/* ── Platform Pillars ─────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-14 max-w-xl space-y-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
              Platform Features
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Everything you need to run events
            </h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Professional-grade tooling for event management, registration workflows, and analytics.
            </p>
          </motion.div>

          <div className="grid gap-px border border-white/[0.07] rounded-xl overflow-hidden md:grid-cols-3 bg-white/[0.07] stagger-grid">
            {PILLARS.map(({ icon: Icon, title, desc, num }) => (
              <div
                key={title}
                className="group bg-[#0e1018] hover:bg-[#141720] transition-colors duration-200 p-8 flex flex-col gap-5"
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg border border-white/[0.09] bg-white/[0.04] flex items-center justify-center group-hover:border-white/[0.15] transition-colors">
                    <Icon className="h-4.5 w-4.5 text-white/60" />
                  </div>
                  <span className="font-mono text-[10px] text-white/15 font-bold tracking-wider">{num}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-white/90 text-base">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section divider ───────────────────────────────────── */}
      <div className="section-divider container" />

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="space-y-10"
            >
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">How it works</p>
                <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
                  Simple, powerful workflow
                </h2>
              </div>

              <div className="space-y-2">
                {FLOW_STEPS.map(({ n, title, desc, icon: Icon }, i) => (
                  <motion.div
                    key={n}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    className="group flex gap-4 rounded-lg border border-white/[0.07] bg-[#0e1018] hover:border-white/[0.12] hover:bg-[#141720] p-4 transition-all duration-200"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-md border border-white/[0.08] bg-white/[0.04] flex items-center justify-center group-hover:border-white/[0.14] transition-colors">
                      <Icon className="h-4 w-4 text-white/50" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-white/20">{n}</span>
                        <p className="font-semibold text-white/90 text-sm">{title}</p>
                      </div>
                      <p className="text-xs text-white/38 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-7 space-y-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold text-white/90 text-sm">Platform Insights</p>
                    <p className="text-xs text-white/30 mt-0.5">Live performance metrics</p>
                  </div>
                  <div className="h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.04] flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-white/50" />
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    { label: "Check-In Rate",       value: 92 },
                    { label: "Registration Growth", value: 78 },
                    { label: "Host Satisfaction",   value: 96 },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/45 font-medium">{label}</span>
                        <span className="font-bold tabular-nums text-white/70 font-mono">{value}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
                          className="h-full rounded-full bg-[#7c5af5]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] pt-5 grid grid-cols-2 gap-3">
                  {[
                    { label: "Events Created", val: "Live" },
                    { label: "WebSocket Sync", val: "Active" },
                  ].map(({ label, val }) => (
                    <div key={label} className="rounded-md border border-white/[0.07] bg-white/[0.02] p-3 text-center">
                      <div className="text-sm font-bold text-white/70">{val}</div>
                      <div className="text-[9px] text-white/25 mt-0.5 tracking-wide uppercase">{label}</div>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm h-10 shadow-btn-white"
                >
                  <Link href="/analytics">
                    View analytics <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature checklist strip ───────────────────────────── */}
      <section className="border-t border-white/[0.05] py-14 md:py-16">
        <div className="container px-4 md:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Supabase JWT auth",
              "HMAC-signed QR codes",
              "WebSocket real-time sync",
              "Automatic waitlist queue",
            ].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white/35" />
                <span className="text-sm text-white/45 font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0e1018] p-12 md:p-20 text-center"
          >
            {/* Subtle noise texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />

            <div className="relative space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                Get started today
              </p>
              <h2 className="font-display text-3xl font-bold text-white md:text-5xl max-w-xl mx-auto leading-tight">
                Ready to take the Stage?
              </h2>
              <p className="text-white/35 text-sm max-w-md mx-auto leading-relaxed">
                Join event organizers using StageWay for seamless, professional event management.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  asChild
                  className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-9 font-bold text-sm shadow-btn-white tracking-wide"
                >
                  <Link href="/auth/signup">
                    Create your account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="border border-white/[0.10] hover:border-white/[0.20] text-white/50 hover:text-white h-12 px-9 text-sm"
                >
                  <Link href="/events">Browse events</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
