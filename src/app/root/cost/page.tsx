import { Api } from "@/utils/api";
import { CostCategory } from "@/models";
import { find } from "@/app/(api)";
import { CostPage } from "./components";

export default async function Page() {
  const [res] = await Promise.all([find<CostCategory>(Api.cost_category)]);
  return (
    <section>
      <CostPage data={res.data} />
    </section>
  );
}
