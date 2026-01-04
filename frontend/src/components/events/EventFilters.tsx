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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          {hasActiveFilters && (
            <Badge variant="outline" className="border-white/70 bg-white/70">
              {activeFilters.length} active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-white/70 bg-white/70 hover:bg-white"
          >
            <X className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
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
                <SelectTrigger className="bg-white/90">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                placeholder="City or venue"
                {...register("location")}
                onChange={(e) => {
                  register("location").onChange(e);
                  debouncedSubmit();
                }}
                className="bg-white/90"
              />
            </div>

            {onSortChange && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort by</Label>
                <Select value={sortOrder} onValueChange={onSortChange}>
                  <SelectTrigger className="bg-white/90">
                    <SelectValue placeholder="Soonest first" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soonest">Soonest first</SelectItem>
                    <SelectItem value="latest">Latest first</SelectItem>
                    <SelectItem value="price-low">Lowest price</SelectItem>
                    <SelectItem value="price-high">Highest price</SelectItem>
                    <SelectItem value="seats">Most seats left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date range</Label>
              <div className="grid grid-cols-2 gap-2">
                <input type="hidden" {...register("dateFrom")} />
                <input type="hidden" {...register("dateTo")} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-between border-white/70 bg-white/90 font-normal hover:bg-white",
                        dateFrom && "text-foreground"
                      )}
                    >
                      <span>{formattedFrom}</span>
                      <ChevronDownIcon className="h-4 w-4" />
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
                      className={cn(
                        "justify-between border-white/70 bg-white/90 font-normal hover:bg-white",
                        dateTo && "text-foreground"
                      )}
                    >
                      <span>{formattedTo}</span>
                      <ChevronDownIcon className="h-4 w-4" />
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">Price range</Label>
              <div className="rounded-xl border border-white/70 bg-white/90 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>₹0</span>
                  <span className="font-medium text-foreground">
                    {maxPriceValue === 10000
                      ? "₹10,000+"
                      : `₹${maxPriceValue.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <input
                  id="priceMax"
                  type="range"
                  min={0}
                  max={10000}
                  step={100}
                  value={maxPriceValue}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="w-full h-2 cursor-pointer accent-[#1E5A55]"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isFree"
                checked={!!isFree}
                onCheckedChange={(checked) => {
                  setValue("isFree", checked || undefined);
                  handleSubmit(onSubmit)();
                }}
              />
              <Label htmlFor="isFree" className="text-sm font-medium cursor-pointer">
                Free only
              </Label>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
