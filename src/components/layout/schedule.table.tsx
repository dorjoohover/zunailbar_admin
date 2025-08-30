import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  formatTime,
  getDayNameWithDate,
  mnDate,
  numberArray,
  sameYMD,
  stripTime,
} from "@/lib/functions";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Dispatch, SetStateAction, useState } from "react";
import { ScheduleEdit } from "@/lib/constants";
const days = numberArray(7);
const today = new Date().getDay();
export const ScheduleTable = ({
  edit,
  d,
  value,
  setEdit,
  artist = false,
}: {
  edit?: ScheduleEdit[];
  setEdit?: Dispatch<SetStateAction<ScheduleEdit[]>>;
  d: number | Date;
  artist?: boolean;
  value: string[];
}) => {
  const date = d;
  const today = mnDate();
  const hour = today.getHours();
  today.setHours(0, 0, 0, 0);
  const checkDate = mnDate(date as Date);
  checkDate.setHours(0, 0, 0, 0);

  const stripedDate = stripTime(checkDate);

  function getDisabledDaysForWeek(days: number[], time: number) {
    const start = stripTime(checkDate); // тухайн 7 хоногийн Ням
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Бямба

    const td = stripTime(today);

    if (td < start) {
      // Ирээдүйн 7 хоног → өнөөдрөөс өмнө гэж тооцогдох өдөр алга
      return days.map(() => false);
    }

    if (td > end) {
      // Өнгөрсөн 7 хоног → бүх өдөр өнөөдрөөс өмнө
      return days.map(() => true);
    }
    if (hour >= time - 7) {
      return days.map(() => true);
    }

    // Өнөөдөр энэ 7 хоногт багтаж байна
    let todayIdx = td.getDay(); // 0..6 (0=Ням)
    todayIdx = todayIdx == 0 ? 7 : todayIdx;
    const s = days.map((day) => day < todayIdx);
    return s;
  }

  // Ашиглах нь

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          {days.map((day) => {
            const d = getDayNameWithDate(day, date);
            return (
              <TableHead className="w-[60px] " key={day}>
                <div className="flex items-center justify-center flex-col">
                  {!artist && <div>{d.date}</div>}
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
              {days.map((day) => {
                const idx = day - 1; // 1=Даваа -> 0 индекс
                const times = (value[idx] ?? "").split("|").filter(Boolean);

                const keyStr = String(hour);
                const includes = times.includes(keyStr);
                const selected = edit?.findIndex(
                  (e) => e.day == day && e.times.includes(time + 7)
                );
                return (
                  <TableCell key={day}>
                    <Button
                      type="button"
                      className={cn(
                        includes
                          ? "bg-teal-500 text-white hover:bg-teal-500/80 hover:text-white"
                          : selected != -1
                          ? "bg-red-500 text-white hover:bg-teal-500/80 hover:text-white"
                          : "bg-gray-100 text-black hover:bg-gray-200",
                        "w-full"
                      )}
                      disabled={
                        artist
                          ? false
                          : getDisabledDaysForWeek(days, time)[day - 1]
                      }
                      onClick={() => {
                        if (setEdit) {
                          setEdit((prev0: ScheduleEdit[]) => {
                            const prev = Array.isArray(prev0) ? prev0 : []; // анхны []-г баталгаажуулж байна
                            const newTime = time + 7;

                            // тухайн өдрийн индекс
                            const idx = prev.findIndex((d) =>
                              d.day == day
                            );

                            // 1) Байхгүй бол шинээр нэмнэ
                            if (idx === -1) {
                              return [
                                ...prev,
                                { day: day, times: [newTime] },
                              ];
                            }

                            // 2) Байсан бол times дээр toggle
                            const days = prev[idx];
                            const exists = days.times.includes(newTime);
                            const newTimes = exists
                              ? days.times.filter((t) => t !== newTime) // байсан бол устгана
                              : [...days.times, newTime].sort((a, b) => a - b); // байгаагүй бол нэмээд эрэмбэлнэ

                            // 3) Хэрэв times хоосон бол тухайн өдрийг массивээс устгана
                            if (newTimes.length === 0) {
                              return [
                                ...prev.slice(0, idx),
                                ...prev.slice(idx + 1),
                              ];
                            }

                            // 4) Өдрийг шинэчилж буцаана
                            const updated: ScheduleEdit = {
                              ...days,
                              times: newTimes,
                            };
                            return [
                              ...prev.slice(0, idx),
                              updated,
                              ...prev.slice(idx + 1),
                            ];
                          });
                        }
                        // let nextTimes = includes
                        //   ? times.filter((t) => t !== keyStr)
                        //   : [...times, keyStr];

                        // nextTimes = Array.from(new Set(nextTimes)).sort(
                        //   (a, b) => Number(a) - Number(b)
                        // );

                        // const next = [...value];
                        // next[idx] = nextTimes.join("|");
                        // // setValue(next);
                      }}
                    >
                      {formatTime(hour)}
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
  artist = false,
}: {
  date: number | Date;
  artist?: boolean;
  value: string[];
  setValue: (value: string[]) => void;
}) => {
  return (
    <Table className="table-fixed ">
      <TableHeader>
        <TableRow>
          {days.map((day) => {
            const d = getDayNameWithDate(day, date);
            return (
              <TableHead className="w-[60px] " key={day}>
                <div className="flex items-center justify-center flex-col">
                  {!artist && <div>{d.date}</div>}
                  <div>{d.day}</div>
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>

      <TableBody className="h-72 overflow-hidden">
        {numberArray(15).map((time) => {
          const hour = time + 7; // 8..22
          return (
            <TableRow key={time}>
              {days.map((day) => {
                const idx = day - 1; // 1 = Даваа -> 0 индекс
                const times = (value[idx] ?? "").split("|").filter(Boolean);

                const keyStr = String(hour);
                const includes = times.includes(keyStr);

                return (
                  <TableCell key={day}>
                    <Button
                      type="button"
                      variant={"ghost"}
                      className={cn(
                        includes
                          ? "bg-teal-500 text-white hover:bg-teal-500/80 hover:text-white"
                          : "bg-gray-100 text-black hover:bg-gray-200",
                        "w-full"
                      )}
                      disabled={
                        false
                        // date &&
                        // new Date(date).getDate() == new Date().getDate() &&
                        // today > day
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
                      {formatTime(hour)}
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
