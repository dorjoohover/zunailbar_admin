import { find } from "@/app/(api)";
import { Branch, PaymentDailySummary } from "@/models";
import { Api } from "@/utils/api";
import { DailySummaryPage } from "./components";

type PageProps = {
  searchParams?: {
    from?: string | string[];
    to?: string | string[];
    branch_id?: string | string[];
  };
};

const getValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function Page({ searchParams }: PageProps) {
  const initialFilter = {
    from: getValue(searchParams?.from),
    to: getValue(searchParams?.to),
    branch_id: getValue(searchParams?.branch_id),
  };

  const [res, branches] = await Promise.all([
    find<any>(Api.payment, initialFilter as any, "summary"),
    find<Branch>(Api.branch, { limit: -1 }),
  ]);

  return (
    <section>
      <DailySummaryPage
        data={(res.data as unknown as PaymentDailySummary) ?? undefined}
        initialFilter={initialFilter}
        branches={branches.data}
      />
    </section>
  );
}
