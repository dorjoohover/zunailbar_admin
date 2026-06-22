import { Api } from "@/utils/api";
import { find } from "../(api)";
import { SmsLogPage } from "./components";

export default async function Page() {
  const res = await find<any>(Api.sms_logs, { limit: 50 });
  return (
    <section>
      <SmsLogPage logs={res.data} />
    </section>
  );
}
