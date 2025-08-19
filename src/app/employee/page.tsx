import { Api } from "@/utils/api";
import { find } from "../(api)";
import { Service } from "@/models/service.model";
import { OrderPage } from "./components";
import { Branch, Order } from "@/models";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, branch] = await Promise.all([
    find<Order>(Api.order),
    find<Branch>(Api.branch, { limit: -1 }),
  ]);
  return (
    <section>
      {/* <div className="admin-container"> */}
        <OrderPage data={res.data} branches={branch.data} />
      {/* </div> */}
    </section>
  );
}
