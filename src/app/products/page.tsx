import { Api } from "@/utils/api";
import { find, search } from "../(api)";
import { ProductPage } from "./components";
import { Brand, Category, Product } from "@/models";
import ContainerHeader from "@/components/containerHeader";
export default async function Page() {
  const [res, category, brand] = await Promise.all([
    find<Product>(Api.product, {}),
    search<Category>(Api.category, { limit: 20 }),
    search<Brand>(Api.brand, { limit: 20 }),
  ]);
  return (
    <section>
      <ProductPage
        data={res.data}
        categories={category.data}
        brands={brand.data}
      />
    </section>
  );
}
