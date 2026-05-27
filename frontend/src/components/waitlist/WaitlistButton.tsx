"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import type { Waitlist } from "@/types/waitlist";

interface WaitlistButtonProps {
  eventId: number;
  onJoin?: (waitlist: Waitlist) => void;
}

export function WaitlistButton({ eventId, onJoin }: WaitlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const waitlist = await apiClient.post<Waitlist>(API_ROUTES.waitlist, { eventId });
      if (onJoin) {
        onJoin(waitlist);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to join waitlist";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleJoin}
        disabled={isLoading}
        variant="outline"
        className="w-full border-white/[0.08] bg-[#141720] hover:bg-[#1c2030]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          "Join Waitlist"
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
