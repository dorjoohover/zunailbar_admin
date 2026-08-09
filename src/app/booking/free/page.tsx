import { Api } from "@/utils/api";
import { Branch, Booking } from "@/models";
import { find } from "@/app/(api)";
import { BranchLeavePage } from ".";

export default async function Page() {
  const branch = await find<Branch>(Api.branch, { limit: -1 });
  const res = await find<Booking>(
    Api.booking,
    {
      branch_id: branch.data.items?.[0]?.id,
    },
    "leave",
  );
  return (
    <section>
      <BranchLeavePage data={res.data} branches={branch.data} />
    </section>
  );
}
