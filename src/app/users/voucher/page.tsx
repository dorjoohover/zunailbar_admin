import { Api } from "@/utils/api";
import { Voucher } from "@/models/voucher.model";
import { Service } from "@/models/service.model";
import { find, search } from "@/app/(api)";
import { VoucherPage } from "./components";

export default async function Page() {
  const [res, service] = await Promise.all([
    find<Voucher>(Api.voucher),
    search<Service>(Api.service, { limit: 20 }),
  ]);
  return (
    <section>
      <VoucherPage data={res.data} services={service.data} />
    </section>
  );
}
