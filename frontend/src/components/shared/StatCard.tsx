import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
  icon?: ReactNode;
  accent?: "coral" | "sky" | "lime";
  footer?: ReactNode;
  className?: string;
}

const accentStyles: Record<NonNullable<StatCardProps["accent"]>, string> = {
  coral: "bg-[#D8573B]/8",
  sky: "bg-[#1E5A55]/10",
  lime: "bg-[#F0B34B]/12",
};

export function StatCard({
  label,
  value,
  helper,
  icon,
  accent = "sky",
  footer,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm",
        className
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0", accentStyles[accent])} />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
        {footer && <div className="mt-3">{footer}</div>}
      </CardContent>
    </Card>
  );
}
