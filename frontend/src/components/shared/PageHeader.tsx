import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  badge?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ badge, title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1018] p-5  sm:p-6 lg:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#7c5af5]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-[#D8573B]/15 blur-3xl" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
        <div className="min-w-0 space-y-3">
          {badge}
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
          )}
        </div>
        {actions && <div className="w-full lg:justify-self-end">{actions}</div>}
      </div>
    </div>
  );
}
