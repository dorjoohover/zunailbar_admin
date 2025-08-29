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
import { ROLE, UserStatus } from "@/lib/enum";
import {
  getEnumValues,
  roleIconMap,
  RoleValue,
  UserStatusValue,
} from "@/lib/constants";
import Image from "next/image";
import TooltipWrapper from "@/components/tooltipWrapper";
import { TableActionButtons } from "@/components/tableActionButtons";
import { COLORS } from "@/lib/colors";

const branches: IBranch[] = [
  { id: "1", name: "Head Office", address: "UB Center", user_id: "100" },
  { id: "2", name: "Downtown Branch", address: "Chingeltei", user_id: "101" },
  { id: "3", name: "Airport Branch", address: "Buyant Ukhaa", user_id: "102" },
];

export const getColumns = (
  onEdit: (product: IUser) => void,
  setStatus: (index: number, status: UserStatus) => void,
  giveProduct: (index: number) => void
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
        variant="table_header"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
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
        Nickname <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "mobile",
    header: "mobile",
    cell: ({ row }) => {
      return <p>{mobileFormatter(row.getValue("mobile"))}</p>;
    },
  },
  {
    accessorKey: "color",
    header: "color",
    cell: ({ row }) => {
      console.log(
        "name",
        row.getValue("firstname") as string,
        "color:",
        row.getValue("color") as string
      );
      return (
        <div
          className={`size-8 rounded`}
          style={{
            backgroundColor: `${
              COLORS[+((row.getValue("color") as string) ?? -1)]
            }`,
          }}
        ></div>
      );
    },
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
    accessorKey: "profile_img",
    header: "Img",
    cell: ({ row }) => {
      const role = (row.getValue<number>("role") ?? ROLE.ANY) as ROLE;
      const profile = row.getValue<string | null>("profile_img");
      return (
        <>
          {profile ? (
            <span
              className={`flex gap-2 items-center overflow-hidden font-bold aspect-square size-12 rounded bg-gray-100 border`}
            >
              <Image
                src={`/api/file/${profile}`}
                width={100}
                height={100}
                // objectFit="contain"
                className="rounded-full  object-cover"
                alt={role.toString()}
              />
            </span>
          ) : (
            `Байхгүй`
          )}
        </>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
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
    header: "Status",
    cell: ({ row }) => {
      const status =
        UserStatusValue[row.getValue<number>("user_status") as UserStatus];
      return <span className={status.color}>{status.name}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <TableActionButtons
          rowData={row.original}
          onEdit={(data) => onEdit(data)}
        >
          <DropdownMenu>
            <TooltipWrapper tooltip="Статус солих">
              <DropdownMenuTrigger>
                <div className="size-9 flex-center items-center justify-center">
                  <UserRoundCog className="size-4" />
                </div>
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
                    <DropdownMenuItem
                      className={status.color}
                      key={i}
                      onClick={() => setStatus(row.index, item)}
                    >
                      {status.name}
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
//         <div className="size-9 flex-center items-center justify-center">
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
