import React from "react";

interface ContainerHeaderProps {
  group?: string;
  title: string;
}

export default function ContainerHeader({group, title}: ContainerHeaderProps) {
  return (
    <div className="bg-white h-16 px-10 border border-slate-200 flex items-center">
      <h1 className="text-lg font-bold">{group} / {title}</h1>
    </div>
  );
}
