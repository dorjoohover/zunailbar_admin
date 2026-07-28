import { Api } from "@/utils/api";
import { find, search } from "../(api)";
import { Service } from "@/models/service.model";
import { OrderLogPage } from "./components";
import { OrderLog, User } from "@/models";

export default async function Page() {
  const [logs, user] = await Promise.all([
    find<OrderLog>(Api.order, {}, "logs"),
    search<User>(Api.user, { limit: 20 }),
  ]);
  return (
    <section>
      {/* <div className="admin-container"> */}
      <OrderLogPage users={user.data} logs={logs.data} />
      {/* </div> */}
    </section>
  );
}
