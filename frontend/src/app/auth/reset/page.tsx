"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen bg-[#060810] flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#000_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-xl border border-white/[0.09] bg-[#0e1018] p-8">
          <div className="mb-6 text-center space-y-1">
            <span className="font-display text-2xl font-bold tracking-tight">
              <span className="text-white">Stage</span><span className="text-white/50">Way</span>
            </span>
            <p className="text-white/40 text-sm">Set new password</p>
          </div>
          <Suspense fallback={<div className="h-32 rounded-lg bg-white/[0.04] animate-pulse" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </main>
  );
}
