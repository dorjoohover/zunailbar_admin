import { ChevronRight } from "lucide-react";
import React from "react";

interface ContainerHeaderProps {
  group?: string;
  title: string;
}

export default function ContainerHeader({ group, title }: ContainerHeaderProps) {
  return (
    <div className="bg-white h-16 px-10 border border-slate-200 flex items-center">
      <div className="text-lg font-semibold flex items-center">
        <span className="opacity-80">{group}</span>
        <ChevronRight />
        <span>{title}</span>
      </div>
    </div>
  );
}
