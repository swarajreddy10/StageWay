"use client";

import { useEffect, useMemo, useState } from "react";
import { EventList } from "@/components/events/EventList";
import { EventFiltersComponent } from "@/components/events/EventFilters";
import { Pagination } from "@/components/ui/pagination";
import { useEvents } from "@/hooks/useEvents";
import type { EventFilters } from "@/types/event";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [sortOrder, setSortOrder] = useState("soonest");
  const { events, isLoading, fetchEvents, pagination } = useEvents(filters, false);

  useEffect(() => {
    fetchEvents({ ...filters, page, size: pageSize });
  }, [filters, page, pageSize, fetchEvents]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchQuery || undefined }));
      setPage(0); // Reset to first page on search
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortedEvents = useMemo(() => {
    const sorted = [...events];
    switch (sortOrder) {
      case "latest":
        sorted.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        break;
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "seats":
        sorted.sort((a, b) => b.availableSeats - a.availableSeats);
        break;
      default:
        sorted.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        break;
    }
    return sorted;
  }, [events, sortOrder]);

  return (
    <main className="container mx-auto min-h-screen px-4 pb-16 pt-8">
      <PageHeader
        badge={
          <Badge className="bg-white/80 text-foreground border border-white/70">Event Finder</Badge>
        }
        title="Discover events with your vibe"
        description="Curated nights, meetups, and live moments built around what's happening now."
        className="mb-8"
      />

      <div className="space-y-4 p-6 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-sm shadow-sm">
        <EventFiltersComponent
          filters={filters}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onFiltersChange={(f) => {
            setFilters(f);
            setPage(0);
          }}
        />
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[280px] flex-1">
              <InputGroup className="rounded-xl border-2 border-[#1E5A55]/20 bg-white shadow-sm hover:border-[#1E5A55]/40 transition-colors">
                <InputGroupAddon align="inline-start" className="pl-4">
                  <Search className="h-5 w-5 text-[#1E5A55]" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search events, hosts, or venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 text-sm font-medium placeholder:text-muted-foreground/60 pl-2"
                />
              </InputGroup>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E5A55]/10 border border-[#1E5A55]/20">
              <div className="h-2 w-2 rounded-full bg-[#1E5A55] animate-pulse" />
              <InputGroupText className="text-xs font-semibold text-[#1E5A55] uppercase tracking-wider">
                {pagination?.totalElements ? `${pagination.totalElements} Events Live` : 'Discover Events'}
              </InputGroupText>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <EventList events={sortedEvents} isLoading={isLoading} />
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </main>
  );
}
