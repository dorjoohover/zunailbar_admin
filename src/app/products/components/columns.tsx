import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/models/product.model";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { checkEmpty } from "@/lib/functions";
import { TableActionButtons } from "@/components/tableActionButtons";

export function getColumns(
  onEdit: (product: IProduct) => void,
  remove: (index: number) => Promise<boolean>
): ColumnDef<IProduct>[] {
  return [
    // {
    //   id: "select",
    //   header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    //   cell: ({ row }) => {
    //     return <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />;
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="table_header"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Name <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },
    {
      accessorKey: "brand_name",
      header: "Brand",
      cell: ({ row }) => checkEmpty(row.getValue("brand_name")),
    },
    {
      accessorKey: "category_name",
      header: "Category",
      cell: ({ row }) => checkEmpty(row.getValue("category_name")),
    },

    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="table_header"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Quantity <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        // Bagasgasan
        <TableActionButtons
          rowData={row.original}
          onEdit={(data) => onEdit(data)}
          onRemove={(data) => remove(row.index)}
        ></TableActionButtons>
      ),
    },
  ];
}

// {
//   <div className="flex items-center gap-2">
//     <TooltipWrapper tooltip="Засварлах">
//       <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
//         <Pencil className="w-4 h-4" />
//       </Button>
//     </TooltipWrapper>

//     <AppAlertDialog
//       title="Итгэлтэй байна уу?"
//       description="Бүр устгана шүү."
//       onConfirm={async () => {
//         const res = await remove(row.index);
//         console.log(res);
//         toast("Амжилттай устгалаа!" + res, {});
//       }}
//       trigger={
//         <TooltipWrapper tooltip="Устгах">
//           <Button variant="ghost" size="icon">
//             <Trash2 className="w-4 h-4 text-red-500" />
//           </Button>
//         </TooltipWrapper>
//       }
//     />
//   </div>;
// }
