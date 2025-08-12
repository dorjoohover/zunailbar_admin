import { ChevronRight, Minus } from "lucide-react";
import React from "react";

interface ContainerHeaderProps {
  group?: string;
  title: string;
  count?: number;
}

export default function ContainerHeader({ group, title, count }: ContainerHeaderProps) {
  return (
    <div className="bg-white h-16 px-10 border border-slate-200 flex items-center space-x-5 shadow">
      <div className="text-lg font-semibold flex items-center gap-x-2">
        <span className="opacity-80">{group}</span>
        <ChevronRight />
        <span>{title}</span>
      </div>
        <div className="flex items-center gap-x-5">
          <span>-</span>
          <span className="w-14 h-8 border rounded-full flex-center font-bold">{count}</span>
        </div>
    </div>
  );
}
