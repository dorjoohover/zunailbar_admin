import { Api } from "@/utils/api";
import { Branch, CostCategory, Cost } from "@/models";
import { find, search } from "@/app/(api)";
import { CostPage } from "./components";

export default async function Page() {
  const [res, branch, category] = await Promise.all([
    find<Cost>(Api.cost),
    find<Branch>(Api.branch, { limit: -1 }),
    search<CostCategory>(Api.cost_category, { limit: -1 }),
  ]);
  return (
    <section>
      <CostPage
        data={res.data}
        branches={branch.data}
        categories={category.data}
      />
    </section>
  );
}
