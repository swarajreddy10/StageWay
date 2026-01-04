import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("rounded-3xl border border-white/70 bg-white/80 shadow-sm", className)}>
      <CardContent className="py-12 text-center">
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">{icon}</div>
        )}
        <p className="text-lg font-medium">{title}</p>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </CardContent>
    </Card>
  );
}
