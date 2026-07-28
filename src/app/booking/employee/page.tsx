import { Api } from "@/utils/api";
import { Branch, Schedule, User } from "@/models";
import { find } from "@/app/(api)";
import { ROLE, UserStatus } from "@/lib/enum";
import { SchedulePage } from "./components";
import { toYMD } from "@/lib/functions";

function getMonday(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export default async function Page() {
  const user = await find<User>(Api.user, {
    limit: -1,
    role: ROLE.E_M,
    user_status: UserStatus.ACTIVE,
  });
  const branch = await find<Branch>(Api.branch, { limit: -1 });
  const weekStart = toYMD(getMonday(new Date()));
  const res = await find<Schedule>(
    Api.schedule,
    {},
    `week/${user.data?.items?.[0]?.id}/${weekStart}`
  );
  return (
    <section>
      <SchedulePage
        data={res.data}
        users={user.data}
        branches={branch.data}
        initialWeekStart={weekStart}
      />
    </section>
  );
}
