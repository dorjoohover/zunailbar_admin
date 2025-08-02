"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IUser } from "@/models/user.model";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<IUser>[] = [
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
        variant="ghost"
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
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "birthday",
    header: "Birthday",
    cell: ({ row }) => {
      const date = new Date(row.getValue("birthday"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue<number>("role");
      return role === 1 ? "Admin" : "User";
    },
  },
  {
    accessorKey: "user_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<number>("user_status");
      return status === 1 ? "🟢 Active" : "🔴 Inactive";
    },
  },
];
