import { Branch, User } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { Api } from "@/utils/api";
import { find } from "../(api)";
import { EmployeePage } from "./components";
const users: User[] = [
  {
    id: "1",
    firstname: "Dorjoo",
    lastname: "Hover",
    role: 10,
    mobile: "99112233",
    birthday: new Date("2000-01-01"),
    added_by: "admin",
    branch_id: "A",
    user_status: 10,
    description: "Dev",
    created_at: new Date("2025-08-01"),
  },
  {
    id: "2",
    firstname: "Bishu",
    lastname: "Hover",
    role: 20,
    mobile: "88110022",
    birthday: new Date("2003-09-09"),
    added_by: "admin",
    branch_id: "A",
    user_status: 20,
    description: "Dev",
    created_at: new Date("2025-08-01"),
  },
];

export default async function EmployeesPage() {
  const [userRes, branchRes] = await Promise.all([find<User>(Api.user, {role: 35}), find<Branch>(Api.branch)]);
  return (
    <section>
      <ContainerHeader title="Ажилчидын жагсаалт" />
      <div className="admin-container">
        <EmployeePage data={userRes.data} branches={branchRes.data} />
      </div>
    </section>
  );
}
