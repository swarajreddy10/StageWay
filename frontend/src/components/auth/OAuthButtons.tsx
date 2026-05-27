"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import googleIcon from "@/components/shared/Google icon.png";

export function OAuthButtons() {
  const handleGoogleSignIn = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } },
    });
    if (error) console.error("Google sign-in error:", error);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white"
      onClick={handleGoogleSignIn}
    >
      <Image src={googleIcon} alt="Google" width={16} height={16} className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>
  );
}
