import { Api } from "@/utils/api";
import { ArtistLeavePage } from "./components";
import { Schedule, User } from "@/models";
import ContainerHeader from "@/components/containerHeader";
import { find } from "@/app/(api)";
import { ROLE, ScheduleStatus, UserStatus } from "@/lib/enum";
import { ArtistLeave } from "@/models/artist.leaves.model";

export default async function Page() {
  const user = await find<User>(Api.user, { limit: -1, role: ROLE.E_M, user_status: UserStatus.ACTIVE });
  const res = await find<ArtistLeave>(Api.artist_leaves, {
    artist_id: user.data.items?.[0]?.id,
  });
  return (
    <section>
      {/* <ContainerHeader group="Ажилчид" title="Ажилтны чөлөө авах хүсэлт" /> */}
      {/* <div className=""> */}
      <ArtistLeavePage data={res.data} users={user.data} />
      {/* </div> */}
    </section>
  );
}
