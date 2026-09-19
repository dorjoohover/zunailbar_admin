import { Api } from "@/utils/api";
import { find, search } from "../(api)";
import { Service } from "@/models/service.model";
import { OrderPage } from "./components";
import { Branch, Schedule, User } from "@/models";
import { ROLE, STATUS, UserStatus } from "@/lib/enum";
import { Slot } from "@/models/slot.model";

type PageProps = {
  searchParams?: Promise<{
    date?: string | string[];
    to?: string | string[];
    list?: string | string[];
  }>;
};

const getValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function Page({ searchParams }: PageProps) {
  // Сонгосон өдөр (?date=YYYY-MM-DD) — refresh хийхэд тухайн өдөр дээрээ үлдэнэ.
  const params = (await searchParams) ?? {};
  const [branch, user, services, level] = await Promise.all([
    search<Branch>(Api.branch, { limit: -1 }),
    search<User>(Api.user, {
      limit: 20,
      role: ROLE.E_M,
      user_status: UserStatus.ACTIVE,
      // "Устгасан" (users.status=Hidden) ажилтан ч захиалга vvсгэх артистын
      // жагсаалтад гарч ирэхгvй байх ёстой — user_status (ажлын байдал)
      // ялгаатай багана тул хоёуланг нь шvvнэ.
      status: STATUS.Active,
    }),

    find<Service>(Api.service, { limit: 20, sort: false }),
    find(Api.order, {}, "level"),
  ]);

  const client = await search<User>(Api.user, { limit: 20, role: ROLE.CLIENT });
  const levelConfig = (level.data as any)?.items ?? level.data ?? {};
  return (
    <section>
      {/* <div className="admin-container"> */}
      <OrderPage
        branches={branch.data}
        users={user.data}
        customers={client.data}
        services={services.data}
        initialQuery={{
          date: getValue(params.date),
          to: getValue(params.to),
          list: getValue(params.list),
        }}
        level={levelConfig as any}
      />
      {/* </div> */}
    </section>
  );
}
