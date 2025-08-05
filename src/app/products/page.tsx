import { Api } from "@/utils/api";
import { find } from "../(api)";
import { ProductPage } from "./components";
import { Branch, Category, Product } from "@/models";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, category, branch] = await Promise.all([find<Product>(Api.product), find<Category>(Api.category, { isCost: false }), find<Branch>(Api.branch)]);

  return (
    <section>
      <ContainerHeader title="Барааны жагсаалт" />
      <div className="admin-container">
        <ProductPage data={res.data} categories={category.data} branches={branch.data} />
      </div>
    </section>
  );
}
