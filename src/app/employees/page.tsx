import { Branch, User } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { Api } from "@/utils/api";
import { find } from "../(api)";
import { EmployeePage } from "./components";
import { ROLE, UserStatus } from "@/lib/enum";

export default async function EmployeesPage() {
  const [userRes, branchRes, levelRes] = await Promise.all([
    find<User>(Api.user, { role: ROLE.E_M, user_status: UserStatus.ACTIVE }),
    find<Branch>(Api.branch),
    find(Api.order, {}, "level"),
  ]);
  const levelConfig = (levelRes.data as any)?.items ?? levelRes.data ?? {};

  return (
    <section>
      {/* <div className="admin-container"> */}
      <EmployeePage
        data={userRes.data}
        branches={branchRes.data}
        level={levelConfig as any}
      />
      {/* </div> */}
    </section>
  );
}
