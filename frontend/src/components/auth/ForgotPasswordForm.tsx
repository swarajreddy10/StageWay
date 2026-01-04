"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setNotice(null);
    setLocalError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/reset`;
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo });
      if (error) {
        throw error;
      }
      setNotice("If an account exists, a reset link has been sent to your email.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send reset link";
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Reset access
        </p>
        <h1 className="font-display text-3xl font-bold">Find your way back.</h1>
        <p className="text-muted-foreground">We&apos;ll send a reset link to your email.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {(localError || notice) && (
          <div
            className={`rounded-md p-3 text-sm ${
              localError ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {localError || notice}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Remembered your password?{" "}
        <a href="/auth/signin" className="text-primary hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
