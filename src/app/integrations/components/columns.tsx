import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { money, parseDate } from "@/lib/functions";
import { SalaryCalculationRow } from "@/models";

export function getColumns(
  onOpenDetail: (row: SalaryCalculationRow) => void,
): ColumnDef<SalaryCalculationRow>[] {
  return [
    {
      id: "index",
      header: () => <span>№</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "user_name",
      header: "Артист",
      cell: ({ row }) => (
        <span>{row.getValue<string>("user_name") || "-"}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Олгох огноо",
      cell: ({ row }) => {
        const data = row.getValue<string>("date");
        return <span>{data ? data : "-"}</span>;
      },
    },
  
    {
      accessorKey: "income_amount",
      header: "Нийт орлого",
      cell: ({ row }) => (
        <span>
          {money(String(row.getValue<number>("income_amount") ?? 0), "₮")}
        </span>
      ),
    },
    {
      accessorKey: "salary_amount",
      header: "Цалин",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900">
          {money(String(row.getValue<number>("salary_amount") ?? 0), "₮")}
        </span>
      ),
    },
      {
      accessorKey: "created_at",
      header: "Үүсгэсэн",
      cell: ({ row }) => {
        const data = row.getValue<string>("created_at");
        return <span>{data ? parseDate(data) : "-"}</span>;
      },
    },
    {
      id: "actions",
      header: "Дэлгэрэнгүй",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenDetail(row.original)}
        >
          Дэлгэрэнгүй
        </Button>
      ),
    },
  ];
}
