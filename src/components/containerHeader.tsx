import React from "react";

interface ContainerHeaderProps {
  group?: string;
  title: string;
}

export default function ContainerHeader({group, title}: ContainerHeaderProps) {
  return (
    <div className="bg-white py-4 px-6 sm:pl-10 border border-slate-200">
      <h1 className="text-lg font-bold">{group} / {title}</h1>
    </div>
  );
}
