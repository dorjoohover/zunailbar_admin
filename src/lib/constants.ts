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
