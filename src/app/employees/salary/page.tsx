import { Api } from "@/utils/api";
import { User } from "@/models";
import { find, search } from "@/app/(api)";
import { EmployeeUserSalaryPage } from "./components";
import { ROLE } from "@/lib/enum";
import { UserSalary } from "@/models/user.salary.model";

export default async function Page() {
  const [res, user] = await Promise.all([
    find<UserSalary>(Api.user_salaries),
    search<User>(Api.user, { limit: 20, role: ROLE.E_M }),
  ]);
  return (
    <section>
      {/* <ContainerHeader title="Ажилтны хийдэг үйлчилгээ" />
      <div className="admin-container"> */}
      <EmployeeUserSalaryPage data={res.data} users={user.data} />
      {/* </div> */}
    </section>
  );
}
