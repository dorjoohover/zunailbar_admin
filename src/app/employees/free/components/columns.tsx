import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppAlertDialog } from "@/components/AlertDialog";
import { parseDate } from "@/lib/functions";
import { Schedule } from "@/models";
import TooltipWrapper from "@/components/tooltipWrapper";
import { EmployeeStatusValue } from "@/lib/constants";
import { EmployeeStatus } from "@/lib/enum";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function getColumns(
  updateStatus: (index: number, status: EmployeeStatus) => void,
  remove: (index: number) => Promise<boolean>,
): ColumnDef<Schedule>[] {
  return [
    {
      id: "select",
      header: () => <span>№</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorFn: (row) => row.meta?.nickname ?? "",
      id: "nickname",
      header: "Артист",
      cell: ({ row }) => {
        const value = row.getValue("nickname") as string;
        return <span className="font-bold">{value || "-"}</span>;
      },
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
      accessorKey: "leave_status",
      header: "Төрөл",
      cell: ({ row }) => {
        const status = row.getValue("leave_status") as number;
        const value = EmployeeStatusValue[status as EmployeeStatus];
        return (
          <Select
            value={String(status)}
            onValueChange={(val) => updateStatus(row.index, +val as EmployeeStatus)}
          >
            <SelectTrigger className="w-[140px] text-xs!">
              <SelectValue>{value?.name ?? "-"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[EmployeeStatus.VACATION, EmployeeStatus.DEKIRIT].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {EmployeeStatusValue[s].name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "leave_description",
      header: "Тайлбар",
      cell: ({ row }) => {
        const value = row.getValue("leave_description") as string | null;
        return value || "-";
      },
    },
    {
      id: "creator",
      header: "Тавьсан",
      cell: ({ row }) => {
        const s: any = row.original;
        return s.creator_nickname || s.creator_lastname || s.creator_firstname
          ? `${s.creator_nickname ?? `${s.creator_lastname ?? ""} ${s.creator_firstname ?? ""}`}`
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
            description="Тухайн өдрийн амралт цуцлагдана."
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
