import { Api } from "@/utils/api";
import { find } from "../(api)";
import { Service } from "@/models/service.model";
import { OrderPage } from "./components";
import { Branch, User } from "@/models";
import { ROLE } from "@/lib/enum";

export default async function Page() {
  const [branch, user, client, services] = await Promise.all([
    find<Branch>(Api.branch, { limit: -1 }),
    find<User>(Api.user, { limit: -1, role: ROLE.E_M }),
    find<User>(Api.user, { limit: -1, role: ROLE.CLIENT }),
    find<Service>(Api.service, { limit: -1 }),
  ]);
  return (
    <section>
      {/* <div className="admin-container"> */}
      <OrderPage
        branches={branch.data}
        users={user.data}
        customers={client.data}
        services={services.data}
      />
      {/* </div> */}
    </section>
  );
}
