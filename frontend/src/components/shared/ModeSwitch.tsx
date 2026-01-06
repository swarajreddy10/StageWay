"use client";

import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/authStore";

type ModeSwitchProps = {
  mode: "ATTENDEE" | "HOST";
};

export function ModeSwitch({ mode }: ModeSwitchProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isHost = user?.role === "HOST";

  if (!isHost) {
    return null;
  }

  const isHostMode = mode === "HOST";

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      <span className={!isHostMode ? "text-foreground" : ""}>Attendee</span>
      <Switch
        checked={isHostMode}
        onCheckedChange={(checked) => router.push(checked ? "/host" : "/dashboard")}
      />
      <span className={isHostMode ? "text-foreground" : ""}>Host</span>
    </div>
  );
}
