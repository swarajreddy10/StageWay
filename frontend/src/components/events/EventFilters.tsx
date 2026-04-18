"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { format } from "date-fns";
import { ChevronDownIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { EventFilters, EventCategory } from "@/types/event";

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  sortOrder?: string;
  onSortChange?: (order: string) => void;
}

const categories: EventCategory[] = [
  "WORKSHOP", "CONCERT", "CONFERENCE", "SEMINAR",
  "NETWORKING", "SPORTS", "ARTS", "OTHER",
];

const selectCls = "bg-white/[0.04] border-white/[0.08] text-white/80 text-xs h-8 focus:border-white/25";
const selectContentCls = "bg-[#0e1018] border-white/[0.08]";
const selectItemCls = "text-white/70 focus:bg-white/[0.06] focus:text-white text-xs";

export function EventFiltersComponent({ filters, onFiltersChange, sortOrder, onSortChange }: EventFiltersProps) {
  const { register, handleSubmit, setValue, reset, control } = useForm<EventFilters>({ defaultValues: filters });
  const [categoryValue, setCategoryValue] = useState<string>(filters.category || "ALL");

  const dateFrom = useWatch({ control, name: "dateFrom" });
  const dateTo   = useWatch({ control, name: "dateTo" });
  const priceMax = useWatch({ control, name: "priceMax" });
  const isFree   = useWatch({ control, name: "isFree" });

  const normalizeFilters = (data: EventFilters): EventFilters => {
    const out: EventFilters = {};
    const s = data.search?.trim(); if (s) out.search = s;
    if (data.category) out.category = data.category;
    if (data.dateFrom) out.dateFrom = data.dateFrom;
    if (data.dateTo)   out.dateTo   = data.dateTo;
    const loc = data.location?.trim(); if (loc) out.location = loc;
    if (typeof data.priceMax === "number" && Number.isFinite(data.priceMax)) out.priceMax = data.priceMax;
    if (data.isFree) out.isFree = true;
    return out;
  };

  const onSubmit = (data: EventFilters) => onFiltersChange(normalizeFilters(data));
  const clearFilters = () => { reset({}); setCategoryValue("ALL"); onFiltersChange({}); };

  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== null && v !== "").length;
  const hasActive = activeCount > 0;

  const formattedFrom = useMemo(() => {
    if (!dateFrom) return "From";
    const p = new Date(dateFrom);
    return Number.isNaN(p.getTime()) ? "From" : format(p, "MMM d");
  }, [dateFrom]);

  const formattedTo = useMemo(() => {
    if (!dateTo) return "To";
    const p = new Date(dateTo);
    return Number.isNaN(p.getTime()) ? "To" : format(p, "MMM d");
  }, [dateTo]);

  const handleDateChange = (field: "dateFrom" | "dateTo", value?: Date) => {
    setValue(field, value ? format(value, "yyyy-MM-dd") : undefined);
    handleSubmit(onSubmit)();
  };

  const debouncedSubmit = useDebounce(() => { handleSubmit(onSubmit)(); }, 350);

  const maxPriceValue = typeof priceMax === "number" && Number.isFinite(priceMax) ? priceMax : 10000;
  const handlePriceChange = (value: number) => {
    setValue("priceMax", value === 10000 ? undefined : value);
    debouncedSubmit();
  };

  return (
    <div className="space-y-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/80">Filters</h3>
          {hasActive && (
            <Badge className="bg-white/[0.08] text-white/60 border-white/[0.12] text-[10px] px-1.5 py-0">{activeCount}</Badge>
          )}
        </div>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-white/40 hover:text-white px-2">
            <X className="mr-1 h-3 w-3" />Clear
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-2">
        {/* Category */}
        <div className="flex-1 min-w-[140px] space-y-1">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Category</Label>
          <Select value={categoryValue} onValueChange={(v) => {
            setCategoryValue(v);
            setValue("category", v === "ALL" ? undefined : (v as EventCategory));
            handleSubmit(onSubmit)();
          }}>
            <SelectTrigger className={selectCls}><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent className={selectContentCls}>
              <SelectItem value="ALL" className={selectItemCls}>All</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c} className={selectItemCls}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="flex-1 min-w-[140px] space-y-1">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Location</Label>
          <input
            placeholder="City"
            {...register("location")}
            onChange={(e) => { register("location").onChange(e); debouncedSubmit(); }}
            className="w-full h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
          />
        </div>

        {/* Date range */}
        <div className="flex-[1.5] min-w-[200px] space-y-1">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Date Range</Label>
          <div className="flex gap-1">
            <input type="hidden" {...register("dateFrom")} />
            <input type="hidden" {...register("dateTo")} />
            {(["dateFrom", "dateTo"] as const).map((field, i) => (
              <Popover key={field}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="sm"
                    className={cn("flex-1 justify-between h-8 text-xs px-2 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white",
                      (i === 0 ? dateFrom : dateTo) && "text-white/80"
                    )}
                  >
                    <span className="truncate">{i === 0 ? formattedFrom : formattedTo}</span>
                    <ChevronDownIcon className="h-3 w-3 ml-1 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-[#0e1018] border-white/[0.08]" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={i === 0 && dateFrom ? new Date(dateFrom) : dateTo ? new Date(dateTo) : undefined}
                    selected={i === 0 && dateFrom ? new Date(dateFrom) : dateTo ? new Date(dateTo) : undefined}
                    onSelect={(date) => handleDateChange(field, date)}
                    captionLayout="dropdown"
                    initialFocus
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex-1 min-w-[160px] space-y-1">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Price max: {maxPriceValue === 10000 ? "Any" : `₹${(maxPriceValue / 1000).toFixed(0)}k`}
          </Label>
          <input
            type="range" min={0} max={10000} step={100} value={maxPriceValue}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
            className="w-full h-8 cursor-pointer accent-white"
            aria-label="Maximum price"
          />
        </div>

        {/* Sort */}
        {onSortChange && (
          <div className="flex-1 min-w-[120px] space-y-1">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Sort</Label>
            <Select value={sortOrder} onValueChange={onSortChange}>
              <SelectTrigger className={selectCls}><SelectValue placeholder="Soonest" /></SelectTrigger>
              <SelectContent className={selectContentCls}>
                {[
                  { v: "soonest",    l: "Soonest" },
                  { v: "latest",     l: "Latest" },
                  { v: "price-low",  l: "Cheapest" },
                  { v: "price-high", l: "Priciest" },
                  { v: "seats",      l: "Most seats" },
                ].map(({ v, l }) => <SelectItem key={v} value={v} className={selectItemCls}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Free toggle */}
        <div className="flex items-end h-8">
          <div className="flex items-center gap-1.5">
            <Switch
              id="isFree"
              checked={!!isFree}
              onCheckedChange={(c) => { setValue("isFree", c || undefined); handleSubmit(onSubmit)(); }}
              className="scale-75 data-[state=checked]:bg-white"
            />
            <Label htmlFor="isFree" className="text-xs text-white/50 cursor-pointer whitespace-nowrap">Free only</Label>
          </div>
        </div>
      </form>
    </div>
  );
}
