import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/models/product.model";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AppAlertDialog } from "@/components/AlertDialog";
import { toast } from "sonner";
import { money, parseDate } from "@/lib/functions";
import { ISchedule } from "@/models";
import { ScheduleStatus } from "@/lib/enum";
import { ScheduleStatusValue } from "@/lib/constants";

export function getColumns(
  onEdit: (product: ISchedule) => void,
  remove: (index: number) => Promise<boolean>
): ColumnDef<ISchedule>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "branch_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          branch <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "user_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Name <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },

    {
      accessorKey: "date",
      header: "date",
      cell: ({ row }) => {
        const date = parseDate(new Date(row.getValue("date")), false);
        return date;
      },
    },
    {
      accessorKey: "start_time",
      header: "start_time",
      cell: ({ row }) => {
        const date = parseDate(new Date(row.getValue("start_time")), false);
        return date;
      },
    },
    {
      accessorKey: "end_time",
      header: "end_time",
      cell: ({ row }) => {
        const date = parseDate(new Date(row.getValue("end_time")), false);
        return date;
      },
    },
    {
      accessorKey: "times",
      header: "times",
      cell: ({ row }) => {
        const times = row.getValue("times") as string;
        return times;
      },
    },
    {
      accessorKey: "schedule_status",
      header: "Status",
      cell: ({ row }) => {
        const status =
          ScheduleStatusValue[
            row.getValue<number>("schedule_status") as ScheduleStatus
          ];
        return <span className={status.color}>{status.name}</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
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
      accessorKey: "updated_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Created <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = parseDate(new Date(row.getValue("updated_at")), false);
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>

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
        </div>
      ),
    },
  ];
}
