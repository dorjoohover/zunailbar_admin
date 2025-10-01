import { Api } from "@/utils/api";
import ContainerHeader from "@/components/containerHeader";
import { Booking, Branch, ISchedule, Schedule, User } from "@/models";
import { find } from "@/app/(api)";
import { ROLE } from "@/lib/enum";
import { SchedulePage } from "./components";

export default async function Page() {
  const user = await find<User>(Api.user, { limit: -1, role: ROLE.E_M });
  const res = await find<ISchedule>(
    Api.schedule,
    {
      limit: 7,
      user_id: user.data?.items?.[0]?.id,
    },
    "employee"
  );
  return (
    <section>
      <SchedulePage data={res.data} users={user.data} />
    </section>
  );
}
