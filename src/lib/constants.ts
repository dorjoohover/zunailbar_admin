import { Crown, Shield, User2 } from "lucide-react";
import {
  CategoryType,
  CostStatus,
  DISCOUNT,
  OrderStatus,
  ProductLogStatus,
  ProductTransactionStatus,
  ROLE,
  SalaryLogStatus,
  ScheduleStatus,
  UserProductStatus,
  UserStatus,
} from "./enum";
import z from "zod";

export const roleIconMap = {
  [ROLE.SYSTEM]: { icon: Crown, color: "yellow" },
  [ROLE.ADMIN]: { icon: Shield, color: "orange" },
  [ROLE.EMPLOYEE]: { icon: User2, color: "gray" },
  [ROLE.CLIENT]: { icon: User2, color: "gray" },
  [ROLE.MANAGER]: { icon: User2, color: "gray" },
  [ROLE.ANY]: { icon: User2, color: "gray" },
  [ROLE.E_M]: { icon: User2, color: "gray" },
};
export const RoleValue = {
  [ROLE.SYSTEM]: "SYSTEM",
  [ROLE.ADMIN]: "ADMIN",
  [ROLE.MANAGER]: "MANAGER",
  [ROLE.EMPLOYEE]: "EMPLOYEE",
  [ROLE.CLIENT]: "CLIENT",
  [ROLE.ANY]: "ANY",
  [ROLE.E_M]: "ANY",
};
export const zStrOpt = z.string().nullable().optional();
export const zNumOpt = z.number().nullable().optional();
// export const EmployeeStatusValue = {
//   [EmployeeStatus.ACTIVE]: { name: "Идэвхтэй", color: "green" },
//   [EmployeeStatus.DEKIRIT]: { name: "Декирит", color: "orange" },
//   [EmployeeStatus.VACATION]: { name: "Амралт", color: "yellow" },
//   [EmployeeStatus.FIRED]: { name: "Халагдсан", color: "red" },
// };
export type Option<T = string | number> = { value: T; label: string };
export const UserStatusValue = {
  [UserStatus.ACTIVE]: { name: "Active", color: "green-badge badge" },
  [UserStatus.FIRED]: { name: "Халагдсан", color: "slate-badge badge" },
  [UserStatus.DEKIRIT]: { name: "Декирит", color: "red-badge badge" },
  [UserStatus.VACATION]: { name: "Амарсан", color: "yellow-badge badge" },
  [UserStatus.BANNED]: { name: "Banned", color: "red-badge badge" },
};
export const ScheduleStatusValue = {
  [ScheduleStatus.Active]: { name: "Active", color: "green-badge badge" },
  [ScheduleStatus.Pending]: { name: "Pending", color: "text-gray-600 badge" },
  [ScheduleStatus.Absent]: { name: "Absent", color: "text-red-500 badge" },
  [ScheduleStatus.Hidden]: { name: "Hidden", color: "text-red-500 badge" },
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

export const DEFAULT_LIMIT = 20;
export const DEFAULT_PAGE = 0;
export const DEFAULT_SORT = true;

export type PG = {
  page?: number;
  limit?: number;
  sort?: boolean;
  filter?: any;
};

export const DEFAULT_PG: Required<PG> = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
  sort: DEFAULT_SORT,
  filter: undefined,
};

export const ListDefault = {
  count: 0,
  items: [],
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
  
  [UserProductStatus.Active]: {name: "Active", color: "green-badge badge",},
  [UserProductStatus.Damaged]: {name: "Damaged", color: "red-badge badge"},
  [UserProductStatus.Lost]: {name: "Lost", color: "yellow-badge badge"},
  [UserProductStatus.Replaced]: {name: "Replaced", color: "slate-badge badge"},
  [UserProductStatus.Returned]: {name: "Returned", color: "neutral-badge badge"},
};
export const getValuesCostStatus = {
  [CostStatus.Paid]: {name: "Төлсөн", color: "green-badge badge"},
  [CostStatus.Remainder]: {name: "Үлдэгдэлтэй", color: "yellow-badge badge"},
};
export const getValueDiscount = {
  [DISCOUNT.Percent]: "Хувиар",
  [DISCOUNT.Price]: "Үнээр",
};

export const getValuesProductTransactionStatus = {
  [ProductTransactionStatus.Used]: "Хэрэглэсэн",
  [ProductTransactionStatus.Damaged]: "Эвдэрсэн",
};
export const getValuesProductLogStatus = {
  [ProductLogStatus.Bought]: {name: "Худалдаж авсан", color: "green-badge badge"},
  [ProductLogStatus.Remainder]: {name: "Үлдэгдэлтэй", color: "yellow-badge badge"},
  // [ProductLogStatus.Damaged]: "Эвдэрсэн",
};

export const CategoryTypeValues = {
  [CategoryType.DEFAULT]: "Default",
  [CategoryType.COST]: "Хэрэглээний зардал",
  // [ProductLogStatus.Damaged]: "Эвдэрсэн",
};

export const SalaryLogValues = {
  [SalaryLogStatus.Paid]: "Paid",
  [SalaryLogStatus.Pending]: "Pending",
};

export const OrderStatusValues = {
  [OrderStatus.Active]: "Active",
  [OrderStatus.Started]: "Started",
  [OrderStatus.Cancelled]: ".Cancelled",
  [OrderStatus.Finished]: ".Finished",
  [OrderStatus.Pending]: "Pending",
};
