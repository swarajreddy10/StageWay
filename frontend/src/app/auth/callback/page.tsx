"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { resolveApiBaseUrl } from "@/lib/api-base";
import { API_ROUTES } from "@/lib/api-routes";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const syncWithBackend = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        try {
          const headers: Record<string, string> = {
            Authorization: `Bearer ${session.access_token}`,
          };
          const response = await fetch(`${resolveApiBaseUrl()}${API_ROUTES.auth.supabase}`, {
            method: "POST",
            headers,
          });

          if (response.ok) {
            const authResponse = await response.json();
            const authState = useAuthStore.getState();
            authState.setUser(authResponse.user);
            authState.setToken(session.access_token);
            const role = authResponse.user.role?.toUpperCase();
            if (role === "ADMIN") {
              router.push("/admin/host-requests");
            } else if (role === "HOST") {
              router.push("/host");
            } else {
              router.push("/dashboard");
            }
          } else {
            console.error("Backend sync failed");
            await supabase.auth.signOut();
            router.push("/auth/signin");
          }
        } catch (error) {
          console.error("Error syncing with backend:", error);
          await supabase.auth.signOut();
          router.push("/auth/signin");
        }
      } else {
        router.push("/auth/signin");
      }
    };

    syncWithBackend();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-3xl border border-white/70 bg-white/80 px-10 py-8 text-center shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
        <h2 className="font-display text-2xl font-semibold">Completing sign in...</h2>
        <p className="mt-2 text-muted-foreground">Syncing your account details.</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="rounded-3xl border border-white/70 bg-white/80 px-10 py-8 text-center shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
            <h2 className="font-display text-2xl font-semibold">Loading...</h2>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
