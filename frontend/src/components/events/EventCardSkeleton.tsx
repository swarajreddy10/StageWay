import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0e1018] overflow-hidden">
      {/* Poster 3:4 banner */}
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      {/* Bottom strip */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05]">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
