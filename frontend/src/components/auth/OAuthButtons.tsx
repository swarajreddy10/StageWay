"use client";

import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resolveApiBaseUrl } from "@/lib/api-base";
import { API_ROUTES } from "@/lib/api-routes";

type OAuthButtonsProps = {
  role?: "HOST" | "ATTENDEE";
};

const normalizeRole = (value?: string | null) => {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "HOST" || normalized === "ORGANIZER") {
    return "HOST";
  }
  if (normalized === "ATTENDEE") {
    return "ATTENDEE";
  }
  return undefined;
};

export function OAuthButtons({ role }: OAuthButtonsProps) {
  const desiredRole = normalizeRole(role);

  const prepareOAuthRole = async () => {
    if (!desiredRole) {
      return;
    }
    await fetch(`${resolveApiBaseUrl()}${API_ROUTES.auth.oauthStart}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: desiredRole }),
      credentials: "include",
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      await prepareOAuthRole();
    } catch (error) {
      console.error("Failed to prepare OAuth role:", error);
    }
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-full border-white/70 bg-white/80 hover:bg-white"
        onClick={handleGoogleSignIn}
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
