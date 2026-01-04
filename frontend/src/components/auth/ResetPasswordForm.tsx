"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setHasSession(!!session);
      setIsChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(!!session);
      setIsChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setNotice(null);
    setLocalError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        throw error;
      }
      await supabase.auth.signOut();
      setIsComplete(true);
      setNotice("Password updated. You can now sign in.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update password";
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Validating reset link...</p>
      </div>
    );
  }

  if (!hasSession && !isComplete) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Link expired
          </p>
          <h1 className="font-display text-3xl font-bold">That reset link is no longer valid.</h1>
          <p className="text-muted-foreground">Request a new password reset to continue.</p>
        </div>
        <a
          href="/auth/forgot"
          className="inline-flex items-center justify-center rounded-full bg-[#1E5A55] px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-[#174844]"
        >
          Request new link
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Set new password
        </p>
        <h1 className="font-display text-3xl font-bold">Secure your account.</h1>
        <p className="text-muted-foreground">Pick a strong password to continue.</p>
      </div>

      {isComplete ? (
        <div className="space-y-4 text-center">
          {notice && (
            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>
          )}
          <a href="/auth/signin" className="text-primary hover:underline">
            Return to sign in
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
              {...register("confirmPassword")}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
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
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
