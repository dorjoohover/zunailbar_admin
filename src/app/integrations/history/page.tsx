import { find } from "@/app/(api)";
import { ROLE, UserStatus } from "@/lib/enum";
import { IntegrationPayment, User } from "@/models";
import { Api } from "@/utils/api";
import { IntegrationHistoryPage } from "./components";

type PageProps = {
  searchParams?: {
    from?: string | string[];
    to?: string | string[];
    artist_id?: string | string[];
  };
};

const getValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function Page({ searchParams }: PageProps) {
  const initialFilter = {
    from: getValue(searchParams?.from),
    to: getValue(searchParams?.to),
    artist_id: getValue(searchParams?.artist_id),
  };

  const [res, user] = await Promise.all([
    find<IntegrationPayment>(Api.integration_payment, initialFilter),
    find<User>(Api.user, {
      role: ROLE.E_M,
      limit: -1,
      user_status: UserStatus.ACTIVE,
    }),
  ]);

  return (
    <section>
      <IntegrationHistoryPage
        data={res.data}
        users={user.data}
        initialFilter={initialFilter}
      />
    </section>
  );
}
