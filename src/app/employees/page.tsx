import { Branch, User } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { Api } from "@/utils/api";
import { find } from "../(api)";
import { EmployeePage } from "./components";
import { ROLE } from "@/lib/enum";

export default async function EmployeesPage() {
  const [userRes, branchRes] = await Promise.all([
    find<User>(Api.user, { role: ROLE.E_M }),
    find<Branch>(Api.branch),
  ]);
  return (
    <section>
      {/* <div className="admin-container"> */}
      <EmployeePage data={userRes.data} branches={branchRes.data} />
      {/* </div> */}
    </section>
  );
}
