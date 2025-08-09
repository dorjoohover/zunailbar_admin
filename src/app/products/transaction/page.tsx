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
import { ROLE } from "@/lib/enum";

export default async function Page() {
  const [res, branch, product, users] = await Promise.all([
    find<ProductTransaction>(Api.product_transaction_admin, {}),
    find<Branch>(Api.branch, { limit: -1 }),
    find<Product>(Api.product, { isCost: false, limit: -1 }),
    find<User>(Api.user, { limit: -1, role: ROLE.E_M }),
  ]);
  return (
    <section>
      {/* <ContainerHeader title="Барааны жагсаалт" /> */}
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
