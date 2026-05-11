import { ColumnDef } from "@tanstack/react-table";
import { money, parseDate } from "@/lib/functions";
import { TableActionButtons } from "@/components/tableActionButtons";
import { ICost } from "@/models";
import { CostStatus } from "@/lib/enum";
import { getValuesCostStatus } from "@/lib/constants";

export function getColumns(
  onEdit: (item: ICost) => void,
  remove: (index: number) => Promise<boolean>,
): ColumnDef<ICost>[] {
  return [
    {
      id: "select",
      header: () => <span>№</span>,
      cell: ({ row }) => <span className="">{row.index + 1}</span>,
    },
    {
      accessorKey: "cost_category_name",
      header: () => "Зардлын ангилал",
      cell: ({ row }) => {
        const name = row.getValue("cost_category_name") as string | undefined;
        return name && name.trim().length > 0 ? name : "-";
      },
    },
    {
      accessorKey: "branch_name",
      header: "Салбар",
    },

    {
      accessorKey: "price",
      header: "Үнэ",
      cell: ({ row }) => money(row.getValue("price"), "₮") ?? "-",
    },
    {
      accessorKey: "paid_amount",
      header: "Төлсөн",
      cell: ({ row }) => money(row.getValue("paid_amount") ?? 0, "₮") ?? "-",
    },
    {
      accessorKey: "cost_status",
      header: "Статус",
      cell: ({ row }) => {
        const status =
          getValuesCostStatus[
            row.getValue<number>("cost_status") as CostStatus
          ];
        return <span className={status.color}>{status.name}</span>;
      },
    },
    {
      accessorKey: "date",
      header: () => "Огноо",
      cell: ({ row }) => {
        const value = row.getValue("date") as Date | string | undefined;
        if (!value) return "-";
        return parseDate(value, false);
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = new Date(rowA.getValue(columnId) as any).getTime();
        const b = new Date(rowB.getValue(columnId) as any).getTime();
        return a - b;
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
