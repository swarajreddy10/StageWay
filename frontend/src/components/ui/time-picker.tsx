"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as React from "react";

interface TimePickerProps {
  value?: string; // ISO string or time string
  onChange: (time: string) => void;
  disabled?: boolean;
}

export function TimePicker({ value, onChange, disabled = false }: TimePickerProps) {
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: "10", minute: "00", period: "AM" };
    
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return { hour: "10", minute: "00", period: "AM" };
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    
    // Convert to 12-hour format
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    
    return {
      hour: hours.toString().padStart(2, "0"),
      minute: minutes.toString().padStart(2, "0"),
      period,
    };
  };

  const { hour, minute, period } = parseTime(value || "");
  
  const handleChange = (newHour: string, newMinute: string, newPeriod: string) => {
    let hours24 = parseInt(newHour);
    
    // Convert to 24-hour format
    if (newPeriod === "PM" && hours24 !== 12) {
      hours24 += 12;
    } else if (newPeriod === "AM" && hours24 === 12) {
      hours24 = 0;
    }
    
    // Create time string in HH:mm format
    const timeString = `${hours24.toString().padStart(2, "0")}:${newMinute}`;
    onChange(timeString);
  };

  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return h.toString().padStart(2, "0");
  });

  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <div className="flex gap-2">
      <Select
        value={hour}
        onValueChange={(h) => handleChange(h, minute, period)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span className="flex items-center text-lg font-medium">:</span>
      
      <Select
        value={minute}
        onValueChange={(m) => handleChange(hour, m, period)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={period}
        onValueChange={(p) => handleChange(hour, minute, p)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[75px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
