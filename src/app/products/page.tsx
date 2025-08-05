import { Api } from "@/utils/api";
import { find, findOne } from "../(api)";
import { ProductPage } from "./components";
import { Category, IProduct, Product } from "@/models";

export default async function Page() {
  const [res, category] = await Promise.all([
    find<Product>(Api.product),
    find<Category>(Api.category),
  ]);

  return (
    <div className="w-full">
      <ProductPage data={res.data} categories={category.data} />
    </div>
  );
}
