"use client";
import { ISchedule, User, Schedule, Branch } from "@/models";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListType, ACTION } from "@/lib/constants";
import { EmployeeStatus, ScheduleType } from "@/lib/enum";
import { Api } from "@/utils/api";
import { create, deleteOne } from "@/app/(api)";
import { fetcher } from "@/hooks/fetcher";
import {
  formatTime,
  mobileFormatter,
  toYMD,
  usernameFormatter,
} from "@/lib/functions";

import DynamicHeader from "@/components/dynamicHeader";
import { showToast } from "@/shared/components/showToast";
import { getColumns } from "./columns";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/data-table";
import {
  AdminWeekScheduleManager,
  WeekScheduleData,
} from "@/components/layout/schedule.week";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const toWeekScheduleData = (items: Schedule[] = []): WeekScheduleData =>
  items.reduce<WeekScheduleData>((acc, item) => {
    if (!item.date) return acc;
    const dateKey = toYMD(new Date(item.date));
    acc[dateKey] = {
      times: item.times?.split("|") ?? [],
      finish_time: item.finish_time
        ? formatTime(String(item.finish_time))
        : null,
      leave_status: item.leave_status ?? null,
      leave_description: item.leave_description ?? null,
    };
    return acc;
  }, {});

const toBranchByDate = (
  items: Schedule[] = [],
): Record<string, string | undefined> =>
  items.reduce<Record<string, string | undefined>>((acc, item) => {
    if (!item.date) return acc;
    acc[toYMD(new Date(item.date))] = item.branch_id;
    return acc;
  }, {});

