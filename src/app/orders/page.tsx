import { Api } from "@/utils/api";
import { find } from "../(api)";
import { Service } from "@/models/service.model";
import { OrderPage } from "./components";
import { Branch } from "@/models";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, branch] = await Promise.all([
    find<Service>(Api.service),
    find<Branch>(Api.branch, { limit: -1 }),
  ]);
  return (
    <section>
      <ContainerHeader title="Үйлчилгээ" />
      <div className="admin-container">
        <OrderPage data={res.data} branches={branch.data} />
      </div>
    </section>
  );
}
