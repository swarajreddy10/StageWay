"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { format } from "date-fns";
import { ChevronDownIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  "WORKSHOP",
  "CONCERT",
  "CONFERENCE",
  "SEMINAR",
  "NETWORKING",
  "SPORTS",
  "ARTS",
  "OTHER",
];

export function EventFiltersComponent({
  filters,
  onFiltersChange,
  sortOrder,
  onSortChange,
}: EventFiltersProps) {
  const { register, handleSubmit, setValue, reset, control } = useForm<EventFilters>({
    defaultValues: filters,
  });
  const [categoryValue, setCategoryValue] = useState<string>(filters.category || "ALL");

  const dateFrom = useWatch({ control, name: "dateFrom" });
  const dateTo = useWatch({ control, name: "dateTo" });
  const priceMax = useWatch({ control, name: "priceMax" });
  const isFree = useWatch({ control, name: "isFree" });

  const normalizeFilters = (data: EventFilters): EventFilters => {
    const normalized: EventFilters = {};

    const search = data.search?.trim();
    if (search) {
      normalized.search = search;
    }

    if (data.category) {
      normalized.category = data.category;
    }

    if (data.dateFrom) {
      normalized.dateFrom = data.dateFrom;
    }

    if (data.dateTo) {
      normalized.dateTo = data.dateTo;
    }

    const location = data.location?.trim();
    if (location) {
      normalized.location = location;
    }

    if (typeof data.priceMax === "number" && Number.isFinite(data.priceMax)) {
      normalized.priceMax = data.priceMax;
    }

    if (data.isFree) {
      normalized.isFree = true;
    }

    return normalized;
  };

  const onSubmit = (data: EventFilters) => {
    onFiltersChange(normalizeFilters(data));
  };

  const clearFilters = () => {
    reset({});
    setCategoryValue("ALL");
    onFiltersChange({});
  };

  const activeFilters = Object.values(filters).filter(
    (value) => value !== undefined && value !== null && value !== ""
  );
  const hasActiveFilters = activeFilters.length > 0;

  const formattedFrom = useMemo(() => {
    if (!dateFrom) return "From";
    const parsed = new Date(dateFrom);
    return Number.isNaN(parsed.getTime()) ? "From" : format(parsed, "MMM d");
  }, [dateFrom]);

  const formattedTo = useMemo(() => {
    if (!dateTo) return "To";
    const parsed = new Date(dateTo);
    return Number.isNaN(parsed.getTime()) ? "To" : format(parsed, "MMM d");
  }, [dateTo]);

  const handleDateChange = (field: "dateFrom" | "dateTo", value?: Date) => {
    setValue(field, value ? format(value, "yyyy-MM-dd") : undefined);
    handleSubmit(onSubmit)();
  };

  const debouncedSubmit = useDebounce(() => {
    handleSubmit(onSubmit)();
  }, 350);

  const maxPriceValue =
    typeof priceMax === "number" && Number.isFinite(priceMax) ? priceMax : 10000;

  const handlePriceChange = (value: number) => {
    setValue("priceMax", value === 10000 ? undefined : value);
    debouncedSubmit();
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-sm">
      <div className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="outline" className="border-white/70 bg-white/70 text-xs px-1.5 py-0">
              {activeFilters.length}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-white/70 bg-white/70 hover:bg-white h-7 text-xs px-2"
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
      <div className="space-y-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[140px] space-y-1">
              <Label htmlFor="category" className="text-xs font-medium">
                Category
              </Label>
              <Select
                value={categoryValue}
                onValueChange={(value) => {
                  setCategoryValue(value);
                  setValue("category", value === "ALL" ? undefined : (value as EventCategory));
                  handleSubmit(onSubmit)();
                }}
              >
                <SelectTrigger className="bg-white/90 h-8 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[140px] space-y-1">
              <Label htmlFor="location" className="text-xs font-medium">
                Location
              </Label>
              <Input
                id="location"
                placeholder="City"
                {...register("location")}
                onChange={(e) => {
                  register("location").onChange(e);
                  debouncedSubmit();
                }}
                className="bg-white/90 h-8 text-xs"
              />
            </div>

            <div className="flex-[1.5] min-w-[200px] space-y-1">
              <Label className="text-xs font-medium">Date Range</Label>
              <div className="flex gap-1">
                <input type="hidden" {...register("dateFrom")} />
                <input type="hidden" {...register("dateTo")} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-between border-white/70 bg-white/90 font-normal hover:bg-white h-8 text-xs px-2",
                        dateFrom && "text-foreground"
                      )}
                    >
                      <span className="truncate">{formattedFrom}</span>
                      <ChevronDownIcon className="h-3 w-3 ml-1 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      defaultMonth={dateFrom ? new Date(dateFrom) : undefined}
                      selected={dateFrom ? new Date(dateFrom) : undefined}
                      onSelect={(date) => handleDateChange("dateFrom", date)}
                      captionLayout="dropdown"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-between border-white/70 bg-white/90 font-normal hover:bg-white h-8 text-xs px-2",
                        dateTo && "text-foreground"
                      )}
                    >
                      <span className="truncate">{formattedTo}</span>
                      <ChevronDownIcon className="h-3 w-3 ml-1 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      defaultMonth={dateTo ? new Date(dateTo) : undefined}
                      selected={dateTo ? new Date(dateTo) : undefined}
                      onSelect={(date) => handleDateChange("dateTo", date)}
                      captionLayout="dropdown"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex-1 min-w-[160px] space-y-1">
              <Label className="text-xs font-medium">Price (Max ₹{maxPriceValue === 10000 ? "10k+" : `${(maxPriceValue / 1000).toFixed(0)}k`})</Label>
              <input
                id="priceMax"
                type="range"
                min={0}
                max={10000}
                step={100}
                value={maxPriceValue}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="w-full h-8 cursor-pointer accent-[#1E5A55]"
                aria-label="Maximum price"
              />
            </div>

            {onSortChange && (
              <div className="flex-1 min-w-[120px] space-y-1">
                <Label className="text-xs font-medium">Sort</Label>
                <Select value={sortOrder} onValueChange={onSortChange}>
                  <SelectTrigger className="bg-white/90 h-8 text-xs">
                    <SelectValue placeholder="Soonest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soonest">Soonest</SelectItem>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="price-low">Low price</SelectItem>
                    <SelectItem value="price-high">High price</SelectItem>
                    <SelectItem value="seats">Most seats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end h-8">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFree"
                  checked={!!isFree}
                  onCheckedChange={(checked) => {
                    setValue("isFree", checked || undefined);
                    handleSubmit(onSubmit)();
                  }}
                  className="scale-75"
                />
                <Label htmlFor="isFree" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                  Free only
                </Label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
