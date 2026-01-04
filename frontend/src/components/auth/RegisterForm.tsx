"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OAuthButtons } from "./OAuthButtons";
import { Loader2 } from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    role: z.enum(["ATTENDEE", "HOST"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, notice, clearNotice } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"ATTENDEE" | "HOST">("ATTENDEE");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "ATTENDEE",
    },
  });

  const [passwordValue, setPasswordValue] = useState("");

  const onSubmit = async (data: RegisterFormData) => {
    setLocalError(null);
    clearNotice();
    try {
      await registerUser(data.email, data.password, data.fullName, data.role);
      const role = useAuthStore.getState().user?.role;
      if (role) {
        router.push(role === "HOST" || role === "ADMIN" ? "/host" : "/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setLocalError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "" };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength(passwordValue);

  return (
    <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          New here?
        </p>
        <h1 className="font-display text-3xl font-bold">Create your StageWay.</h1>
        <p className="text-muted-foreground">Enter your information to get started.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Account Type</Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => {
              const role = value as "ATTENDEE" | "HOST";
              setSelectedRole(role);
              setValue("role", role);
            }}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ATTENDEE">Attendee</SelectItem>
              <SelectItem value="HOST">Host</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Jordan Taylor"
            {...register("fullName")}
            disabled={isLoading}
          />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            {...register("password", {
              onChange: (e) => setPasswordValue(e.target.value),
            })}
            disabled={isLoading}
          />
          {passwordValue && (
            <div className="space-y-1">
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${
                    passwordStrength.strength <= 2
                      ? "w-1/3 bg-destructive"
                      : passwordStrength.strength <= 4
                        ? "w-2/3 bg-[#F0B34B]"
                        : "w-full bg-[#1E5A55]"
                  }`}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {passwordStrength.label && `Password strength: ${passwordStrength.label}`}
              </p>
            </div>
          )}
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
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

        {(error || localError) && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error || localError}
          </div>
        )}
        {notice && !error && !localError && (
          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#D8573B] text-white shadow-lg hover:bg-[#C44F36]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/90 px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <OAuthButtons role={selectedRole} />

      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/signin" className="text-primary hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
