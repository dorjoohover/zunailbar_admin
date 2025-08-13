import { Api } from "@/utils/api";
import { Service } from "@/models/service.model";
import { DiscountPage } from "./components";
import { Branch, Discount } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { find } from "@/app/(api)";

export default async function Page() {
  const [res, branch, service] = await Promise.all([find<Discount>(Api.discount), find<Branch>(Api.branch, { limit: -1 }), find<Service>(Api.service, { limit: -1 })]);
  return (
    <section>
      <DiscountPage data={res.data} branches={branch.data} services={service.data} />
    </section>
  );
}
