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
    <div className="flex min-h-screen items-center justify-center bg-[#060810] px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-white/[0.08] bg-[#0e1018] px-6 py-6 text-center sm:px-10 sm:py-8">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">Completing sign in...</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Syncing your account details.</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#060810] px-4 py-10 sm:py-16">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0e1018] px-6 py-6 text-center sm:px-10 sm:py-8">
            <h2 className="font-display text-xl font-semibold sm:text-2xl">Loading...</h2>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
