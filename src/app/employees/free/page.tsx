import { Api } from "@/utils/api";
import { PendingSchedulePage } from "./components";
import { Schedule, User } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { find } from "@/app/(api)";
import { ROLE, ScheduleStatus } from "@/lib/enum";

export default async function Page() {
  const [res, user] = await Promise.all([
    find<Schedule>(Api.schedule, {
      schedule_status: ScheduleStatus.Pending,
    }),
    find<User>(Api.user, { limit: -1, role: ROLE.E_M }),
  ]);
  return (
    <section>
      <ContainerHeader title="Ажилтны чөлөө авах хүсэлт" />
      <div className="admin-container">
        <PendingSchedulePage data={res.data} users={user.data} />
      </div>
    </section>
  );
}
