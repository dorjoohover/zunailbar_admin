import { find } from "@/app/(api)";
import { ROLE, UserStatus } from "@/lib/enum";
import { Integration, SalaryReconciliationItem, User } from "@/models";
import { Api } from "@/utils/api";
import { IntegrationsPage } from "./components";

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

  const [res, reconciliation, user] = await Promise.all([
    find<Integration>(Api.integration, {
      ...initialFilter,
      limit: 500,
      page: 0,
    }),
    find<SalaryReconciliationItem>(
      Api.integration,
      {
        ...initialFilter,
        limit: 500,
        page: 0,
      },
      "reconciliation",
    ),
    find<User>(Api.user, {
      role: ROLE.E_M,
      limit: -1,
      user_status: UserStatus.ACTIVE,
    }),
  ]);

  return (
    <section>
      <IntegrationsPage
        data={res.data}
        reconciliation={reconciliation.data}
        users={user.data}
        initialFilter={initialFilter}
      />
    </section>
  );
}
