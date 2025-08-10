import { Api } from "@/utils/api";
import { find } from "../(api)";
import ContainerHeader from "@/components/containerHeader";
import { Booking, Branch, Schedule } from "@/models";
import { BookingPage } from "./components";

export default async function Page() {
  const branch = await find<Branch>(Api.branch, { limit: -1 });
  const res = await find<Booking>(
    Api.booking,
    {
      limit: 7,
      branch_id: branch.data.items[0].id,
    },
    "employee"
  );
  console.log(res);
  return (
    <section>
      <ContainerHeader title="Цагийн хуваарь" />
      <div className="admin-container">
        <BookingPage data={res.data} branches={branch.data} />
      </div>
    </section>
  );
}
