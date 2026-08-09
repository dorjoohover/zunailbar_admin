import { Api } from "@/utils/api";
import { find } from "../(api)";
import { Booking, Branch } from "@/models";
import { BookingPage } from "./components";
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
  const branch = await find<Branch>(Api.branch, { limit: -1 });
  const weekStart = toYMD(getMonday(new Date()));
  const res = await find<Booking>(
    Api.booking,
    {},
    `week/${branch.data.items[0].id}/${weekStart}`
  );
  return (
    <section>
      <BookingPage
        data={res.data}
        branches={branch.data}
        initialWeekStart={weekStart}
      />
    </section>
  );
}
