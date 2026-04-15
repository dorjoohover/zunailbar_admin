import { find } from "@/app/(api)";
import { ROLE, UserStatus } from "@/lib/enum";
import { Integration, SalaryReconciliationItem, User } from "@/models";
import { Api } from "@/utils/api";
import { IntegrationsPage } from "./components";

type PageProps = {
  searchParams?: Promise<{
    from?: string | string[];
    to?: string | string[];
    artist_id?: string | string[];
  }>;
};

const getValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function Page({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const initialFilter = {
    from: getValue(params.from),
    to: getValue(params.to),
    sort: true,
    artist_id: getValue(params.artist_id),
  };

  const [res, integrationMetadata, reconciliation, user] = await Promise.all([
    find<Integration>(Api.integration, {
      ...initialFilter,
      limit: -1,
      page: 0,
    }),
    find<Integration>(Api.integration, {
      artist_id: initialFilter.artist_id,
      limit: 500,
      page: 0,
      sort: true,
    }),
    find<SalaryReconciliationItem>(
      Api.integration,
      {
        ...initialFilter,
        limit: -1,
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
        integrationMetadata={integrationMetadata.data}
        reconciliation={reconciliation.data}
        users={user.data}
        initialFilter={initialFilter}
      />
    </section>
  );
}
