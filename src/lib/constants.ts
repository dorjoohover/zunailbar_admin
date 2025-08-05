import { Crown, Shield, User2 } from "lucide-react";
import { ROLE, UserStatus } from "./enum";

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

export const UserStatusValue = {
  [UserStatus.ACTIVE]: { name: "Active" },
  [UserStatus.BANNED]: { name: "Banned" },
};

export interface ListType<T> {
  count: number;
  items: T[];
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
  page: 1,
  limit: 20,
  sort: false,
};

// export const PG = (dto: PgDto = {}): Required<PgDto> => ({
//   ...DEFAULT_PG,
//   ...dto,
// });

// patch put delete type
export type PPDT = { success: boolean; error?: string };
