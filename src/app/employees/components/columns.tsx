"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IUser } from "@/models/user.model";
import {
  ArrowUpDown,
  Crown,
  Pencil,
  Shield,
  ShieldUser,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Span } from "next/dist/trace";
import { IBranch } from "@/models";
import { mobileFormatter, parseDate } from "@/lib/functions";
import { ROLE, UserStatus } from "@/lib/enum";
import { roleIconMap, RoleValue, UserStatusValue } from "@/lib/constants";
import { ReusableAlertDialog } from "@/components/AlertDialog";
import { toast } from "sonner";

const branches: IBranch[] = [
  { id: "1", name: "Head Office", address: "UB Center", user_id: "100" },
  { id: "2", name: "Downtown Branch", address: "Chingeltei", user_id: "101" },
  { id: "3", name: "Airport Branch", address: "Buyant Ukhaa", user_id: "102" },
];

export const getColumns = (
  onEdit: (product: IUser) => void,
  setStatus: (status: UserStatus) => void
): ColumnDef<IUser>[] => [
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
    accessorKey: "firstname",
    header: ({ column }) => (
      <Button
        // variant="table_head"
        variant="default"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => (
      <Button
        // variant="table_head"
        variant="default"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "mobile",
    header: "mobile",
    cell: ({ row }) => <p>{mobileFormatter(row.getValue("mobile"))}</p>,
  },
  {
    accessorKey: "branch_name",
    header: "Branch",
    cell: ({ row }) => {
      const branch = row.getValue("branch_name");
      return branch || "Unknown";
    },
  },
  {
    accessorKey: "birthday",
    header: "Birthday",
    cell: ({ row }) => {
      const date = parseDate(new Date(row.getValue("birthday")), false);
      return date;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = (row.getValue<number>("role") ?? ROLE.ANY) as ROLE;
      const name = RoleValue[role];
      const { icon: Icon, color } = roleIconMap[role] ?? {};

      return (
        <span className={`flex gap-2 items-center text-${color}-500 font-bold`}>
          <Icon className="size-5" /> {name}
        </span>
      );
    },
  },
  {
    accessorKey: "user_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<number>("user_status") as UserStatus;
      return UserStatusValue[status].name;
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

        <ReusableAlertDialog
          title="status solih"
          description="dropdown ."
          onConfirm={() => {
            toast("Амжилттай устгалаа!", {});
          }}
          trigger={
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          }
        />

        <ReusableAlertDialog
          title="Итгэлтэй байна уу?"
          description="Бүр устгана шүү."
          onConfirm={() => {
            toast("Амжилттай устгалаа!", {});
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
