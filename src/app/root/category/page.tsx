import { Api } from "@/utils/api";
import { Category, Product, ProductLog, ProductWarehouse, Warehouse } from "@/models";
import { find, search } from "@/app/(api)";
import { CategoryPage } from "./components";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, parents] = await Promise.all([
    find<Category>(Api.category),
    search<Category>(Api.category, { limit: 50, top_level: true } as any),
  ]);
  return (
    <section>
      <CategoryPage data={res.data} parents={parents.data} />
    </section>
  );
}
