import { Api } from "@/utils/api";
import { find } from "@/app/(api)";
import { HomePage } from "./components";
import { Home } from "@/models/home.model";

export default async function Page() {
  const res = await find<Home>(Api.home, {}, "web/home");
  return (
    <section>
      <HomePage data={res.data} />
    </section>
  );
}
