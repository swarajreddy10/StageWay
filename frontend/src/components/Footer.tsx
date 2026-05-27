"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const EXPLORE = [
  { href: "/events",        label: "Browse Events" },
  { href: "/registrations", label: "My Passes" },
  { href: "/about",         label: "About" },
];

const ACCOUNT = [
  { href: "/auth/signin",  label: "Sign in" },
  { href: "/auth/signup",  label: "Create account" },
  { href: "/host/request", label: "Become a host" },
];

const CAPABILITIES = [
  "Event publishing",
  "Registration flows",
  "QR check-ins",
  "Attendance insights",
];

export default function Footer() {
  return (
    <footer className="relative bg-[#060810] overflow-hidden">
      {/* Iridescent gradient top border */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(124,90,245,0.5) 30%, rgba(236,72,153,0.4) 60%, rgba(245,166,35,0.3) 80%, transparent 100%)",
        }}
      />

      {/* Ambient orb */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(124,90,245,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* CTA band */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative container px-4 md:px-8 pt-16 pb-12"
      >
        <div
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, rgba(124,90,245,0.12) 0%, rgba(14,16,24,0.8) 60%, rgba(99,40,224,0.08) 100%)",
            border: "1px solid rgba(124,90,245,0.18)",
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(124,90,245,0.25) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />

          <div className="relative">
            <p className="text-xs font-mono tracking-[0.2em] text-violet-400/60 uppercase mb-3">
              Take the Stage
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
              Your next great event<br />starts here.
            </h3>
            <p className="text-sm text-white/40 max-w-sm">
              Create, manage, and experience extraordinary events with tools built for the modern organizer.
            </p>
          </div>

          <div className="relative flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center shrink-0">
            <Link
              href="/events"
              className="flex items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-white/70 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
            >
              Browse events
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #7c5af5 0%, #6040e0 100%)",
                boxShadow: "0 0 0 1px rgba(124,90,245,0.4), 0 4px 20px rgba(124,90,245,0.3)",
              }}
            >
              Get started free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Main footer links */}
      <div className="container px-4 md:px-8 pb-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">

          {/* Brand column */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo size="sm" />
            </Link>
            <p className="text-sm text-white/35 max-w-xs leading-relaxed">
              Built for bold organizers and curious attendees. Discover, register, and experience events on a platform that moves as fast as your crowd.
            </p>
            <div className="flex flex-wrap gap-2">
              {CAPABILITIES.map((c) => (
                <span
                  key={c}
                  className="text-[10px] font-medium text-violet-300/50 border border-violet-500/[0.15] rounded-full px-2.5 py-0.5 bg-violet-500/[0.05]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/20">
              Explore
            </h3>
            <ul className="space-y-3">
              {EXPLORE.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/35 transition-colors duration-150 hover:text-white/75"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:support@stageway.app"
                  className="flex items-center gap-1.5 text-sm text-white/35 transition-colors hover:text-white/75"
                >
                  <Mail className="h-3 w-3" />
                  support@stageway.app
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/20">
              Account
            </h3>
            <ul className="space-y-3">
              {ACCOUNT.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/35 transition-colors duration-150 hover:text-white/75"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col items-start justify-between gap-3 text-[11px] text-white/20 sm:flex-row sm:items-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p>© {new Date().getFullYear()} StageWay. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-white/15">Privacy</span>
            <span className="text-white/15">Terms</span>
            <Link
              href="/auth/signup"
              className="flex items-center gap-1 text-white/25 hover:text-white/55 transition-colors duration-150"
            >
              Take the stage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
