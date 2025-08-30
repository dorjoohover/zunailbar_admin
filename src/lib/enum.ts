export enum TeamType {
  TEAM = 10,
  GROUP = 20,
  PARTNER = 30,
}

export enum ROLE {
  SYSTEM = 10,
  ADMIN = 20,
  MANAGER = 30,
  EMPLOYEE = 40,
  CLIENT = 50,
  ANY = 60,
  E_M = 35,
}

export enum EmployeeStatus {
  ACTIVE = 10,
  DEKIRIT = 20,
  VACATION = 30,
  FIRED = 40,
  BANNED = 50,
}
export enum UserStatus {
  ACTIVE = 10,
  BANNED = 50,
}

export enum SalaryLogStatus {
  Pending = 10,
  Paid = 20,
}
export enum OrderStatus {
  // uridchilgaa toloogui
  Pending = 10,
  // uridchilgaa tolson
  Active = 20,
  // uilchilgee ehelsen
  Started = 30,
  // duussan
  Finished = 40,
  // tsutsalsan
  Cancelled = 50,
}
// export enum EmployeeStatus {
//   ACTIVE = 10,
//   DEKIRIT = 20,
//   VACATION = 30,
//   FIRED = 40,
// }

export enum UserProductStatus {
  Active = 10,
  Returned = 20,
  Lost = 30,
  Damaged = 40,
  Replaced = 50,
}
export enum ScheduleStatus {
  Active = 10,
  Pending = 20,

  Absent = 30,
  Hidden = 40,
}

export enum ScheduleType {
  Free = 10,
  Vacation = 20,
}

export enum ProductTransactionStatus {
  Used = 10,
  Sold = 20,
  Damaged = 30,
}

export enum ProductLogStatus {
  Bought = 10,
  Remainder = 20,
  // Damaged = 30,
}

export enum DISCOUNT {
  Percent = 10,
  Price = 20,
}

export enum CategoryType {
  DEFAULT = 10,
  COST = 20,
}
export enum CostStatus {
  Paid = 10,
  Remainder = 20,
}
