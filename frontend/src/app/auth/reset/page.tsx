"use client";

import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <div className="hidden lg:flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/80 p-10 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
          <Badge className="w-fit bg-[#1E5A55] text-white">
            <ShieldCheck className="mr-2 h-3 w-3" />
            Secure Update
          </Badge>
          <h1 className="font-display text-4xl font-bold">Set a new password.</h1>
          <p className="text-muted-foreground">
            Finish the reset flow and jump back into your events.
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Strong password guidance built in
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Access restored right away
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1E5A55]" />
              Keep your account safe going forward
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
