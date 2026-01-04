"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface DateTimeFieldProps {
  value?: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
}

export function DateTimeField({
  value,
  onChange,
  label,
  disabled = false,
  error,
}: DateTimeFieldProps) {
  const [open, setOpen] = React.useState(false);
  const parsedDate = value ? new Date(value) : undefined;
  const dateValue = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;
  const timeValue = dateValue ? format(dateValue, "HH:mm:ss") : "10:00:00";

  const formatLocalDateTime = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes, seconds] = timeValue.split(":");
      const combined = new Date(date);
      combined.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || "0"));
      onChange(formatLocalDateTime(combined));
    }
    setOpen(false);
  };

  const handleTimeChange = (time: string) => {
    if (dateValue) {
      const [hours, minutes, seconds] = time.split(":");
      const combined = new Date(dateValue);
      combined.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || "0"));
      onChange(formatLocalDateTime(combined));
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label} *</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-between font-normal"
              disabled={disabled}
            >
              {dateValue ? format(dateValue, "MMM d, yyyy") : "Select date"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              captionLayout="dropdown"
              onSelect={handleDateChange}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          step="1"
          value={timeValue}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={disabled}
          className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
