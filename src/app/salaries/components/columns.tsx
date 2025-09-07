import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/models/product.model";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { parseDate } from "@/lib/functions";
import { ISalaryLog } from "@/models";
import { TableActionButtons } from "@/components/tableActionButtons";
import { CategoryTypeValues, SalaryLogValues } from "@/lib/constants";
import { CategoryType, SalaryLogStatus } from "@/lib/enum";

export function getColumns(
  onEdit: (product: ISalaryLog) => void,
  remove: (index: number) => Promise<boolean>
): ColumnDef<ISalaryLog>[] {
  return [
    {
      id: "select",
      header: ({ table }) => <span>№</span>,
      cell: ({ row }) => <span className="">{row.index + 1}</span>,
    },

    {
      accessorKey: "salary_log_status",
      header: "Статус",
      cell: ({ row }) => {
        const status =
          SalaryLogValues[
            row.getValue<number>("salary_log_status") as SalaryLogStatus
          ];
        return <span>{status}</span>;
      },
    },
    {
      accessorKey: "order_count",
      header: "Захиалгын тоо",
      cell: ({ row }) => {
        const res = row.getValue<string>("order_count");
        return <span>{res}</span>;
      },
    },
    {
      accessorKey: "date",
      header: "Огноо",
      cell: ({ row }) => {
        const date = parseDate(new Date(row.getValue("date")), false);
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
          onRemove={(data) => remove(row.index)}
        ></TableActionButtons>
      ),
    },
  ];
}

// <div className="flex items-center gap-2">
//   <TooltipWrapper tooltip="Засварлах">
//     <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
//       <Pencil className="w-4 h-4" />
//     </Button>
//   </TooltipWrapper>

//   <AppAlertDialog
//     title="Итгэлтэй байна уу?"
//     description="Бүр устгана шүү."
//     onConfirm={async () => {
//       const res = await remove(row.index);
//       console.log(res);
//       toast("Амжилттай устгалаа!" + res, {});
//     }}
//     trigger={
//       <Button variant="ghost" size="icon">
//         <TooltipWrapper tooltip="Статус солих">
//           <Trash2 className="w-4 h-4 text-red-500" />
//         </TooltipWrapper>
//       </Button>
//     }
//   />
// </div>
