"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  QrCode,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── animation variants ───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

/* ─── static data ───────────────────────────────────────────────── */
const ATTENDEE_FEATURES = [
  "Browse curated events across all categories",
  "One-click registration with instant confirmation",
  "Digital QR passes — no printing needed",
  "Manage all your registrations in one dashboard",
  "Real-time event updates and notifications",
];

const HOST_FEATURES = [
  "Create beautiful event pages in minutes",
  "Real-time registration and capacity management",
  "HMAC-secured QR check-in system",
  "Comprehensive analytics and revenue insights",
  "Automatic waitlist promotion when seats open",
];

const FEATURES = [
  {
    icon: Zap,
    label: "Real-time Updates",
    desc: "WebSocket-powered live sync keeps hosts and attendees aligned instantly.",
  },
  {
    icon: Users,
    label: "Smart Registration",
    desc: "Waitlists, capacity limits, and seat auto-assignment — all automated.",
  },
  {
    icon: QrCode,
    label: "QR Check-In",
    desc: "HMAC-SHA256 signed QR codes for fraud-proof entry scanning.",
  },
  {
    icon: BarChart3,
    label: "Deep Analytics",
    desc: "Revenue timelines, check-in rates, and per-event performance breakdowns.",
  },
  {
    icon: Globe,
    label: "Any Scale",
    desc: "From 10-person workshops to stadium concerts — same seamless experience.",
  },
  {
    icon: Lock,
    label: "Secure by Default",
    desc: "Supabase JWT auth, row-level security, and optimistic locking throughout.",
  },
];

const STATS = [
  { value: "99.9%", label: "Uptime" },
  { value: "< 200ms", label: "Check-in time" },
  { value: "0 lost", label: "Registrations" },
  { value: "∞", label: "Event scale" },
];

/* ─── page ──────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <main className="flex-1 bg-[#060810]">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Subtle noise texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "200px 200px" }} />

        <div className="container relative px-4 md:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-3xl space-y-6 text-center"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Badge className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/60">
                <Sparkles className="h-3 w-3" />
                About StageWay
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Where Every Event{" "}
              <span className="text-white/70">Finds Its Stage</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl text-base text-white/45 sm:text-lg leading-relaxed"
            >
              StageWay is an end-to-end event management platform connecting organizers and
              attendees through seamless registration, real-time updates, and powerful analytics —
              all on one modern platform.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                size="lg"
                asChild
                className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 font-semibold shadow-btn-white"
              >
                <Link href="/auth/signup">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="border border-white/[0.10] hover:border-white/20 text-white/55 hover:text-white h-12 px-8"
              >
                <Link href="/events">Browse events</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-10">
        <div className="container px-4 md:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {STATS.map(({ value, label }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="font-display text-3xl font-bold text-white md:text-4xl">{value}</div>
                <div className="mt-1 text-xs font-medium text-white/35 uppercase tracking-widest">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Attendees vs Hosts ───────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-12 space-y-3 text-center"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Badge className="border border-white/[0.10] bg-white/[0.04] text-white/50 text-[10px] font-bold uppercase tracking-widest">
                Who it&apos;s for
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="font-display text-3xl font-bold text-white md:text-4xl"
            >
              Built for both sides of every event
            </motion.h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Attendees card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-xl border border-white/[0.08] bg-[#0e1018] overflow-hidden hover:border-white/[0.14] transition-colors duration-200"
            >
              <div className="h-px w-full bg-gradient-to-r from-white/30 to-transparent" />
              <div className="p-7 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                    <Calendar className="h-6 w-6 text-white/50" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">For Attendees</h3>
                    <p className="text-xs text-white/40 mt-0.5">Discover &amp; attend amazing events</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {ATTENDEE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                      <span className="text-sm text-white/55 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant="ghost"
                  className="w-full border border-white/[0.09] text-white/45 hover:text-white hover:bg-white/[0.05]"
                >
                  <Link href="/events">
                    Browse Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Hosts card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-xl border border-white/[0.08] bg-[#0e1018] overflow-hidden hover:border-white/[0.14] transition-colors duration-200"
            >
              <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
              <div className="p-7 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                    <TrendingUp className="h-6 w-6 text-white/50" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">For Hosts</h3>
                    <p className="text-xs text-white/40 mt-0.5">Create &amp; manage professional events</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {HOST_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                      <span className="text-sm text-white/55 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet"
                >
                  <Link href="/auth/signin">
                    Start hosting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 border-t border-white/[0.04]">
        <div className="container relative px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 space-y-3"
          >
            <Badge className="border border-white/[0.10] bg-white/[0.04] text-white/50 text-[10px] font-bold uppercase tracking-widest">
              Platform capabilities
            </Badge>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Everything you need,{" "}
              <span className="text-white/60">nothing you don&apos;t</span>
            </h2>
            <p className="text-sm text-white/40 max-w-xl">
              Production-grade infrastructure with a consumer-grade experience.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-xl border border-white/[0.08] bg-[#0e1018] p-6 space-y-4 hover:border-white/[0.14] hover:bg-[#141720] transition-all duration-200"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                  <Icon className="h-5 w-5 text-white/50" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-semibold text-white text-base">{label}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission strip ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="container px-4 md:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] mb-6">
                <Shield className="h-8 w-8 text-white/50" />
              </div>
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl leading-tight">
                Built to last, designed to{" "}
                <span className="text-white/70">impress</span>
              </h2>
              <p className="mt-4 text-base text-white/40 leading-relaxed">
                StageWay is open-source, built on proven Spring Boot + Next.js architecture,
                with Supabase authentication, HMAC-signed QR codes, and real-time WebSocket
                infrastructure. No half-measures — this is production-grade from day one.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1018] p-12 md:p-16 text-center"
          >
            {/* Dot grid pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

            <div className="relative space-y-6">
              <Badge className="border border-white/[0.10] bg-white/[0.04] text-white/50 text-[10px] font-bold uppercase tracking-widest">
                Get started today
              </Badge>
              <h2 className="font-display text-3xl font-bold text-white md:text-5xl max-w-2xl mx-auto">
                Ready to take the stage?
              </h2>
              <p className="text-white/40 max-w-md mx-auto">
                Join event organizers and attendees already using StageWay for seamless, professional events.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 font-semibold shadow-btn-white"
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
                  className="border border-white/[0.10] hover:border-white/20 text-white/55 hover:text-white h-12 px-8"
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
