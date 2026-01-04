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
import { Card } from "@/components/ui/card";
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

      <div className="space-y-6">
        <EventFiltersComponent
          filters={filters}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          onFiltersChange={(f) => {
            setFilters(f);
            setPage(0);
          }}
        />
        <Card className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[240px] flex-1">
              <InputGroup className="rounded-full border-white/70 bg-white/90 px-3">
                <InputGroupInput
                  placeholder="Search events, hosts, or venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
                <InputGroupAddon align="inline-start">
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <InputGroupText className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              {pagination?.totalElements || 0} live events available
            </InputGroupText>
          </div>
        </Card>
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
