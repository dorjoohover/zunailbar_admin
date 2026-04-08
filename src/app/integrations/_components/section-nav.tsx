"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/integrations/daily",
    label: "Борлуулалт, өдрийн нэгтгэл",
  },
  {
    href: "/integrations",
    label: "Цалингийн тооцоо",
  },
  {
    href: "/integrations/history",
    label: "Шилжүүлэг",
  },
  {
    href: "/integrations/friends",
    label: "Танилын будалт",
  },
];

export function SalarySectionNav() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border-light bg-white p-3 shadow-light">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/integrations" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
