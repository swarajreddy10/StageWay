"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen bg-[#060810] flex items-center justify-center px-4 py-16 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-xl border border-white/[0.09] bg-[#0e1018] p-8">
          <div className="mb-7 text-center space-y-1.5">
            <span className="font-display text-xl font-bold tracking-[0.06em] text-white uppercase">Stageway</span>
            <p className="text-white/35 text-sm">Reset your password</p>
          </div>
          <Suspense fallback={<div className="h-32 skeleton" />}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </main>
  );
}
