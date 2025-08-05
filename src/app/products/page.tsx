import { Api } from "@/utils/api";
import { find, findOne } from "../(api)";
import { ProductPage } from "./components";
import { Branch, Category, IProduct, Product } from "@/models";

export default async function Page() {
  const [res, category, branch] = await Promise.all([
    find<Product>(Api.product),
    find<Category>(Api.category, { isCost: false }),
    find<Branch>(Api.branch),
  ]);

  return (
    <div className="w-full">
      <ProductPage
        data={res.data}
        categories={category.data}
        branches={branch.data}
      />
    </div>
  );
}
