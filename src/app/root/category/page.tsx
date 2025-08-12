import { Api } from "@/utils/api";
import {
  Category,
  Product,
  ProductLog,
  ProductWarehouse,
  Warehouse,
} from "@/models";
import { find } from "@/app/(api)";
import { CategoryPage } from "./components";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res] = await Promise.all([find<Category>(Api.category)]);
  return (
    <section>
      <ContainerHeader title="Category " />
      <div className="admin-container">
        <CategoryPage data={res.data} />
      </div>
    </section>
  );
}
