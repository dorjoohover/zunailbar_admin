import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Integration } from "@/models";
import { money, parseDate } from "@/lib/functions";

const salaryStatusValues: Record<
  number,
  { label: string; className: string }
> = {
  10: { label: "Өгөөгүй", className: "yellow-badge badge" },
  20: { label: "Баталсан", className: "green-badge badge" },
  30: { label: "Дууссан", className: "slate-badge badge" },
};

export function getColumns(
  getHistoryHref: (integration: Integration) => string,
): ColumnDef<Integration>[] {
  return [
    {
      id: "index",
      header: () => <span>№</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "user_name",
      header: ({ column }) => (
        <Button
          variant="table_header"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Артист <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>{row.getValue<string>("user_name") || "-"}</span>,
    },
    {
      accessorKey: "date",
      header: "Огноо",
      cell: ({ row }) => {
        const value = row.getValue("date");
        if (!value) return "-";
        return parseDate(new Date(value as string), false);
      },
    },
    {
      accessorKey: "order_count",
      header: "Үйлчилгээний тоо",
      cell: ({ row }) => (
        <span>{Number(row.getValue<number>("order_count") ?? 0)}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Бодогдсон цалин",
      cell: ({ row }) => (
        <span>{money(String(row.getValue<number>("amount") ?? 0), "₮")}</span>
      ),
    },
    {
      accessorKey: "salary_status",
      header: "Төлөв",
      cell: ({ row }) => {
        const status = salaryStatusValues[row.getValue<number>("salary_status")];
        if (!status) return <span>-</span>;
        return <span className={status.className}>{status.label}</span>;
      },
    },
    {
      id: "actions",
      header: "Үйлдэл",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={getHistoryHref(row.original)}>Түүх</Link>
        </Button>
      ),
    },
  ];
}
