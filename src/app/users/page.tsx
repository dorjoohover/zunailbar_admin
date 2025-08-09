import { Api } from "@/utils/api";
import { find } from "../(api)";
import { UserPage } from "./components";
import { Branch, User } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { ROLE } from "@/lib/enum";

export default async function Page() {
  const [res, branch] = await Promise.all([
    find<User>(Api.service, { role: ROLE.CLIENT }),
    find<Branch>(Api.branch, { limit: -1 }),
  ]);
  return (
    <section>
      <ContainerHeader title="Үйлчилгээ" />
      <div className="admin-container">
        <UserPage data={res.data} branches={branch.data} />
      </div>
    </section>
  );
}
