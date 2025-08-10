import { Api } from "@/utils/api";
import { find } from "../(api)";
import { ProductPage } from "./components";
import { Brand, Category, Product } from "@/models";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, category, brand] = await Promise.all([
    find<Product>(Api.product),
    find<Category>(Api.category, { isCost: false, limit: -1 }),
    find<Brand>(Api.brand, { limit: -1 }),
  ]);
  return (
    <section>
      <ContainerHeader title="Барааны жагсаалт" />
      <div className="admin-container">
        <ProductPage
          data={res.data}
          categories={category.data}
          brands={brand.data}
        />
      </div>
    </section>
  );
}
