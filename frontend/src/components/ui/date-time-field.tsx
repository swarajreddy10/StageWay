"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [timeInput, setTimeInput] = React.useState("");
  
  const parsedDate = value ? new Date(value) : undefined;
  const dateValue = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;
  
  // Initialize time input when date changes
  React.useEffect(() => {
    if (dateValue) {
      setTimeInput(format(dateValue, "hh:mm a")); // 12-hour format with AM/PM
    }
  }, [dateValue]);

  const formatLocalDateTime = (date: Date) => 
    format(date, "yyyy-MM-dd'T'HH:mm:ss");

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    // Combine with existing time or default to 10:00 AM
    let hours = 10; // Default 10 AM
    let minutes = 0;
    
    if (timeInput) {
      const timeParts = timeInput.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeParts) {
        let parsedHours = parseInt(timeParts[1]);
        minutes = parseInt(timeParts[2]);
        const period = timeParts[3]?.toUpperCase();
        
        // Convert 12-hour to 24-hour format
        if (period === 'PM' && parsedHours !== 12) {
          parsedHours += 12;
        } else if (period === 'AM' && parsedHours === 12) {
          parsedHours = 0;
        }
        
        hours = parsedHours;
      }
    }
    
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    onChange(formatLocalDateTime(combined));
    setOpen(false);
  };

  const handleTimeChange = (time: string) => {
    setTimeInput(time);
    
    if (dateValue) {
      // Parse the new time
      const timeParts = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!timeParts) return;
      
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3]?.toUpperCase();
      
      // Convert 12-hour to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const combined = new Date(dateValue);
      combined.setHours(hours, minutes, 0, 0);
      onChange(formatLocalDateTime(combined));
    }
  };

  const validateTime = (time: string): boolean => {
    const timeParts = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!timeParts) return false;
    
    const hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    
    return hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59;
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
        <Input
          type="time"
          step="60" // Step by minutes
          value={timeInput}
          onChange={(e) => handleTimeChange(e.target.value)}
          onBlur={(e) => {
            const time = e.target.value;
            if (!validateTime(time)) {
              e.target.value = format(dateValue || new Date(), "hh:mm a");
            }
          }}
          disabled={disabled}
          placeholder="10:00 AM"
          className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
