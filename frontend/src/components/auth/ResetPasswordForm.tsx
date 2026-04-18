"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

const resetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
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

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setHasSession(!!session);
      setIsChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setHasSession(!!session);
      setIsChecking(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setNotice(null);
    setLocalError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      await supabase.auth.signOut();
      setIsComplete(true);
      setNotice("Password updated. You can now sign in.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Unable to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full rounded-md bg-[#0e1018] border border-white/[0.09] px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 disabled:opacity-50 transition-colors";
  const labelCls = "text-white/60 text-xs font-medium";

  if (isChecking) return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      <p className="text-sm text-white/40">Validating reset link…</p>
    </div>
  );

  if (!hasSession && !isComplete) return (
    <div className="space-y-4 text-center py-4">
      <p className="text-sm text-white/40">That reset link is no longer valid.</p>
      <a href="/auth/forgot" className="inline-flex items-center justify-center rounded-md bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-sm font-medium transition-colors shadow-btn-white">
        Request new link
      </a>
    </div>
  );

  if (isComplete) return (
    <div className="space-y-4 text-center py-4">
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.05]">
          <CheckCircle2 className="h-6 w-6 text-white/60" />
        </div>
      </div>
      {notice && <p className="text-sm text-white/60">{notice}</p>}
      <a href="/auth/signin" className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-2">Return to sign in →</a>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password" className={labelCls}>New Password</Label>
        <input id="password" type="password" placeholder="••••••••" {...register("password")} disabled={isLoading} className={inputCls} />
        {errors.password && <p className="text-xs text-white/50">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className={labelCls}>Confirm Password</Label>
        <input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} disabled={isLoading} className={inputCls} />
        {errors.confirmPassword && <p className="text-xs text-white/50">{errors.confirmPassword.message}</p>}
      </div>

      {localError && (
        <div className="rounded-lg bg-white/[0.04] border border-white/[0.09] p-3 text-xs text-white/50">{localError}</div>
      )}

      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet" disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating…</> : "Update password"}
      </Button>
    </form>
  );
}
