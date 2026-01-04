"use client";

import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <div className="hidden lg:flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/80 p-10 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
          <Badge className="w-fit bg-[#1E5A55] text-white">
            <Mail className="mr-2 h-3 w-3" />
            Password Reset
          </Badge>
          <h1 className="font-display text-4xl font-bold">Let’s get you back in.</h1>
          <p className="text-muted-foreground">
            Request a reset link and regain access to your StageWay account.
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Secure reset link sent instantly
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Your account data stays protected
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Choose a stronger password in minutes
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
