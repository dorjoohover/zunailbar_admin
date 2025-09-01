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
import { IUser } from "@/models/user.model";
import { ArrowUpDown, Hammer, UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IBranch } from "@/models";
import { mobileFormatter, parseDate } from "@/lib/functions";
import { EmployeeStatus, ROLE, UserStatus } from "@/lib/enum";
import {
  EmployeeStatusValue,
  getEnumValues,
  roleIconMap,
  RoleValue,
  UserStatusValue,
} from "@/lib/constants";
import Image from "next/image";
import TooltipWrapper from "@/components/tooltipWrapper";
import { TableActionButtons } from "@/components/tableActionButtons";
import { cn } from "@/lib/utils";
import { getUserColor } from "@/lib/colors";

const branches: IBranch[] = [
  { id: "1", name: "Head Office", address: "UB Center", user_id: "100" },
  { id: "2", name: "Downtown Branch", address: "Chingeltei", user_id: "101" },
  { id: "3", name: "Airport Branch", address: "Buyant Ukhaa", user_id: "102" },
];

export const getColumns = (
  onEdit: (product: IUser) => void,
  setStatus: (index: number, status: EmployeeStatus) => void,
  giveProduct: (index: number) => void
): ColumnDef<IUser>[] => [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => (
      <Button
        // variant="table_head"
        variant="table_header"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Нэр <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-bold text-brand-blue">
        {row.getValue("firstname")}
      </div>
    ),
  },
  {
    accessorKey: "nickname",
    header: ({ column }) => (
      <Button
        // variant="table_head"
        variant="table_header"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ник нэр <ArrowUpDown className="w-4 h-4 ml-2" />
      </Button>
    ),
  },
  {
    accessorKey: "mobile",
    header: "Утас",
    cell: ({ row }) => {
      return <p>{mobileFormatter(row.getValue("mobile"))}</p>;
    },
  },
  {
    accessorKey: "color",
    header: "Өнгө",
    cell: ({ row }) => {
      return (
        <div
          className={`h-5 w-8 rounded-full`}
          style={{
            backgroundColor: `${getUserColor(
              +((row.getValue("color") as string) ?? -1)
            )}`,
          }}
        ></div>
      );
    },
  },
  {
    accessorKey: "branch_name",
    header: "Салбар",
    cell: ({ row }) => {
      const branch = row.getValue("branch_name");
      return branch || "Unknown";
    },
  },
  {
    accessorKey: "birthday",
    header: "Т/өдөр",
    cell: ({ row }) => {
      const date = parseDate(new Date(row.getValue("birthday")), false);
      return date;
    },
  },
  {
    accessorKey: "profile_img",
    header: "Профайл",
    cell: ({ row }) => {
      const role = (row.getValue<number>("role") ?? ROLE.ANY) as ROLE;
      const profile = row.getValue<string | null>("profile_img");
      return (
        <>
          {profile ? (
            <span
              className={`flex gap-2 items-center overflow-hidden font-bold aspect-square size-12 rounded bg-gray-100`}
            >
              <Image
                src={`/api/file/${profile}`}
                width={100}
                height={100}
                // objectFit="contain"
                className="object-cover size-full"
                alt={role.toString()}
              />
            </span>
          ) : (
            `-`
          )}
        </>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Үүрэг",
    cell: ({ row }) => {
      const role = (row.getValue<number>("role") ?? ROLE.ANY) as ROLE;

      const name = RoleValue[role];
      const { color } = roleIconMap[role] ?? {};
      return (
        <span className={`flex gap-2 items-center text-${color}-500 font-bold`}>
          {name}
        </span>
      );
    },
  },
  {
    accessorKey: "user_status",
    header: "Статус",
    cell: ({ row }) => {
      const status =
        EmployeeStatusValue[row.getValue<number>("user_status") as UserStatus];
      return <span className={cn(`${status.color} badge`)}>{status.name}</span>;
    },
  },
  {
    id: "actions",
    header: "Үйлдэл",
    cell: ({ row }) => {
      return (
        <TableActionButtons
          rowData={row.original}
          onEdit={(data) => onEdit(data)}
        >
          <DropdownMenu>
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
              {getEnumValues(EmployeeStatus)
                .splice(0, 4)
                .map((item, i) => {
                  const status = EmployeeStatusValue[item];
                  return (
                    <DropdownMenuItem
                      key={i}
                      onClick={() => setStatus(row.index, item)}
                    >
                      <span className={cn(status.color, "w-full text-center")}>
                        {status.name}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipWrapper tooltip="Бүтээгдэхүүн өгөх">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => giveProduct(row.index)}
            >
              <Hammer className="size-4" />
            </Button>
          </TooltipWrapper>
        </TableActionButtons>
      );
    },
  },
];

// <div className="flex items-center gap-2">
//   <TooltipWrapper tooltip="Засварлах">
//     <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
//       <Pencil className="size-4" />
//     </Button>
//   </TooltipWrapper>

//   <DropdownMenu>
//     <TooltipWrapper tooltip="Статус солих">
//       <DropdownMenuTrigger>
//         <div className="items-center justify-center size-9 flex-center">
//           <UserRoundCog className="size-4" />
//         </div>
//       </DropdownMenuTrigger>
//     </TooltipWrapper>

//     <DropdownMenuContent>
//       <DropdownMenuLabel>Статус солих</DropdownMenuLabel>
//       <DropdownMenuSeparator />
//       {getEnumValues(UserStatus)
//         .splice(0, 4)
//         .map((item, i) => {
//           const status = UserStatusValue[item];
//           return (
//             <DropdownMenuItem className={status.color} key={i} onClick={() => setStatus(row.index, item)}>
//               {status.name}
//             </DropdownMenuItem>
//           );
//         })}
//     </DropdownMenuContent>
//   </DropdownMenu>

//   <TooltipWrapper tooltip="Бүтээгдэхүүн өгөх">
//     <Button variant="ghost" size="icon" onClick={() => giveProduct(row.index)}>
//       <Hammer className="size-4" />
//     </Button>
//   </TooltipWrapper>
// </div>
