"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandLogo } from "@/components/BrandLogo";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060810] px-4 py-10 sm:py-16">
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-xl border border-white/[0.09] bg-[#0e1018] p-6 sm:p-8">
          <div className="mb-7 text-center space-y-1.5">
            <BrandLogo className="justify-center" />
            <p className="text-white/35 text-sm">Welcome back</p>
          </div>
          <Suspense fallback={<div className="h-48 skeleton" />}>
            <LoginForm />
          </Suspense>
        </div>
      </motion.div>
    </main>
  );
}
