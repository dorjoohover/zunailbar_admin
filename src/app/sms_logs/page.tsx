import { Api } from "@/utils/api";
import { find, findOne } from "../(api)";
import { SmsLogPage } from "./components";

export default async function Page() {
  const [res, info, reminder] = await Promise.all([
    find<any>(Api.sms_logs, { limit: 50 }),
    // WeSend унасан ч түүх харагдсаар байх ёстой
    findOne(Api.sms_logs, "balance").catch(() => null),
    findOne(Api.order, "reminder").catch(() => null),
  ]);
  return (
    <section>
      <SmsLogPage
        logs={res.data}
        info={info?.payload ?? info}
        reminder={reminder?.payload ?? reminder}
      />
    </section>
  );
}
