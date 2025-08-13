import { UserProduct } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { Api } from "@/utils/api";
import { find } from "@/app/(api)";
import { EmployeeProductPage } from "./components";

export default async function EmployeesPage() {
  const [userProductRes] = await Promise.all([
    find<UserProduct>(Api.user_product),
  ]);
  return (
    <section>
      {/* <ContainerHeader title="Ажилчдад олгосон бүтээгдэхүүн" /> */}
      {/* <div className="admin-container"> */}
        <EmployeeProductPage
          data={userProductRes.data}
          //   branches={branchRes.data}
        />
      {/* </div> */}
    </section>
  );
}
