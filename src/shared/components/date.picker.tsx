"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export function DatePicker<T extends FieldValues>({
  pl = "Select",
  name = "Choose",
  props,
  range,
  setRange,
}: {
  name?: string;
  pl?: string;
  range?: DateRange;
  setRange: (range: DateRange) => void;
  props: ControllerRenderProps<T>;
}) {
  const [open, setOpen] = React.useState(false);
  const { onChange } = props;

  // Сонгосон range-г форматлах функц
  const getDisplayText = () => {
    if (range?.from && range?.to) {
      return `${format(range.from, "yyyy/MM/dd")} - ${format(
        range.to,
        "yyyy/MM/dd"
      )}`;
    }
    if (range?.from) {
      return format(range.from, "yyyy/MM/dd");
    }
    return pl;
  };

  return (
    <div className="flex flex-col space-y-2">
      {name && (
        <Label htmlFor="date" className="px-1">
          {name}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="min-w-32 justify-between font-normal h-10 bg-white"
          >
            {getDisplayText()}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            defaultMonth={range?.from}
            captionLayout="dropdown"
            onSelect={(selected) => {
              if (selected) {
                setRange(selected);
                onChange(selected);
                if (selected?.from && selected?.to) {
                  setOpen(false);
                }
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
