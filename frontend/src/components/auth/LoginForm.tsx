"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLocalError(null);
    try {
      await login(data.email, data.password);
      toast.success("Signed in.");
      const role = useAuthStore.getState().user?.role;
      if (role === "ADMIN") {
        router.push("/admin/host-requests");
      } else if (role === "HOST") {
        router.push("/host");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
      setLocalError(message);
    }
  };

  return (
    <Card className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
      <CardHeader className="space-y-2">
        <CardTitle className="font-display text-3xl">Pick up the thread.</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
        <CardAction>
          <Button variant="link" className="px-0" onClick={() => router.push("/auth/signup")}>
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="/auth/forgot" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </a>
            </div>
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

          {(error || localError) && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error || localError}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          className="w-full bg-[#1E5A55] text-white shadow-lg hover:bg-[#174844]"
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        <OAuthButtons />
      </CardFooter>
    </Card>
  );
}
