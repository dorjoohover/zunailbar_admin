import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppAlertDialog } from "@/components/AlertDialog";
import { parseDate } from "@/lib/functions";
import { Booking } from "@/models";
import TooltipWrapper from "@/components/tooltipWrapper";

export function getColumns(
  onEdit: (product: Booking) => void,
  remove: (index: number) => Promise<boolean>,
): ColumnDef<Booking>[] {
  return [
    {
      id: "select",
      header: () => <span>№</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "branch_name",
      header: "Салбар",
      cell: ({ row }) => (
        <span className="font-bold">
          {(row.getValue("branch_name") as string) || "-"}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Огноо",
      cell: ({ row }) => {
        const date = row.getValue("date") as string | undefined;
        return date ? parseDate(new Date(date), false) : "-";
      },
    },
    {
      accessorKey: "leave_description",
      header: "Тайлбар",
      cell: ({ row }) => (row.getValue("leave_description") as string) || "-",
    },
    {
      id: "creator",
      header: "Тавьсан",
      cell: ({ row }) => {
        const b: any = row.original;
        return b.creator_nickname || b.creator_lastname || b.creator_firstname
          ? `${b.creator_nickname ?? `${b.creator_lastname ?? ""} ${b.creator_firstname ?? ""}`}`
          : "-";
      },
    },
    {
      id: "actions",
      header: "Устгах",
      cell: ({ row }) => (
        <TooltipWrapper tooltip="Амралт цуцлах">
          <AppAlertDialog
            title="Амралт цуцлах уу?"
            description="Тухайн өдрийн салбарын амралт цуцлагдана."
            confirmText="Цуцлах"
            trigger={
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            }
            onConfirm={() => remove(row.index)}
          />
        </TooltipWrapper>
      ),
    },
  ];
}
