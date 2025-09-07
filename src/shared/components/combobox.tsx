"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { COLOR_HEX, ColorName } from "@/lib/colors";

type InputType = {
  value: string;
  label: string;
  color?: string;
};

export function ComboBox<T extends FieldValues>({
  items,
  search = undefined,
  name = "Сонгох",
  className = "w-full",
  pl,
  props,
}: {
  items: InputType[];
  name?: string;
  search?: (v: string) => void;
  className?: string;
  pl?: string;
  value?: string;
  label?: string;
  color?: string;
  props: ControllerRenderProps<T>;
}) {
  const [open, setOpen] = React.useState(false);
  const [localItems, setLocalItems] = React.useState(items);
  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);
  const { value, onChange } = props;
  return (
    <Popover
      modal={true}
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v && search) search("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            className,
            "min-w-32 lg:min-h-10 justify-between bg-white text-xs w-full lg:text-sm"
          )}
        >
          {value
            ? items.find((framework) => framework.value == value)?.label
            : name}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className={cn(className, "p-0 bg-white min-w-48")}>
        <Command filter={() => 1}>
          {search && (
            <CommandInput
              placeholder={pl}
              onValueChange={(e) => {
                search(e);
              }}
              // onchange
              className="h-9"
            />
          )}
          <CommandList
            className="max-h-60 "
            key={localItems.map((i) => i.value).join(",")}
          >
            <CommandEmpty>Хайлт олдсонгүй</CommandEmpty>
            <CommandGroup>
              {items.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={`${framework.label}__${framework.value}`}
                  onSelect={(currentValue) => {
                    const val = currentValue?.split("__")?.[1];
                    const vl =
                      currentValue === value ? "" : val ? val : currentValue;
                    onChange(vl);
                    setOpen(false);
                  }}
                  // className={framework.color ? `text-white` : ""}
                  // style={{
                  //   background: framework?.color
                  //     ? COLOR_HEX[framework.color as ColorName]
                  //     : "",
                  // }}
                >
                  {framework?.color && (
                    <div
                      className="size-4 rounded"
                      style={{
                        backgroundColor: framework?.color
                          ? COLOR_HEX[framework.color as ColorName]
                          : "",
                      }}
                    ></div>
                  )}

                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
