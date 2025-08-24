import { Api } from "@/utils/api";
import { find } from "../(api)";
import { UserPage } from "./components";
import { Branch, User } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { ROLE } from "@/lib/enum";

export default async function Page() {
  const [res] = await Promise.all([
    find<User>(Api.service, { role: ROLE.CLIENT }),
  ]);
  return (
    <section>
      <UserPage data={res.data} />
    </section>
  );
}
