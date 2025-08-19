"use client";

import { usePathname } from "next/navigation";
import { items } from "./app-sidebar";
import ContainerHeader from "./containerHeader";

interface DynamicHeaderProps {
  count?: number;
  titleOverride?: string;
  groupOverride?: string;
}

export default function DynamicHeader({ count, titleOverride, groupOverride }: DynamicHeaderProps) {
  const pathname = usePathname();

  const findGroupAndTitle = () => {
    for (const item of items) {
      if (item.url && item.url === pathname) {
        return { group: item.title, title: "" };
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.url === pathname) {
            return { group: item.title, title: child.title };
          }
        }
      }
    }
    return { group: "", title: "" };
  };

  const { group, title } = findGroupAndTitle();

  return (
    <ContainerHeader
      group={groupOverride ?? group}
      title={titleOverride ?? title}
      count={count}
    />
  );
}
