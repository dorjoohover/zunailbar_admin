import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/models/product.model";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AppAlertDialog } from "@/components/AlertDialog";
import { toast } from "sonner";
import { formatTime, money, parseDate } from "@/lib/functions";
import { IProductTransaction, IUser } from "@/models";
import { ProductTransactionStatus } from "@/lib/enum";
import TooltipWrapper from "@/components/tooltipWrapper";

export function getColumns(onEdit: (product: IUser) => void, remove: (index: number) => Promise<boolean>): ColumnDef<IUser>[] {
  return [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "branch_name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
          Branch <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = parseDate(new Date(row.getValue("date")), false);
        return date;
      },
    },
    {
      accessorKey: "start_time",
      header: "Start_time",
      cell: ({ row }) => {
        const time = row.getValue("start_time") as string;
        return formatTime(time);
      },
    },
    {
      accessorKey: "end_time",
      header: "end_time",
      cell: ({ row }) => {
        const time = row.getValue("end_time") as string;
        return formatTime(time);
      },
    },
    {
      accessorKey: "times",
      header: "times",
      cell: ({ row }) => {
        const time = row.getValue("times") as string;
        return formatTime(time);
      },
    },

    {
      accessorKey: "min_price",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
          Price <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => money(row.getValue("min_price"), "₮"),
    },
    {
      accessorKey: "max_price",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
          Max Price <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => money(row.getValue("max_price"), "₮"),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
          Created <ArrowUpDown className="w-4 h-4 ml-2" />
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
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TooltipWrapper tooltip="Засварлах">
            <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
              <Pencil className="w-4 h-4" />
            </Button>
          </TooltipWrapper>

          <TooltipWrapper tooltip="Засварлах">
            <AppAlertDialog
              title="Итгэлтэй байна уу?"
              description="Бүр устгана шүү."
              onConfirm={async () => {
                const res = await remove(row.index);
                console.log(res);
                toast("Амжилттай устгалаа!" + res, {});
              }}
              trigger={
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              }
            />
          </TooltipWrapper>
        </div>
      ),
    },
  ];
}
