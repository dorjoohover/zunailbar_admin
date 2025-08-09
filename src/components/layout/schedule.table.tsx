import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { formatTime, getDayNameWithDate, numberArray } from "@/lib/functions";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
const days = numberArray(7);
const today = new Date().getDay();
export const ScheduleTable = ({
  edit,
  d,
  value,
}: {
  edit: any;
  d: Date;
  value: string[];
}) => {
  const date = new Date(d);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(d);
  checkDate.setHours(0, 0, 0, 0);
  function stripTime(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function getDisabledDaysForWeek(weekSunday: Date, days: number[]) {
    const start = stripTime(weekSunday); // тухайн 7 хоногийн Ням
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Бямба
    const today = stripTime(new Date());

    if (today < start) {
      // Ирээдүйн 7 хоног → өнөөдрөөс өмнө гэж тооцогдох өдөр алга
      return days.map(() => false);
    }

    if (today > end) {
      // Өнгөрсөн 7 хоног → бүх өдөр өнөөдрөөс өмнө
      return days.map(() => true);
    }

    // Өнөөдөр энэ 7 хоногт багтаж байна
    const todayIdx = new Date().getDay(); // 0..6 (0=Ням)
    return days.map((day) => day < todayIdx);
  }

  // Ашиглах нь
  const disables = getDisabledDaysForWeek(
    checkDate /* Ням */,
    days /* [0..6] */
  );
  return (
    <Table className="table-fixed ">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]" />
          {days.map((day) => {
            const d = getDayNameWithDate(day, date);
            return (
              <TableHead className="w-[60px] " key={day}>
                <div className="flex items-center justify-center flex-col">
                  <div>{d.date}</div>
                  <div>{d.day}</div>
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>

      <TableBody>
        {numberArray(15).map((time) => {
          const hour = time + 7; // 8..22
          return (
            <TableRow key={time}>
              <TableCell className="font-medium">{formatTime(hour)}</TableCell>

              {days.map((day) => {
                const idx = day - 1; // 1=Даваа -> 0 индекс
                const times = (value[idx] ?? "").split("|").filter(Boolean);

                const keyStr = String(hour);
                const includes = times.includes(keyStr);
                return (
                  <TableCell key={day}>
                    <Button
                      type="button"
                      className={cn(
                        includes
                          ? "bg-black text-white"
                          : "bg-gray-300 text-black",
                        "w-full"
                      )}
                      disabled={disables[day]}
                      onClick={() => {
                        let nextTimes = includes
                          ? times.filter((t) => t !== keyStr)
                          : [...times, keyStr];

                        nextTimes = Array.from(new Set(nextTimes)).sort(
                          (a, b) => Number(a) - Number(b)
                        );

                        const next = [...value];
                        next[idx] = nextTimes.join("|");
                        // setValue(next);
                      }}
                    >
                      {includes ? "✔" : ``}
                    </Button>
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export const ScheduleForm = ({
  date,
  value,
  setValue,
}: {
  date: Date;
  value: string[];
  setValue: (value: string[]) => void;
}) => {
  return (
    <Table className="table-fixed ">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]" />

          {days.map((day) => {
            const d = getDayNameWithDate(day, date);
            return (
              <TableHead className="w-[60px] " key={day}>
                <div className="flex items-center justify-center flex-col">
                  <div>{d.date}</div>
                  <div>{d.day}</div>
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>

      <TableBody>
        {numberArray(15).map((time) => {
          const hour = time + 7; // 8..22
          return (
            <TableRow key={time}>
              <TableCell className="font-medium">{formatTime(hour)}</TableCell>

              {days.map((day) => {
                const idx = day - 1; // 1=Даваа -> 0 индекс
                const times = (value[idx] ?? "").split("|").filter(Boolean);

                const keyStr = String(hour);
                const includes = times.includes(keyStr);

                return (
                  <TableCell key={day}>
                    <Button
                      type="button"
                      className={cn(
                        includes
                          ? "bg-black text-white"
                          : "bg-gray-300 text-black",
                        "w-full"
                      )}
                      disabled={
                        date &&
                        new Date(date).getDate() == new Date().getDate() &&
                        today > day
                      }
                      onClick={() => {
                        let nextTimes = includes
                          ? times.filter((t) => t !== keyStr)
                          : [...times, keyStr];

                        nextTimes = Array.from(new Set(nextTimes)).sort(
                          (a, b) => Number(a) - Number(b)
                        );

                        const next = [...value];
                        next[idx] = nextTimes.join("|");
                        setValue(next);
                      }}
                    >
                      {includes ? "✔" : ""}
                    </Button>
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
