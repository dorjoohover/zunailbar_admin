import { Api } from "@/utils/api";
import { Branch, Category, Cost, Product } from "@/models";
import { find } from "@/app/(api)";
import { CostPage } from "./components";
import { CategoryType, ROLE } from "@/lib/enum";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, product, branch, category] = await Promise.all([
    find<Cost>(Api.cost),
    find<Product>(Api.product, { limit: -1, type: CategoryType.COST }),
    find<Branch>(Api.branch, { limit: -1 }),
    find<Category>(Api.category, { limit: -1 }),
  ]);
  return (
    <section>
      {/* <ContainerHeader title="Хэрэглээний зардал" />
      <div className="admin-container"> */}
      <CostPage
        data={res.data}
        products={product.data}
        branches={branch.data}
        categories={category.data}
      />
      {/* </div> */}
    </section>
  );
}
