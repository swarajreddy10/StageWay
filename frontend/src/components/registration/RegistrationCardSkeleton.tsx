import { Skeleton } from "@/components/ui/skeleton";

export function RegistrationCardSkeleton() {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-[#0e1018] p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
      {/* Meta row */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function RegistrationGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <RegistrationCardSkeleton key={i} />
      ))}
    </div>
  );
}
