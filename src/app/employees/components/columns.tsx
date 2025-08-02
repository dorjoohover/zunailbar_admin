"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IUser } from "@/models/user.model";
import { ArrowUpDown, Crown, Shield, ShieldUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Span } from "next/dist/trace";
import { IBranch } from "@/models";

const branches: IBranch[] = [
  { id: "1", name: "Head Office", address: "UB Center", user_id: "100" },
  { id: "2", name: "Downtown Branch", address: "Chingeltei", user_id: "101" },
  { id: "3", name: "Airport Branch", address: "Buyant Ukhaa", user_id: "102" },
];


export const columns: ColumnDef<IUser>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => (
      <Button variant="table_head" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        First Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => (
      <Button variant="table_head" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Last Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "brandi_id",
    header: "Branch",
    cell: ({ row }) => {
      const brandiId = row.getValue<string>("brandi_id");
      const branch = branches.find((b) => b.id === brandiId);
      return branch?.name || "Unknown";
    },
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
      switch (role) {
        case 1:
          return (
            <span className="flex gap-2 items-center text-yellow-500 font-bold">
              <Crown className="size-5" /> System
            </span>
          );
        case 2:
          return (
            <span className="flex gap-2 items-center text-orange-500 font-bold">
              <ShieldUser className="size-5" /> Admin
            </span>
          );
        case 3:
          return (
            <span className="flex gap-2 items-center text-yellow-500 font-bold">
              <Crown className="size-5" /> Manager
            </span>
          );
        case 4:
          return (
            <span className="flex gap-2 items-center text-yellow-500 font-bold">
              <Crown className="size-5" /> Employee
            </span>
          );
        default:
          return "Client";
      }
    },
  },
  {
    accessorKey: "user_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<number>("user_status");
      return status === 1 ? "Active" : "Vacation";
    },
  },
];
