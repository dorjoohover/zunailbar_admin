import { Api } from "@/utils/api";
import { find, search } from "../(api)";
import { Service } from "@/models/service.model";
import { OrderPage } from "./components";
import { Branch, User } from "@/models";
import { ROLE } from "@/lib/enum";

export default async function Page() {
  const [branch, user, client, services] = await Promise.all([
    search<Branch>(Api.branch, { limit: -1 }),
    search<User>(Api.user, { limit: 20, role: ROLE.E_M }),
    search<User>(Api.user, { limit: 20, role: ROLE.CLIENT }),
    find<Service>(Api.service, { limit: 20 }),
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
