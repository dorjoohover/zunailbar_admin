import { Api } from "@/utils/api";
import { IntegrationPayment, User } from "@/models";
import { find } from "@/app/(api)";
import { SalaryPage } from "./components";
import { ROLE, UserStatus } from "@/lib/enum";

export default async function Page() {
  const [res, user] = await Promise.all([
    find<IntegrationPayment>(Api.integration_payment),
    find<User>(Api.user, {
      role: ROLE.E_M,
      limit: -1,
      user_status: UserStatus.ACTIVE,
    }),
  ]);
  return (
    <section>
      <SalaryPage data={res.data} users={user.data} />
    </section>
  );
}
