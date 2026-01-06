"use client";

import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function OAuthButtons() {
  const handleGoogleSignIn = async () => {
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