export const SchedulePage = ({
  data,
  users,
  branches,
  initialWeekStart,
}: {
  data: ListType<Schedule>;
  users: ListType<User>;
  branches: ListType<Branch>;
  initialWeekStart: string;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [schedules, setSchedules] = useState<ListType<Schedule> | null>(null);
  const [selectedUser, setSelectedUser] = useState(users.items?.[0] ?? null);
  const [weekStart, setWeekStart] = useState(
    initialWeekStart || toYMD(getMonday(new Date())),
  );
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysStr(weekStart, i)),
    [weekStart],
  );
  const userMap = useMemo(
    () => new Map(users.items.map((b) => [b.id, b])),
    [users.items],
  );

  const ScheduleFormatter = (d: ListType<Schedule>) => {
    const items: Schedule[] = (d.items ?? []).map((item) => {
      const user = userMap.get(item.user_id);
      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });
    setSchedules({ items, count: d.count });
  };
  useEffect(() => {
    ScheduleFormatter(data);
  }, [data]);

  const edit = (schedule: Schedule) => {};
  // Жагсаалтын мөр дээрх устгах/засах товч одоогоор идэвхгүй (commented out
  // columns.tsx-д) тул зөвхөн type-той тааруулах зорилготой placeholder.
  const deleteSchedule = async (_index: number) => true;
  const columns = getColumns(edit, deleteSchedule);

  const [scheduleData, setScheduleData] = useState<WeekScheduleData>({});
  const [branchByDate, setBranchByDate] = useState<
    Record<string, string | undefined>
  >({});
  const [dirtyBranchDates, setDirtyBranchDates] = useState<Set<string>>(
    new Set(),
  );

  const refresh = async () => {
    if (!selectedUser) return;
    setAction(ACTION.RUNNING);
    await fetcher<Schedule>(
      Api.schedule,
      {},
      `week/${selectedUser.id}/${weekStart}`,
    ).then((d) => {
      ScheduleFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    setScheduleData(toWeekScheduleData(schedules?.items ?? []));
    setBranchByDate(toBranchByDate(schedules?.items ?? []));
    setDirtyBranchDates(new Set());
  }, [schedules?.items]);

  const removeDay = async (date: string) => {
    if (!selectedUser) return;
    setAction(ACTION.RUNNING);
    const res = await deleteOne(
      Api.schedule,
      `${selectedUser.id}/${date}`,
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
    if (!selectedUser) return;
    // Хоосон цаг хадгалахыг бүрэн блоклоно. Хэрэв одоо байгаа мөртэй бол
    // устгана.
    if (!day.times || day.times.length === 0) {
      const existing = schedules?.items?.find(
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
      user_id: selectedUser.id,
      type: ScheduleType.Free,
      branch_id: branchByDate[date],
    };

    // Нэг өдрийн upsert нь backend талд (user_id, date) түлхүүрээр байгаа
    // мөрийг устгаад дахин бичдэг тул үргэлж create л дуудна.
    const res = await create<ISchedule>(Api.schedule, payload as any);
    if (res.success) {
      await refresh();
      showToast("success", "Амжилттай шинэчиллээ.");
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current ? refresh() : (mounted.current = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, weekStart]);

  const [isList, setList] = useState(true);

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
    setScheduleData((prev) => ({
      ...prev,
      [date]: day,
    }));
  };

  const saveBranch = async (date: string) => {
    await saveDay(date, scheduleData[date] ?? { times: [], finish_time: null });
    setDirtyBranchDates((prev) => {
      const next = new Set(prev);
      next.delete(date);
      return next;
    });
  };

  const setLeave = async (date: string, status: EmployeeStatus) => {
    if (!selectedUser) return;
    setAction(ACTION.RUNNING);
    const res = await create<any>(Api.schedule, {
      user_id: selectedUser.id,
      dates: [date],
      leave_status: status,
    }, "leave");
    if (res.success) {
      await refresh();
      showToast("success", "Амралт тавигдлаа.");
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };

  const clearLeave = async (date: string) => {
    if (!selectedUser) return;
    setAction(ACTION.RUNNING);
    const res = await deleteOne(
      Api.schedule,
      `${selectedUser.id}/${date}`,
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

  const generateNow = async () => {
    setAction(ACTION.RUNNING);
    const res = await create<any>(Api.schedule, {}, "generate");
    if (res.success) {
      showToast("success", "Автомат тооцоолол шинэчлэгдлээ.");
      await refresh();
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };

  const homeBranchId = selectedUser?.branch_id;
  const weekLabel = `${weekDates[0]} — ${weekDates[6]}`;

  return (
    <div className="">
      <DynamicHeader />

      <div className="admin-container space-y-2">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border-light shadow-light">
          <div>
            <label className="text-slate-700 text-sm mb-3 block">
              Артист сонгох
            </label>
            <div className="relative">
              <Select
                value={selectedUser?.id}
                onValueChange={(e) => {
                  const user = users?.items?.find((b) => b.id === e);
                  if (user) setSelectedUser(user);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Артист сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users?.items?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {usernameFormatter(user)} -{" "}
                        {mobileFormatter(user.mobile ?? "")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isList && (
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
              {/* <button
                onClick={generateNow}
                className="rounded-lg bg-teal-500 px-3 py-2 text-xs text-white hover:bg-teal-600"
                title="app_config.availability_days цонхыг гараар шинэчлэх"
              >
                Автоматаар үргэлжлүүлэх
              </button> */}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-2 max-w-lg w-full md:w-auto">
            <Switch
              checked={isList}
              onCheckedChange={(val) => setList(val)}
              id="compare-switch"
            />
            <label
              htmlFor="compare-switch"
              className="text-sm text-muted-foreground"
            >
              Жагсаалтаар харах
            </label>
          </div>
        </div>

        {/* {!isList && (
          <p className="px-1 text-xs text-slate-500">
            Тавьсан долоо хоногоос хойшхи өдрүүдийг admin өгөөгүй бол систем
            автоматаар өмнөх долоо хоногийн ижил гарагийн хуваарийг хуулна
            (app_config.availability_days-аар тодорхойлогдсон цонхийн хэмжээгээр,
            өнөөдрөөс хойш). Тавьсан даруйдаа хадгалагдана.
          </p>
        )} */}

        {isList ? (
          <DataTable
            columns={columns}
            count={schedules?.count}
            data={(schedules?.items ?? []).sort((a, b) =>
              (a.date ?? "").localeCompare(b.date ?? ""),
            )}
            refresh={refresh}
            loading={action == ACTION.RUNNING}
            search={false}
          />
        ) : (
          <div>
            <AdminWeekScheduleManager
              weekDates={weekDates}
              schedule={scheduleData}
              onUpdateDay={(date, day, act) => updateSchedule(date, day, act)}
              loading={action != ACTION.DEFAULT}
              branches={branches?.items?.map((b) => ({
                id: b.id,
                name: b.name,
              }))}
              branchByDate={branchByDate}
              onBranchChange={(date, branchId) => {
                setBranchByDate((prev) => ({ ...prev, [date]: branchId }));
                setDirtyBranchDates((prev) => new Set(prev).add(date));
              }}
              homeBranchId={homeBranchId}
              dirtyBranchDates={dirtyBranchDates}
              onSaveBranch={saveBranch}
              allowLeaveEdit
              onSetLeave={setLeave}
              onClearLeave={clearLeave}
            />
          </div>
        )}
      </div>
    </div>
  );
};
