"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

export function DatePicker<T extends FieldValues>({ pl = "Select", name = 'Choose', props }: { name?: string; pl?: string; props: ControllerRenderProps<T> }) {
  const [open, setOpen] = React.useState(false);

  const { value, onChange } = props;
  return (
    <div className="flex flex-col space-y-2">
      {name && (
        <Label htmlFor="date" className="px-1">
          {name}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date" className="min-w-32 justify-between font-normal h-10 bg-white">
            {value ? new Date(value).toLocaleDateString() : pl}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
