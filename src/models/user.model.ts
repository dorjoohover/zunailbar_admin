import { ROLE } from "@/lib/enum";

export interface IUser {
  firstname?: string;
  lastname?: string;
  role?: ROLE;
  mobile?: string;
  birthday?: Date;
  added_by?: string;
  branch_id?: string;
  user_status?: number;
  description?: string;
  password?: string;
  created_at?: Date;
}
export interface User {
  id: string;
  firstname?: string;
  lastname?: string;
  role: ROLE;
  mobile: string;
  birthday?: Date;
  added_by?: string;
  branch_id?: string;
  branch_name?: string;
  user_status: number;
  description?: string;
  created_at?: Date;
}

export interface ILoginUser {
  mobile: string;
  password: string;
}
export interface IRegisterUser {
  mobile: string;
}
// AJiltan, users
