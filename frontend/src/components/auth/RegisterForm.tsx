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

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
  fullName: z.string().min(3, "Name must be at least 3 characters"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const STRENGTH_COLORS = ["", "bg-white/20", "bg-white/35", "bg-white/55", "bg-white/75", "bg-white"];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, notice, clearNotice } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const getStrength = (pwd: string) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const strength = getStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setLocalError(null);
    clearNotice();
    try {
      await registerUser(data.email, data.password, data.fullName);
      const { user, notice: noticeMsg } = useAuthStore.getState();
      if (user?.role) {
        toast.success("Account created.");
        if (user.role === "ADMIN") router.push("/admin/host-requests");
        else if (user.role === "HOST") router.push("/host");
        else router.push("/dashboard");
      } else if (noticeMsg) {
        toast(noticeMsg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
      setLocalError(message);
    }
  };

  const inputCls = "w-full rounded-md bg-[#0e1018] border border-white/[0.09] px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 disabled:opacity-50 transition-colors";
  const labelCls = "text-white/60 text-xs font-medium";

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
          <Label htmlFor="fullName" className={labelCls}>Full Name</Label>
          <input id="fullName" type="text" placeholder="Jordan Taylor" {...register("fullName")} disabled={isLoading} className={inputCls} />
          {errors.fullName && <p className="text-xs text-white/50">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className={labelCls}>Email Address</Label>
          <input id="email" type="email" placeholder="you@example.com" {...register("email")} disabled={isLoading} className={inputCls} />
          {errors.email && <p className="text-xs text-white/50">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className={labelCls}>Password</Label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password", { onChange: (e) => setPasswordValue(e.target.value) })}
            disabled={isLoading}
            className={inputCls}
          />
          {passwordValue && (
            <div className="space-y-1">
              <div className="flex h-1 gap-1">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLORS[strength] : "bg-white/[0.06]"}`} />
                ))}
              </div>
              {strength > 0 && <p className="text-[11px] text-white/35">{STRENGTH_LABELS[strength]}</p>}
            </div>
          )}
          {errors.password && <p className="text-xs text-white/50">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className={labelCls}>Confirm Password</Label>
          <input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} disabled={isLoading} className={inputCls} />
          {errors.confirmPassword && <p className="text-xs text-white/50">{errors.confirmPassword.message}</p>}
        </div>

        {(error || localError) && (
          <div className="rounded-lg bg-white/[0.04] border border-white/[0.09] p-3 text-xs text-white/50">
            {error || localError}
          </div>
        )}
        {notice && !error && !localError && (
          <div className="rounded-lg bg-white/[0.05] border border-white/[0.10] p-3 text-xs text-white/60">{notice}</div>
        )}

        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-btn-violet" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</> : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-white/40">
        Already have an account?{" "}
        <a href="/auth/signin" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">Sign in</a>
      </p>
    </div>
  );
}
