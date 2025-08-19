import { ProductPage } from "./components";
import { Cost, Product } from "@/models";
import { find } from "../(api)";
import { Api } from "@/utils/api";
import DynamicHeader from "@/components/dynamicHeader";

export default async function Page() {
  const { data } = await find<Product>(Api.product, {
    isCost: true,
  });

  return (
    <div className="w-full">
      <DynamicHeader />
      <ProductPage data={data} />
    </div>
  );
}
