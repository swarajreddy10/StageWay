"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { EventGridSkeleton } from "@/components/events/EventCardSkeleton";
import { EventList } from "@/components/events/EventList";
import { EventFiltersComponent } from "@/components/events/EventFilters";
import { Pagination } from "@/components/ui/pagination";
import { useEvents } from "@/hooks/useEvents";
import type { EventFilters } from "@/types/event";

const SORT_OPTIONS = [
  { value: "soonest",    label: "Soonest" },
  { value: "latest",     label: "Latest" },
  { value: "price-low",  label: "Price ↑" },
  { value: "price-high", label: "Price ↓" },
  { value: "seats",      label: "Most seats" },
];

export default function EventsPage() {
  const [filters, setFilters]         = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage]               = useState(0);
  const [pageSize]                    = useState(12);
  const [sortOrder, setSortOrder]     = useState("soonest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { events, isLoading, fetchEvents, pagination } = useEvents(filters, false);

  useEffect(() => {
    fetchEvents({ ...filters, page, size: pageSize });
  }, [filters, page, pageSize, fetchEvents]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchQuery || undefined }));
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const sortedEvents = useMemo(() => {
    const s = [...events];
    switch (sortOrder) {
      case "latest":     s.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); break;
      case "price-low":  s.sort((a, b) => a.price - b.price); break;
      case "price-high": s.sort((a, b) => b.price - a.price); break;
      case "seats":      s.sort((a, b) => b.availableSeats - a.availableSeats); break;
      default:           s.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }
    return s;
  }, [events, sortOrder]);

  const total = pagination?.totalElements ?? 0;
  const activeFilterCount = useMemo(() => {
    const filterEntries = Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return false;
      return value !== undefined && value !== null && value !== "";
    }).length;
    const hasSearch = searchQuery.trim().length > 0;
    const hasCustomSort = sortOrder !== "soonest";
    return filterEntries + (hasSearch ? 1 : 0) + (hasCustomSort ? 1 : 0);
  }, [filters, searchQuery, sortOrder]);

  return (
    <main className="min-h-screen bg-[#060810]">

      {/* Page hero — minimal but distinct */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        {/* Ambient top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(124,90,245,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative container px-4 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5"
          >
            {/* Label */}
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-violet-500/50" />
              <span className="text-[11px] font-mono tracking-[0.2em] text-violet-400/60 uppercase">
                Discover
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                  All Events
                </h1>
                <p className="text-sm text-white/35">
                  {total > 0
                    ? `${total} event${total === 1 ? "" : "s"} available`
                    : "Find your next unforgettable experience"}
                </p>
              </div>

              {/* Sort pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortOrder(opt.value)}
                    className="shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-150"
                    style={{
                      background: sortOrder === opt.value ? "rgba(124,90,245,0.15)" : "transparent",
                      border: `1px solid ${sortOrder === opt.value ? "rgba(124,90,245,0.35)" : "rgba(255,255,255,0.07)"}`,
                      color: sortOrder === opt.value ? "#9d7dff" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search + filter row */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative w-full flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search events, hosts, venues…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl pl-10 pr-10 text-sm text-white placeholder:text-white/25 transition-all focus:outline-none"
                  style={{
                    background: "rgba(14,16,24,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(124,90,245,0.4)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,90,245,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-medium transition-all duration-200 sm:w-auto"
                style={{
                  background: filtersOpen ? "rgba(124,90,245,0.12)" : "rgba(14,16,24,0.8)",
                  border: `1px solid ${filtersOpen ? "rgba(124,90,245,0.30)" : "rgba(255,255,255,0.08)"}`,
                  color: filtersOpen ? "#9d7dff" : "rgba(255,255,255,0.40)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-violet-400/35 bg-violet-500/15 px-1.5 text-[10px] font-bold text-violet-200">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Collapsible filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/[0.05]"
            >
              <div className="container px-4 py-5 md:px-8">
                <EventFiltersComponent
                  filters={filters}
                  onFiltersChange={(f) => { setFilters(f); setPage(0); }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="container px-4 py-8 md:px-8">
        {isLoading ? (
          <EventGridSkeleton count={12} />
        ) : sortedEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-32 text-center"
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(124,90,245,0.08)", border: "1px solid rgba(124,90,245,0.15)" }}
            >
              <Sparkles className="h-7 w-7 text-violet-400/40" />
            </div>
            <div>
              <p className="text-base font-semibold text-white/60 mb-1">No events found</p>
              <p className="text-sm text-white/25">Try adjusting your filters or search query</p>
            </div>
            {(searchQuery || Object.keys(filters).length > 0) && (
              <button
                onClick={() => { setSearchQuery(""); setFilters({}); }}
                className="mt-2 px-4 py-2 rounded-full text-[13px] font-medium text-white/50 hover:text-white transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            <EventList events={sortedEvents} isLoading={false} />
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
