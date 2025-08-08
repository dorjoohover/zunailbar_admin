"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Hammer, Pencil, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IUserProduct } from "@/models";
import { mobileFormatter, parseDate } from "@/lib/functions";
import { ROLE, UserProductStatus, UserStatus } from "@/lib/enum";
import {
  getEnumValues,
  getValuesUserProductStatus,
  roleIconMap,
  RoleValue,
  UserStatusValue,
} from "@/lib/constants";
import Image from "next/image";

export const getColumns = (): //   onEdit: (product: IUser) => void,
//   setStatus: (index: number, status: UserStatus) => void,
//   giveProduct: (index: number) => void
ColumnDef<IUserProduct>[] => [
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
    accessorKey: "user_name",
    header: ({ column }) => (
      <Button
        // variant="table_head"
        variant="table_header"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        user name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "product_name",
    header: ({ column }) => (
      <Button
        // variant="table_head"
        variant="table_header"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        product name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "quantity",
    header: "quantity",
    // cell: ({ row }) => {
    //   return <p>{}</p>;
    // },
  },

  {
    accessorKey: "user_product_status",
    header: "Status",
    cell: ({ row }) => {
      const status =
        getValuesUserProductStatus[
          row.getValue<number>("user_product_status") as UserProductStatus
        ];
      return <span>{status}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            // onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserRoundCog className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Статус солих</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {getEnumValues(UserProductStatus)
                .splice(0, 4)
                .map((item, i) => {
                  const status = UserProductStatus[item];
                  return (
                    <DropdownMenuItem
                      //   className={status.color}
                      key={i}
                      //   onClick={() => setStatus(row.index, item)}
                    >
                      {status}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            // onClick={() => giveProduct(row.index)}
          >
            <Hammer className="size-4" />
          </Button>
        </div>
      );
    },
  },
];
