import { Api } from "@/utils/api";
import { find } from "@/app/(api)";
import { IOrder, User } from "@/models";
import { FriendsPage } from "./components";
import { OrderStatus, ROLE, UserStatus } from "@/lib/enum";

export default async function Page() {
  const [orders, user] = await Promise.all([
    find<IOrder>(Api.order, {
      friend: 0,
      order_status: OrderStatus.Friend,
    }),
    find<User>(Api.user, {
      limit: 20,
      role: ROLE.E_M,
      user_status: UserStatus.ACTIVE,
    }),
  ]);

  return (
    <section>
      <FriendsPage data={orders.data} users={user.data} />
    </section>
  );
}
