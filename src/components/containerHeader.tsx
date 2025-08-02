import React from "react";

interface ContainerHeaderProps {
  group?: string;
  title: string;
}

export default function ContainerHeader({group, title}: ContainerHeaderProps) {
  return (
    <div className="bg-white py-3 px-6 rounded-xl shadow-sm">
      <h1 className="text-lg font-bold">{group} / {title}</h1>
    </div>
  );
}
