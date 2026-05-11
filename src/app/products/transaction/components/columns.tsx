import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, parseDate } from "@/lib/functions";
import { IProductTransaction } from "@/models";
import { TableActionButtons } from "@/components/tableActionButtons";

export function getColumns(
  onEdit: (product: IProductTransaction) => void,
  remove: (index: number) => Promise<boolean>,
): ColumnDef<IProductTransaction>[] {
  return [
    {
      id: "select",
      header: ({ table }) => <span>№</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => "Огноо",
      cell: ({ row }) => {
        const v = row.getValue("date") as string | Date | null;
        if (!v) return parseDate(row.original?.created_at as any, false);
        return parseDate(new Date(v), false);
      },
    },
    {
      accessorKey: "branch_name",
      header: ({ column }) => "Салбар",
    },
    {
      accessorKey: "product_name",
      header: "Бүтээгдэхүүн",
    },
    {
      accessorKey: "category_name",
      header: "Ангилал",
      cell: ({ row }) => row.original?.category_name ?? "",
    },
    {
      accessorKey: "quantity",
      header: () => "Тоо ширхэг",
    },
    {
      accessorKey: "price",
      header: () => "Нэгж үнэ",
      cell: ({ row }) => {
        const r = row.original as any;
        const value = r?.price ?? r?.unit_price ?? 0;
        return `${money(String(value))}₮`;
      },
    },
    {
      accessorKey: "total_amount",
      header: () => "Нийт дүн",
      cell: ({ row }) => `${money(String(row.original?.total_amount ?? 0))}₮`,
    },
    {
      accessorKey: "user_name",
      header: "Ажилтан",
      cell: ({ row }) => row.original?.user_name?.trim() || "-",
    },
    {
      id: "actions",
      header: "Үйлдэл",
      cell: ({ row }) => (
        <TableActionButtons
          rowData={row.original}
          onEdit={(data) => onEdit(data)}
          onRemove={() => remove(row.index)}
        />
      ),
    },
  ];
}
