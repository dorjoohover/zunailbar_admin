// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@radix-ui/react-popover";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";

export const FilterPopover = ({
  content,
  label,
  value,
}: {
  label: string;
  value?: string;

  content: ReactNode;
}) => {
  const [selected, setSelected] = useState();
  return (
    <div className="relative space-y-2">
      <h1 className="text-xs font-bold text-gray-500">{label}</h1>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="inline-flex items-center justify-start text-left gap-1 w-[160px] truncate px-2 rounded">
            <div className="font-normal w-full flex items-center justify-between">
              <span className="w-full truncate">{value ?? "Сонгох"}</span>

              <ChevronDown />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto min-w-[150px] z-10 p-2">
          <div className="flex flex-col bg-white">{content}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
