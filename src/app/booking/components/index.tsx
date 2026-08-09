"use client";
import { Branch, IBooking, Booking } from "@/models";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListType, ACTION } from "@/lib/constants";
import { EmployeeStatus } from "@/lib/enum";
import { Api } from "@/utils/api";
import { create, deleteOne } from "@/app/(api)";
import { fetcher } from "@/hooks/fetcher";
import { formatTime, toYMD } from "@/lib/functions";
import DynamicHeader from "@/components/dynamicHeader";
import { showToast } from "@/shared/components/showToast";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminWeekScheduleManager,
  WeekScheduleData,
} from "@/components/layout/schedule.week";

function getMonday(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}
function addDaysStr(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toYMD(d);
}

const BRANCH_LEAVE_OPTIONS = [
  { status: EmployeeStatus.VACATION, label: "Хаах" },
];

const toWeekScheduleData = (items: Booking[] = []): WeekScheduleData =>
  items.reduce<WeekScheduleData>((acc, item) => {
    if (!item.date) return acc;
    const dateKey = toYMD(new Date(item.date));
    acc[dateKey] = {
      times: item.times?.split("|") ?? [],
      finish_time: item.finish_time
        ? formatTime(String(item.finish_time))
        : null,
      // Салбарт зөвхөн нэг "хаалттай" төлөв байдаг тул is_leave-г
      // VACATION статус болгож дүрсэлнэ (branch-level toggle нэг л сонголттой).
      leave_status: item.is_leave ? EmployeeStatus.VACATION : null,
      leave_description: item.leave_description ?? null,
    };
    return acc;
  }, {});

export const BookingPage = ({
  data,
  branches,
  initialWeekStart,
}: {
  data: ListType<Booking>;
  branches: ListType<Branch>;
  initialWeekStart: string;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [selectedBranch, setSelectedBranch] = useState(
    branches.items?.[0] ?? null,
  );
  const [weekStart, setWeekStart] = useState(
    initialWeekStart || toYMD(getMonday(new Date())),
  );
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysStr(weekStart, i)),
    [weekStart],
  );

  const [bookings, setBookings] = useState<ListType<Booking> | null>(null);
  useEffect(() => {
    setBookings(data);
  }, [data]);

  const [scheduleData, setScheduleData] = useState<WeekScheduleData>({});
  useEffect(() => {
    setScheduleData(toWeekScheduleData(bookings?.items ?? []));
  }, [bookings?.items]);

  const refresh = async () => {
    if (!selectedBranch) return;
    setAction(ACTION.RUNNING);
    await fetcher<Booking>(
      Api.booking,
      {},
      `week/${selectedBranch.id}/${weekStart}`,
    ).then((d) => {
      setBookings(d);
    });
    setAction(ACTION.DEFAULT);
  };

  const removeDay = async (date: string) => {
    if (!selectedBranch) return;
    setAction(ACTION.RUNNING);
    const res = await deleteOne(
      Api.booking,
      `${selectedBranch.id}/${date}`,
      "date",
    );
    if (res.success) {
      await refresh();
      showToast("success", "Амжилттай устгалаа.");
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };

  const saveDay = async (date: string, day: WeekScheduleData[string]) => {
    if (!selectedBranch) return;
    if (!day.times || day.times.length === 0) {
      const existing = bookings?.items?.find(
        (b) => b.date && toYMD(new Date(b.date)) === date,
      );
      if (existing) {
        await removeDay(date);
      } else {
        showToast("info", "Цаг сонгоогүй байна.");
      }
      return;
    }

    setAction(ACTION.RUNNING);
    const payload = {
      date,
      times: day.times,
      finish_time: day.finish_time ?? null,
      branch_id: selectedBranch.id,
    };
    const res = await create<IBooking>(Api.booking, payload as any);
    if (res.success) {
      await refresh();
      showToast("success", "Амжилттай шинэчиллээ.");
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };

  const updateSchedule = async (
    date: string,
    day: WeekScheduleData[string],
    action: number,
  ) => {
    if (action == 4) {
      await removeDay(date);
    } else if (action == 0 || action == 2) {
      await saveDay(date, day);
    }
    setScheduleData((prev) => ({ ...prev, [date]: day }));
  };

  const setLeave = async (date: string) => {
    if (!selectedBranch) return;
    setAction(ACTION.RUNNING);
    const res = await create<any>(
      Api.booking,
      { branch_id: selectedBranch.id, dates: [date], is_leave: true },
      "leave",
    );
    if (res.success) {
      await refresh();
      showToast("success", "Салбар амарна.");
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };

  const clearLeave = async (date: string) => {
    if (!selectedBranch) return;
    setAction(ACTION.RUNNING);
    const res = await deleteOne(
      Api.booking,
      `${selectedBranch.id}/${date}`,
      "leave",
    );
    if (res.success) {
      await refresh();
      showToast("success", "Амралт цуцлагдлаа.");
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current ? refresh() : (mounted.current = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch, weekStart]);

  const weekLabel = `${weekDates[0]} — ${weekDates[6]}`;

  return (
    <div className="">
      <DynamicHeader count={bookings?.count} />
      <div className="admin-container space-y-2">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:justify-between">
            <div>
              <label className="text-slate-700 text-sm mb-3 block">
                Салбар сонгох
              </label>
              <div className="relative">
                <Select
                  value={selectedBranch?.id}
                  onValueChange={(e) => {
                    const branch = branches.items.find((b) => b.id === e);
                    if (branch) setSelectedBranch(branch);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Салбар сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {branches?.items?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekStart((w) => addDaysStr(w, -7))}
                className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                title="Өмнөх долоо хоног"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-sm text-slate-700 min-w-[190px] text-center">
                {weekLabel}
              </div>
              <button
                onClick={() => setWeekStart((w) => addDaysStr(w, 7))}
                className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                title="Дараагийн долоо хоног"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setWeekStart(toYMD(getMonday(new Date())))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100"
              >
                Энэ долоо хоног
              </button>
            </div>

            {selectedBranch && (
              <div className="mt-3 flex items-center gap-2 text-slate-500 text-sm">
                <MapPin size={16} />
                <span>
                  {selectedBranch.name} {selectedBranch.address && "-"}{" "}
                  {selectedBranch.address}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <AdminWeekScheduleManager
            weekDates={weekDates}
            schedule={scheduleData}
            onUpdateDay={(date, day, act) => updateSchedule(date, day, act)}
            loading={action != ACTION.DEFAULT}
            allowLeaveEdit
            onSetLeave={(date) => setLeave(date)}
            onClearLeave={clearLeave}
            leaveOptions={BRANCH_LEAVE_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
};
