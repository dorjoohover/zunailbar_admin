import { Api } from "@/utils/api";
import { Branch } from "@/models";
import { find } from "@/app/(api)";
import { DashboardClient } from "@/components/dashboard";
import DashboardClientEffects from "@/components/dashboard/client-effects";

export default async function HomePage() {
  const branches = await find<Branch>(Api.branch, { limit: -1 });
  return (
    <main>
      <DashboardClientEffects />
      <DashboardClient branches={branches.data?.items ?? []} />
    </main>
  );
}
