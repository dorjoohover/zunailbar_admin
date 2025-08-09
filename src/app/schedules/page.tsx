import { Api } from "@/utils/api";
import { find } from "../(api)";
import ContainerHeader from "@/components/containerHeader";
import { Booking, Branch, Schedule } from "@/models";
import { BookingPage } from "./components";

export default async function Page() {
  const [res, branch] = await Promise.all([
    find<Booking>(Api.booking, { limit: 7 }),
    find<Branch>(Api.branch, { limit: -1 }),
  ]);
  return (
    <section>
      <ContainerHeader title="Цагийн хуваарь" />
      <div className="admin-container">
        <BookingPage data={res.data} branches={branch.data} />
      </div>
    </section>
  );
}
