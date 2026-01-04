"use client";

import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <div className="hidden lg:flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/80 p-10 shadow-[0_30px_70px_rgba(15,23,42,0.12)]">
          <Badge className="w-fit bg-[#D8573B] text-white">
            <Sparkles className="mr-2 h-3 w-3" />
            Join StageWay
          </Badge>
          <h1 className="font-display text-4xl font-bold">Build the events people remember.</h1>
          <p className="text-muted-foreground">
            Create your account and start hosting, tracking, and celebrating every registration.
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#D8573B]" />
              Launch in minutes with templates
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#D8573B]" />
              QR check-ins and instant confirmations
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#D8573B]" />
              Real-time analytics out of the box
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
