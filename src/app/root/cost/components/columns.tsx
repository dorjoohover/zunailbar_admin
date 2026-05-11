import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseDate } from "@/lib/functions";
import { ICostCategory } from "@/models";
import { TableActionButtons } from "@/components/tableActionButtons";

export function getColumns(
  onEdit: (item: ICostCategory) => void,
  remove: (index: number) => Promise<boolean>,
): ColumnDef<ICostCategory>[] {
  return [
    {
      id: "select",
      header: () => <span>№</span>,
      cell: ({ row }) => <span className="">{row.index + 1}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="table_header"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Зардлын ангилал <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="table_header"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Үүсгэсэн <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = parseDate(new Date(row.getValue("created_at")), false);
        return date;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId)).getTime();
        const dateB = new Date(rowB.getValue(columnId)).getTime();
        return dateA - dateB;
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
