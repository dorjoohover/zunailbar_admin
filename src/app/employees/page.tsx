"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "./components/columns";
import { IUser } from "@/models";
import ContainerHeader from "@/components/containerHeader";

const users: IUser[] = [
  {
    id: "1",
    firstname: "Dorjoo",
    lastname: "Hover",
    role: 1,
    mobile: "99112233",
    birthday: new Date("2000-01-01"),
    added_by: "admin",
    branch_id: "A",
    user_status: 1,
    description: "Dev",
    created_at: new Date("2025-08-01"),
  },
  {
    id: "2",
    firstname: "Bishu",
    lastname: "Hover",
    role: 2,
    mobile: "88110022",
    birthday: new Date("2003-09-09"),
    added_by: "admin",
    branch_id: "A",
    user_status: 0,
    description: "Dev",
    created_at: new Date("2025-08-01"),
  },
];

export default function EmployeesPage() {
  return (
    <div className="admin-container">
    <ContainerHeader title="Ажилчидын жагсаалт" />
      <div className="w-full">
        <DataTable columns={columns} data={users} />
      </div>
    </div>
  );
}
