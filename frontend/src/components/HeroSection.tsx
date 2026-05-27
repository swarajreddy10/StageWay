"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Users, Zap } from "lucide-react";
import { Canvas } from "@react-three/fiber";

const StageScene = dynamic(() => import("@/components/three/StageScene"), { ssr: false });

type Props = {
  eventCount: number;
  upcomingCount: number;
  nextEventLabel: string;
};

const HERO_BULLETS = [
  "Launch polished event pages faster",
  "Keep registrations organized from one place",
  "Run smoother check-ins on event day",
];

const TICKER_ITEMS = [
  "Publish events faster",
  "Capture registrations",
  "Check in attendees",
  "Track turnout",
  "Coordinate event day",
  "Keep teams aligned",
  "Deliver better guest experience",
  "Run events with confidence",
];

export default function HeroSection({ eventCount, upcomingCount, nextEventLabel }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#060810] py-6 md:py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 h-[460px] w-[980px] -translate-x-1/2"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(124,90,245,0.24) 0%, transparent 72%)",
            filter: "blur(46px)",
          }}
        />
        <div
          className="absolute top-1/3 left-[8%] h-[320px] w-[320px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(66,153,225,0.14) 0%, transparent 72%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      {!shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="pointer-events-none absolute inset-0 z-[1]"
        >
          <Canvas camera={{ position: [0, 1.5, 9], fov: 52 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <Suspense fallback={null}>
              <StageScene mobile={isMobile} />
            </Suspense>
          </Canvas>
        </motion.div>
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(6,8,16,0.58) 0%, rgba(6,8,16,0.16) 34%, rgba(6,8,16,0.66) 76%, rgba(6,8,16,1) 100%)",
            "linear-gradient(to right, rgba(6,8,16,0.62) 0%, transparent 24%, transparent 76%, rgba(6,8,16,0.62) 100%)",
          ].join(", "),
        }}
      />

      <div className="relative z-[3] container px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden rounded-3xl border border-white/[0.10] bg-[#0b0f1a]/88 backdrop-blur-xl"
        >
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:p-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200/85">
                  Built For Event Teams
                </span>
              </div>

              <div className="space-y-4">
                <h1
                  className="font-display font-bold leading-[1.02] tracking-tight text-white"
                  style={{ fontSize: "clamp(2.2rem, 6vw, 4.8rem)" }}
                >
                  Run high-impact events
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #9d7dff 0%, #c084fc 38%, #f472b6 72%, #fb923c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    without operational chaos.
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-white/52 sm:text-lg">
                  StageWay gives hosts one command center for publishing events, managing registrations, and
                  checking guests in live.
                </p>
              </div>

              <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
                <Link
                  href="/auth/signup"
                  className="flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #7c5af5 0%, #6040e0 100%)",
                    boxShadow: "0 0 0 1px rgba(124,90,245,0.46), 0 10px 28px rgba(124,90,245,0.26)",
                  }}
                >
                  Create Event Page
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/events"
                  className="flex h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] px-6 text-sm font-semibold text-white/72 transition-colors duration-200 hover:text-white"
                >
                  Browse Live Events
                </Link>
              </div>

              <ul className="grid gap-2 sm:grid-cols-2">
                {HERO_BULLETS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/48">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/[0.10] bg-[#101522]/85 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/32">Live Command Deck</p>
                  <p className="mt-1 text-sm text-white/46">Real-time operations overview</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/12">
                  <Zap className="h-4 w-4 text-violet-300" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40">Events Live</p>
                    <Calendar className="h-3.5 w-3.5 text-white/32" />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-white">{eventCount || 0}</p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40">Upcoming This Cycle</p>
                    <Users className="h-3.5 w-3.5 text-white/32" />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-white">{upcomingCount || 0}</p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-xs text-white/40">Next Spotlight</p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-white/72">{nextEventLabel}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-2 text-center text-white/52">
                  Faster Ops
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-2 text-center text-white/52">
                  Better Guest Flow
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06]">
            <div className="marquee-track py-3">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="mx-4 inline-flex items-center gap-3 whitespace-nowrap text-[11px] font-mono uppercase tracking-[0.14em] text-white/26"
                >
                  <span className="inline-block h-1 w-1 rounded-full bg-violet-400/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
