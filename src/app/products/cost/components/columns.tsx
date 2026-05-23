import { ColumnDef } from "@tanstack/react-table";
import { money, parseDate } from "@/lib/functions";
import { TableActionButtons } from "@/components/tableActionButtons";
import { ICost } from "@/models";

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
      accessorKey: "name",
      header: () => "Нэр",
      cell: ({ row }) => {
        const name = row.getValue("name") as string | undefined;
        return name && name.trim().length > 0 ? name : "-";
      },
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
      header: "Зардлын дүн",
      cell: ({ row }) => money(row.getValue("price"), "₮") ?? "-",
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
