import { Api } from "@/utils/api";
import { Branch, Brand, Warehouse } from "@/models";
import { find } from "@/app/(api)";
import { BranchPage } from "./components";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res] = await Promise.all([find<Branch>(Api.branch)]);
  return (
    <section>
      <ContainerHeader title="Салбар түүх" />
      <div className="admin-container">
        <BranchPage data={res.data} />
      </div>
    </section>
  );
}
