"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

type Mode = "single" | "range";

interface DatePickerProps {
  name?: string;
  pl?: string;
  mode?: Mode;
  value?: Date | DateRange;
  onChange: (value: Date | DateRange | undefined) => void;
}

export function DatePicker({
  name,
  pl = "Select date",
  mode = "single",
  value,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const getDisplayText = () => {
    if (mode === "range") {
      const range = value as DateRange | undefined;

      if (range?.from && range?.to) {
        return `${format(range.from, "yyyy/MM/dd")} - ${format(
          range.to,
          "yyyy/MM/dd",
        )}`;
      }

      if (range?.from) {
        return format(range.from, "yyyy/MM/dd");
      }

      return pl;
    }

    if (mode === "single" && value instanceof Date) {
      return format(value, "yyyy/MM/dd");
    }

    return pl;
  };

  return (
    <div className="flex flex-col space-y-2">
      {name && <Label className="px-1">{name}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-32 justify-between font-normal h-10 bg-white"
          >
            {getDisplayText()}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode={mode}
            selected={value as any}
            defaultMonth={
              mode === "range" ? (value as DateRange)?.from : (value as Date)
            }
            captionLayout="dropdown"
            required={mode === "range"}
            onSelect={(selected: Date | DateRange | undefined) => {
              onChange(selected as any);

              if (mode === "single") {
                setOpen(false);
              }

              if (
                mode === "range" &&
                (selected as DateRange)?.from &&
                (selected as DateRange)?.to
              ) {
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
