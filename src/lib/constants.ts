import { Crown, Shield, User2 } from "lucide-react";
import { ROLE, UserProductStatus, UserStatus } from "./enum";

export const roleIconMap = {
  [ROLE.SYSTEM]: { icon: Crown, color: "yellow" },
  [ROLE.ADMIN]: { icon: Shield, color: "orange" },
  [ROLE.EMPLOYEE]: { icon: User2, color: "gray" },
  [ROLE.CLIENT]: { icon: User2, color: "gray" },
  [ROLE.MANAGER]: { icon: User2, color: "gray" },
  [ROLE.ANY]: { icon: User2, color: "gray" },
};
export const RoleValue = {
  [ROLE.SYSTEM]: "SYSTEM",
  [ROLE.ADMIN]: "ADMIN",
  [ROLE.MANAGER]: "MANAGER",
  [ROLE.EMPLOYEE]: "EMPLOYEE",
  [ROLE.CLIENT]: "CLIENT",
  [ROLE.ANY]: "ANY",
};

// export const EmployeeStatusValue = {
//   [EmployeeStatus.ACTIVE]: { name: "Идэвхтэй", color: "green" },
//   [EmployeeStatus.DEKIRIT]: { name: "Декирит", color: "orange" },
//   [EmployeeStatus.VACATION]: { name: "Амралт", color: "yellow" },
//   [EmployeeStatus.FIRED]: { name: "Халагдсан", color: "red" },
// };

export const UserStatusValue = {
  [UserStatus.ACTIVE]: { name: "Active", color: "text-green-600" },
  [UserStatus.FIRED]: { name: "Халагдсан", color: "text-gray-600" },
  [UserStatus.DEKIRIT]: { name: "Декирит", color: "text-red-500" },
  [UserStatus.VACATION]: { name: "Амарсан", color: "text-yellow-500" },
  [UserStatus.BANNED]: { name: "Banned", color: "text-red-500" },
};

export interface ListType<T> {
  count: number;
  items: T[];
}
export interface SearchType<T> {
  id: string;
  value: string;
  item?: T;
}

export enum ACTION {
  DEFAULT = 10,
  PENDING = 20,
  RUNNING = 30,
}

export const DEFAULT_LIMIT = 2;
export const DEFAULT_PAGE = 0;
export const DEFAULT_SORT = true;

export type PG = {
  page?: number;
  limit?: number;
  sort?: boolean;
};

export const DEFAULT_PG: Required<PG> = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
  sort: DEFAULT_SORT,
};

// export const PG = (dto: PgDto = {}): Required<PgDto> => ({
//   ...DEFAULT_PG,
//   ...dto,
// });

// patch put delete type
export type PPDT = { success: boolean; error?: string };

export const MODAL_ACTION = {
  add_emp: "add_emp",
  edit_emp: "edit_emp",
  give_product: "give_product",
  add_service_to_emp: "add_service_to_emp",
  add_product: "add_product",
  add_service: "add_service",
  add_discount: "add_discount",
  add_voucher_to_user: "add_voucher_to_user",
  add_schedule_to_emp: "add_schedule_to_emp",
  set_status_salary: "set_status_salary",
  add_salary: "add_salary",
};

export function getEnumValues<T extends Record<string, string | number>>(
  e: T
): T[keyof T][] {
  return Object.values(e).filter((v) => typeof v !== "string") as T[keyof T][];
}

export const getValuesUserProductStatus = {
  [UserProductStatus.Active]: "Active",
  [UserProductStatus.Damaged]: ".Damaged",
  [UserProductStatus.Lost]: ".Lost",
  [UserProductStatus.Replaced]: ".Replaced",
  [UserProductStatus.Returned]: ".Returned",
};
