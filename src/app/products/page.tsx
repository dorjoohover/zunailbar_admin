import { Api } from "@/utils/api";
import { find, findOne } from "../(api)";
import { ProductPage } from "./components";
import { IProduct, Product } from "@/models";

export default async function Page() {
  const { data, error } = await find<Product>(Api.product, {
    isCost: false,
  });
  return (
    <div className="w-full">
      <ProductPage data={data} />
    </div>
  );
}
