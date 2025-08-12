import { Api } from "@/utils/api";
import { Product, ProductLog, ProductWarehouse, Warehouse } from "@/models";
import { find } from "@/app/(api)";
import { ProductWarehousePage } from "./components";
import ContainerHeader from "@/components/containerHeader";

export default async function Page() {
  const [res, warehouse] = await Promise.all([
    find<ProductWarehouse>(Api.product_warehouse),
    find<Warehouse>(Api.warehouse, { limit: -1 }),
  ]);
  return (
    <section>
      {/* <ContainerHeader title="Барааны түүх" />
      <div className="admin-container"> */}
        <ProductWarehousePage data={res.data} warehouses={warehouse.data} />
      {/* </div> */}
    </section>
  );
}
