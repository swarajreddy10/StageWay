"use client";

import { format } from "date-fns";
import { Control, FieldPath, FieldValues } from "react-hook-form";

import { DatePicker } from "@/components/ui/date-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface DateFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  allowPresent?: boolean;
  required?: boolean;
}

export function DateField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Pick a date",
  allowPresent = false,
  required = false,
}: DateFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <FormControl>
            <DatePicker
              date={
                field.value && field.value !== "Present" ? new Date(`${field.value} 1`) : undefined
              }
              onSelect={(date) => {
                const newValue = date ? format(date, "MMM yyyy") : allowPresent ? "Present" : "";
                field.onChange(newValue);
                setTimeout(() => {
                  if ("trigger" in control && typeof control.trigger === "function") {
                    (control as { trigger: (name: string) => void }).trigger(name);
                  }
                }, 100);
              }}
              placeholder={placeholder}
              allowPresent={allowPresent}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
