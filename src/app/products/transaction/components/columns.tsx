import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/models/product.model";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AppAlertDialog } from "@/components/AlertDialog";
import { toast } from "sonner";
import { parseDate } from "@/lib/functions";
import { IProductTransaction } from "@/models";
import { ProductTransactionStatus } from "@/lib/enum";
import { TableActionButtons } from "@/components/tableActionButtons";

export function getColumns(onEdit: (product: IProductTransaction) => void, remove: (index: number) => Promise<boolean>): ColumnDef<IProductTransaction>[] {
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
      accessorKey: "user_name",
      header: "Username",
    },
    {
      accessorKey: "product_name",
      header: "product",
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
          Quantity <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "product_transaction_status",
      header: "Status",
      cell: ({ row }) => {
        const status = ProductTransactionStatus[row.getValue<number>("product_transaction_status") as ProductTransactionStatus];
        return <span>{status}</span>;
      },
    },
    // {
    //   accessorKey: "price",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //       className="font-bold"
    //     >
    //       Price <ArrowUpDown className="w-4 h-4 ml-2" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => `${row.getValue("price")}₮`,
    // },
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
        // Bagasgasan
        <TableActionButtons rowData={row.original} onEdit={(data) => onEdit(data)} onRemove={(data) => remove(row.index)}></TableActionButtons>
      ),
    },
  ];
}
// <div className="flex items-center gap-2">
//   <Button
//     variant="ghost"
//     size="icon"
//     onClick={() => onEdit(row.original)}
//   >
//     <Pencil className="w-4 h-4" />
//   </Button>

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
//         <Trash2 className="w-4 h-4 text-red-500" />
//       </Button>
//     }
//   />
// </div>
