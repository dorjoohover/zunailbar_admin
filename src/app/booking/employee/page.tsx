import { Api } from "@/utils/api";
import ContainerHeader from "@/components/containerHeader";
import { Booking, Branch, Schedule, User } from "@/models";
import { find } from "@/app/(api)";
import { ROLE } from "@/lib/enum";
import { SchedulePage } from "./components";

export default async function Page() {
  const user = await find<User>(Api.user, { limit: -1, role: ROLE.E_M });
  const res = await find<Schedule>(
    Api.schedule,
    {
      limit: 7,
    },
    "employee"
  );
  return (
    <section>
      <ContainerHeader title="Цагийн хуваарь" />
      <div className="admin-container">
        <SchedulePage data={res.data} users={user.data} />
      </div>
    </section>
  );
}
