import { Api } from "@/utils/api";
import { CostCategory } from "@/models";
import { find, search } from "@/app/(api)";
import { CostPage } from "./components";

export default async function Page() {
  const [res, parents] = await Promise.all([
    find<CostCategory>(Api.cost_category),
    search<CostCategory>(Api.cost_category, {
      limit: 50,
      top_level: true,
    } as any),
  ]);
  return (
    <section>
      <CostPage data={res.data} parents={parents.data} />
    </section>
  );
}
