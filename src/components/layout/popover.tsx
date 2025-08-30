// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@radix-ui/react-popover";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

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
            <div className="flex items-center justify-between w-full font-normal">
              <span className="w-full truncate">{value ?? "Сонгох"}</span>

              <ChevronDown />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto min-w-[150px] z-10 p-2 relative overflow-hidden ">
          <ScrollArea className="max-h-[50vh] overflow-y-auto truncate max-w-[300px]">
            {/* <div className="flex flex-col bg-white truncate max-w-[300px]">{content}</div> */}
            <>
            {content}
            </>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
