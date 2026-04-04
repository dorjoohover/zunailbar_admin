import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, parseDate } from "@/lib/functions";
import { IntegrationPayment } from "@/models";
import { TableActionButtons } from "@/components/tableActionButtons";
import { PaymentTypeValues } from "@/lib/constants";
import { PaymentType } from "@/lib/enum";

export function getColumns(
  onEdit: (product: IntegrationPayment) => void,
  remove: (index: number) => Promise<boolean>,
): ColumnDef<IntegrationPayment>[] {
  return [
    {
      id: "select",
      header: ({ table }) => <span>№</span>,
      cell: ({ row }) => <span className="">{row.index + 1}</span>,
    },
    {
      accessorKey: "user_name",
      header: ({ column }) => (
        <Button
          variant="table_header"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Хоч <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },

    {
      accessorKey: "type",
      header: "Төрөл",
      cell: ({ row }) => {
        const status =
          PaymentTypeValues[row.getValue<number>("type") as PaymentType];
        return <span>{status}</span>;
      },
    },

    {
      accessorKey: "amount",
      header: "Төлсөн дүн",
      cell: ({ row }) => {
        const amount = row.getValue<number>("amount");
        return money(String(amount ?? 0), "₮");
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
