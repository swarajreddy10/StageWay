"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <div className="hidden lg:flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/80 p-10 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
          <Badge className="w-fit bg-[#1E5A55] text-white">
            <Sparkles className="mr-2 h-3 w-3" />
            StageWay Access
          </Badge>
          <h1 className="font-display text-4xl font-bold">Welcome back to StageWay.</h1>
          <p className="text-muted-foreground">
            Discover amazing events, register instantly, and manage your event journey all in one place.
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Browse and register for events instantly
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Get QR codes for seamless check-in
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Track your registrations and event history
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
