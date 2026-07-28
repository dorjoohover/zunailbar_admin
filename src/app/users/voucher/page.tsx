import { Api } from "@/utils/api";
import { Voucher } from "@/models/voucher.model";
import { User } from "@/models/user.model";
import { find, findOne, search } from "@/app/(api)";
import { VoucherPage } from "./components";
import { ROLE } from "@/lib/enum";
import { ListDefault } from "@/lib/constants";

export default async function Page() {
  const [res, config, customers, level] = await Promise.all([
    find<Voucher>(Api.voucher).catch(() => ({ data: ListDefault })),
    findOne(Api.voucher, "config").catch(() => null),
    search<User>(Api.user, {
      limit: 20,
      sort: false,
      role: ROLE.CLIENT,
    }).catch(() => ({ data: [] })),
    find(Api.order, {}, "level").catch(() => ({ data: ListDefault })),
  ]);
  const levelConfig = (level.data as any)?.items ?? level.data ?? {};

  return (
    <section>
      <VoucherPage
        data={res.data}
        customers={customers.data ?? []}
        config={config?.payload ?? config}
        level={levelConfig as any}
      />
    </section>
  );
}
