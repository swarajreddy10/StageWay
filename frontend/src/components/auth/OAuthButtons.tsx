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
        <Image src={googleIcon} alt="Google" width={16} height={16} className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
