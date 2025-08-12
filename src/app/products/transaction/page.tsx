import { Api } from "@/utils/api";
import {
  Branch,
  Brand,
  Category,
  Product,
  ProductTransaction,
  User,
} from "@/models";
import { find } from "@/app/(api)";
import { ProductTransactionPage } from "./components";
import { CategoryType, ROLE } from "@/lib/enum";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, branch, product, users] = await Promise.all([
    find<ProductTransaction>(Api.product_transaction_admin, {}),
    find<Branch>(Api.branch, { limit: -1 }),
    find<Product>(Api.product, { type: CategoryType.DEFAULT, limit: -1 }),
    find<User>(Api.user, { limit: -1, role: ROLE.E_M }),
  ]);
  return (
    <section>
      <ContainerHeader title="Барааны хэрэглээ" />
      <div className="admin-container">
        <ProductTransactionPage
          data={res.data}
          branches={branch.data}
          products={product.data}
          users={users.data}
        />
      </div>
    </section>
  );
}
