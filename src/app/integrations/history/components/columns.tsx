import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/functions";
import { IntegrationTransferSummaryRow } from "@/models";

export function getColumns(
  onOpenDetail: (row: IntegrationTransferSummaryRow) => void,
): ColumnDef<IntegrationTransferSummaryRow>[] {
  return [
    {
      id: "index",
      header: () => <span>№</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "user_name",
      header: "Артист",
      cell: ({ row }) => <span>{row.getValue<string>("user_name") || "-"}</span>,
    },
    {
      accessorKey: "from",
      header: "Эхлэх огноо",
      cell: ({ row }) => <span>{row.getValue<string>("from") || "-"}</span>,
    },
    {
      accessorKey: "to",
      header: "Дуусах огноо",
      cell: ({ row }) => <span>{row.getValue<string>("to") || "-"}</span>,
    },
    {
      accessorKey: "payment_count",
      header: "Шилжүүлгийн тоо",
      cell: ({ row }) => <span>{row.getValue<number>("payment_count") ?? 0}</span>,
    },
    {
      accessorKey: "transferred_amount",
      header: "Шилжүүлсэн дүн",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">
          {money(String(row.getValue<number>("transferred_amount") ?? 0), "₮")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Дэлгэрэнгүй",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => onOpenDetail(row.original)}>
          Дэлгэрэнгүй
        </Button>
      ),
    },
  ];
}
