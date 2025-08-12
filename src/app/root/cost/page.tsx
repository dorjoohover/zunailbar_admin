import { Api } from "@/utils/api";
import {
  Category,
  Product,
} from "@/models";
import { find } from "@/app/(api)";
import { CostPage } from "./components";
import { CategoryType, ROLE } from "@/lib/enum";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, category] = await Promise.all([
    find<Product>(Api.product, { type: CategoryType.COST }),
    find<Category>(Api.category, { limit: -1, type: CategoryType.COST }),
  ]);
  return (
    <section>
      <ContainerHeader title="Хэрэглээний зардал" />
      <div className="admin-container">
        <CostPage data={res.data} categories={category.data} />
      </div>
    </section>
  );
}
