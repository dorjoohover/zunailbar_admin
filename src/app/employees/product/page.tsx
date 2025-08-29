import { Branch, Product, User, UserProduct } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { Api } from "@/utils/api";
import { find } from "@/app/(api)";
import { EmployeeProductPage } from "./components";
import { ROLE } from "@/lib/enum";

export default async function EmployeesPage() {
  const [userProductRes, branch, product, user] = await Promise.all([
    find<UserProduct>(Api.user_product),
    find<Branch>(Api.branch, { limit: -1 }),
    find<Product>(Api.product, { limit: -1 }),
    find<User>(Api.user, { limit: -1, role: ROLE.E_M }),
  ]);
  return (
    <section>
        <EmployeeProductPage
          data={userProductRes.data}
          branches={branch.data}
          users={user.data}
          products={product.data}
        />
    </section>
  );
}
