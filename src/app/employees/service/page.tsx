import { Api } from "@/utils/api";
import { Service } from "@/models/service.model";
import { User, UserService } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { find, search } from "@/app/(api)";
import { EmployeeUserServicePage } from "./components";
import { ROLE } from "@/lib/enum";

export default async function Page() {
  const [res, service, user] = await Promise.all([
    find<UserService>(Api.user_service, {}, "employee"),
    find<Service>(Api.service, { limit: -1 }),
    search<User>(Api.user, { limit: 20, role: ROLE.E_M }),
  ]);
  return (
    <section>
      {/* <ContainerHeader title="Ажилтны хийдэг үйлчилгээ" />
      <div className="admin-container"> */}
      <EmployeeUserServicePage
        data={res.data}
        services={service.data}
        users={user.data}
      />
      {/* </div> */}
    </section>
  );
}
