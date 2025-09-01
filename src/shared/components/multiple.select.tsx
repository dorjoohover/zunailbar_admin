"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

type Item = { value: string; label: string };

export function MultiSelect<T extends FieldValues>({
  items,
  props,
  placeholder = "Сонгох...",
  className,
}: {
  props: ControllerRenderProps<T, any>; // RHF field (value, onChange, name...)
  items: Item[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  // RHF value-г string[] гэж үзнэ (хоосон үед [])
  const value: string[] = Array.isArray(props.value) ? props.value : [];

  const toggleValue = (val: string) => {
    const exists = value.includes(val);
    const next = exists ? value.filter((v) => v !== val) : [...value, val];
    props.onChange(next); // ← form-д буцаана
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onChange([]);
  };

  const display = value.length
    ? items
        .filter((i) => value.includes(i.value))
        .map((i) => i.label)
        .join(", ")
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn("w-[260px] justify-between", className)}
        >
          <span className={cn(!value.length && "text-muted-foreground")}>
            {display}
          </span>
          <div className="flex items-center gap-1">
            {value.length > 0 && (
              <X
                className="h-4 w-4 opacity-60 hover:opacity-100"
                onClick={clearAll}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Хайх..." />
          <CommandList>
            <CommandEmpty>Юу ч олдсонгүй</CommandEmpty>
            <CommandGroup>
              {items.map((it) => {
                const active = value.includes(it.value);
                return (
                  <CommandItem
                    key={it.value}
                    onSelect={() => toggleValue(it.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        active ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {it.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
