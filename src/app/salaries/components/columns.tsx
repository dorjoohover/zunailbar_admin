import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, parseDate } from "@/lib/functions";
import { IntegrationPayment } from "@/models";
import { TableActionButtons } from "@/components/tableActionButtons";
import { PaymentTypeValues } from "@/lib/constants";
import { PaymentType } from "@/lib/enum";

export function getColumns(
  onEdit: (payment: IntegrationPayment) => void,
  remove: (index: number) => Promise<boolean>,
): ColumnDef<IntegrationPayment>[] {
  return [
    {
      id: "select",
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
          Хоч <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "type",
      header: "Төрөл",
      cell: ({ row }) => {
        const type = PaymentTypeValues[row.getValue<number>("type") as PaymentType];
        return <span>{type || "-"}</span>;
      },
    },
    {
      accessorKey: "amount",
      header: "Төлсөн дүн",
      cell: ({ row }) => {
        const amount = row.getValue<number>("amount");
        return <span>{money(String(amount ?? 0), "₮")}</span>;
      },
    },
    {
      accessorKey: "paid_at",
      header: "Төлсөн огноо",
      cell: ({ row }) => {
        const date = parseDate(new Date(row.getValue("paid_at")), false);
        return date;
      },
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
