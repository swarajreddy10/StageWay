"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});
type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setNotice(null);
    setLocalError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo });
      if (error) throw error;
      setNotice("If an account exists, a reset link has been sent to your email.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Unable to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-white/60 text-xs font-medium">Email Address</Label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isLoading}
            className="w-full rounded-md bg-[#0e1018] border border-white/[0.09] px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 disabled:opacity-50 transition-colors"
          />
          {errors.email && <p className="text-xs text-white/50">{errors.email.message}</p>}
        </div>

        {localError && (
          <div className="rounded-lg bg-white/[0.04] border border-white/[0.09] p-3 text-xs text-white/50">{localError}</div>
        )}
        {notice && (
          <div className="rounded-lg bg-white/[0.05] border border-white/[0.10] p-3 text-xs text-white/60 flex items-start gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {notice}
          </div>
        )}

        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending link…</> : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-white/40">
        Remembered your password?{" "}
        <a href="/auth/signin" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">Sign in</a>
      </p>
    </div>
  );
}
