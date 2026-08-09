import { Api } from "@/utils/api";
import { ArtistLeavePage } from "./components";
import { Branch, Schedule, User } from "@/models";
import { find } from "@/app/(api)";
import { ROLE, UserStatus } from "@/lib/enum";

export default async function Page() {
  const user = await find<User>(Api.user, {
    limit: -1,
    role: ROLE.E_M,
    user_status: UserStatus.ACTIVE,
  });
  const res = await find<Schedule>(
    Api.schedule,
    {
      user_id: user.data.items?.[0]?.id,
    },
    "leave",
  );
  const branch = await find<Branch>(Api.branch, { limit: -1 });
  return (
    <section>
      <ArtistLeavePage data={res.data} users={user.data} branches={branch.data} />
    </section>
  );
}
