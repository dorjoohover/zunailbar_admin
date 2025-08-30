import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { parseDate } from "@/lib/functions";
import { IUser } from "@/models";
import { TableActionButtons } from "@/components/tableActionButtons";

export function getColumns(
  onEdit: (product: IUser) => void,
  remove: (index: number) => Promise<boolean>
): ColumnDef<IUser>[] {
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
    // {
    //   accessorKey: "branch_name",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //       className="font-bold"
    //     >
    //       Branch <ArrowUpDown className="w-4 h-4 ml-2" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => {
    //     const date = row.getValue("branch_name");
    //     return date;
    //   },
    // },
    {
      accessorKey: "nickname",
      header: ({ column }) => (
        <Button
          variant="table_header"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Name <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("nickname") ?? "-";
        return date;
      },
    },
    {
      accessorKey: "mobile",
      header: ({ column }) => (
        <Button
          variant="table_header"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold"
        >
          Name <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("mobile") ?? "-";
        return date;
      },
    },

    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="table_header"
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        // Bagasgasan
        <TableActionButtons
          rowData={row.original}
          onEdit={(data) => onEdit(data)}
          onRemove={(data) => remove(row.index)}
        >
          {/* <DropdownMenu>
              <TooltipWrapper tooltip="Статус солих">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserRoundCog className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipWrapper>

              <DropdownMenuContent>
                <DropdownMenuLabel>Статус солих</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {getEnumValues(UserStatus)
                  .splice(0, 4)
                  .map((item, i) => {
                    const status = UserStatusValue[item];
                    return (
                      <DropdownMenuItem key={i} onClick={() => setStatus(row.index, item)}>
                        <span className={cn(status.color)}>{status.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu> */}
        </TableActionButtons>
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
      ),
    },
  ];
}
