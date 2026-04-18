"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Calendar, Users } from "lucide-react";
import { Canvas } from "@react-three/fiber";

const StageScene = dynamic(() => import("@/components/three/StageScene"), { ssr: false });

type Props = {
  eventCount: number;
  upcomingCount: number;
  nextEventLabel: string;
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const TICKER_ITEMS = [
  "Live Events",
  "QR Check-in",
  "Real-time Analytics",
  "Smart Waitlists",
  "Seat Management",
  "WebSocket Sync",
  "HMAC-signed QR",
  "Host Dashboard",
];

export default function HeroSection({ eventCount, upcomingCount, nextEventLabel }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const canvasY  = useTransform(scrollYProgress, [0, 1], [0, 120]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section ref={heroRef} className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden bg-[#060810]">

      {/* Ambient gradient orbs - behind everything */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(124,90,245,0.22) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute top-1/4 left-[15%] w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-1/3 right-[10%] w-[300px] h-[300px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* 3D Stage canvas with parallax */}
      {!shouldReduceMotion && (
        <motion.div className="absolute inset-0 z-[1]" style={{ y: canvasY }}>
          <Canvas
            camera={{ position: [0, 1.5, 9], fov: 52 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
            frameloop="always"
          >
            <Suspense fallback={null}>
              <StageScene mobile={isMobile} />
            </Suspense>
          </Canvas>
        </motion.div>
      )}

      {/* Full gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(6,8,16,0.55) 0%, rgba(6,8,16,0.10) 35%, rgba(6,8,16,0.60) 70%, rgba(6,8,16,1) 100%)",
            "linear-gradient(to right, rgba(6,8,16,0.50) 0%, transparent 25%, transparent 75%, rgba(6,8,16,0.50) 100%)",
          ].join(", "),
        }}
      />

      {/* Hero content with scroll parallax */}
      <motion.div
        className="relative z-[3] w-full flex justify-center px-4 md:px-8 py-24 text-center"
        style={{ y: contentY }}
      >
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.08 }}
          className="mx-auto max-w-5xl space-y-8"
        >

          {/* Eyebrow */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-2"
              style={{
                background: "rgba(124,90,245,0.10)",
                border: "1px solid rgba(124,90,245,0.25)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
                Event Management Platform
              </span>
            </div>
          </motion.div>

          {/* Headline - large, bold, with gradient span */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="font-display font-bold leading-[1.02] tracking-tight text-white"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
          >
            Where Events
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #9d7dff 0%, #c084fc 40%, #f472b6 70%, #fb923c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Come Alive
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="w-full text-center text-lg sm:text-xl text-white/40 leading-relaxed font-light"
          >
            The platform built for events that leave a mark.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 h-12 px-7 rounded-full text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7c5af5 0%, #6040e0 100%)",
                boxShadow: "0 0 0 1px rgba(124,90,245,0.5), 0 4px 24px rgba(124,90,245,0.35)",
              }}
            >
              <Zap className="h-4 w-4" fill="currentColor" />
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="flex items-center gap-2 h-12 px-7 rounded-full text-sm font-medium text-white/60 hover:text-white transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(8px)",
              }}
            >
              Browse events
            </Link>
          </motion.div>

          {/* Live stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-8 flex items-center justify-center gap-8 flex-wrap"
          >
            {[
              { icon: Calendar, value: eventCount || "-",    label: "Events live",    color: "#7c5af5" },
              { icon: Users,    value: upcomingCount || "-", label: "Upcoming",       color: "#f472b6" },
              { icon: Zap,      value: nextEventLabel ? "Active" : "Ready", label: "Platform",  color: "#f5a623" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-white font-display leading-none tracking-tight">
                    {value}
                  </div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium mt-0.5">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll-indicator ticker - bottom */}
      <div className="absolute bottom-0 inset-x-0 z-[3] overflow-hidden border-t border-white/[0.05]">
        <div className="flex overflow-hidden">
          <div className="marquee-track py-2.5">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-3 mx-4 text-[11px] font-mono tracking-[0.15em] text-white/20 uppercase whitespace-nowrap"
              >
                <span className="w-1 h-1 rounded-full bg-violet-500/40 inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
