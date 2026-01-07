"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

interface DateTimeFieldProps {
  value?: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DateTimeField({
  value,
  onChange,
  label,
  disabled = false,
  error,
  minDate,
  maxDate,
}: DateTimeFieldProps) {
  const [open, setOpen] = React.useState(false);
  
  const parsedDate = value ? new Date(value) : undefined;
  const dateValue = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;

  const formatLocalDateTime = (date: Date) => 
    format(date, "yyyy-MM-dd'T'HH:mm:ss");

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    // Preserve existing time or default to 10:00 AM
    const hours = dateValue?.getHours() ?? 10;
    const minutes = dateValue?.getMinutes() ?? 0;
    
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    onChange(formatLocalDateTime(combined));
    setOpen(false);
  };

  const handleTimeChange = (time: string) => {
    if (!dateValue) {
      // If no date selected, use today
      const today = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      today.setHours(hours, minutes, 0, 0);
      onChange(formatLocalDateTime(today));
      return;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(dateValue);
    combined.setHours(hours, minutes, 0, 0);
    onChange(formatLocalDateTime(combined));
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
              fromDate={minDate}
              toDate={maxDate}
            />
          </PopoverContent>
        </Popover>
        <TimePicker
          value={value}
          onChange={handleTimeChange}
          disabled={disabled}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
