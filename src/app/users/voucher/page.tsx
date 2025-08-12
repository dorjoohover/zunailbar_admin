import { Api } from "@/utils/api";
import { Voucher } from "@/models/voucher.model";
import { Service } from "@/models/service.model";
import { find } from "@/app/(api)";
import { VoucherPage } from "./components";

export default async function Page() {
  const [res, service] = await Promise.all([find<Voucher>(Api.voucher), find<Service>(Api.service, { limit: -1 })]);
  return (
    <section>
      <VoucherPage data={res.data} services={service.data} />
    </section>
  );
}
