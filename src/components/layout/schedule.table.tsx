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
  date,
  value,
}: {
  edit: any;
  date: Date;
  value: string[];
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
                      disabled={today > day}
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
                      disabled={today > day}
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
