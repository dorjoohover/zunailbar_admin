import { Api } from "@/utils/api";
import { find } from "../(api)";
import { Service } from "@/models/service.model";
import { OrderPage } from "./components";
import { Branch, Order, User } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { ROLE } from "@/lib/enum";

export default async function Page() {
  const [branch, user] = await Promise.all([
    find<Branch>(Api.branch, { limit: -1 }),
    find<User>(Api.user, { limit: -1, role: ROLE.E_M }),
  ]);
  return (
    <section>
      {/* <div className="admin-container"> */}
      <OrderPage branches={branch.data} users={user.data} />
      {/* </div> */}
    </section>
  );
}
