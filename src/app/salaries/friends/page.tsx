import { Api } from "@/utils/api";
import { find, search } from "@/app/(api)";
import { Service } from "@/models/service.model";
import { OrderPage } from "@/app/orders/components";
import { Branch, User } from "@/models";
import { OrderStatus, ROLE, UserStatus } from "@/lib/enum";

export default async function Page() {
  const [branch, user, services] = await Promise.all([
    search<Branch>(Api.branch, { limit: -1 }),
    search<User>(Api.user, {
      limit: 20,
      role: ROLE.E_M,
      user_status: UserStatus.ACTIVE,
    }),
    find<Service>(Api.service, { limit: 20, sort: false }),
  ]);

  const client = await search<User>(Api.user, { limit: 20, role: ROLE.CLIENT });

  return (
    <section>
      <OrderPage
        branches={branch.data}
        users={user.data}
        customers={client.data}
        services={services.data}
        initialFilter={{ status: OrderStatus.Friend }}
        titleOverride="Танилын будалт"
        showConfirmButton={false}
      />
    </section>
  );
}
