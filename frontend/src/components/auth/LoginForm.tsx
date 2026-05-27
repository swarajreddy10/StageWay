"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "./OAuthButtons";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLocalError(null);
    try {
      await login(data.email, data.password);
      toast.success("Signed in.");
      const role = useAuthStore.getState().user?.role;
      if (role === "ADMIN") router.push("/admin/host-requests");
      else if (role === "HOST") router.push("/host");
      else router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
      setLocalError(message);
    }
  };

  return (
    <div className="space-y-5">
      <OAuthButtons />

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-xs text-white/25 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/60 text-xs font-medium">Password</Label>
            <a href="/auth/forgot" className="text-xs text-white/40 hover:text-white/70 transition-colors">Forgot?</a>
          </div>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register("password")}
            disabled={isLoading}
            className="w-full rounded-md bg-[#0e1018] border border-white/[0.09] px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 disabled:opacity-50 transition-colors"
          />
          {errors.password && <p className="text-xs text-white/50">{errors.password.message}</p>}
        </div>

        {(error || localError) && (
          <div className="rounded-lg bg-white/[0.04] border border-white/[0.09] p-3 text-xs text-white/50">
            {error || localError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet"
          disabled={isLoading}
        >
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-white/40">
        Don&apos;t have an account?{" "}
        <button onClick={() => router.push("/auth/signup")} className="text-white/70 hover:text-white transition-colors underline underline-offset-2">
          Sign up
        </button>
      </p>
    </div>
  );
}
