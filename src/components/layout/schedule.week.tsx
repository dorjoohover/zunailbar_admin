"use client";
import { ScheduleDayData } from "@/lib/constants";
import { EmployeeStatus } from "@/lib/enum";
import { DayScheduleColumn } from "./schedule.table.column";
import { getDayName } from "@/lib/functions";

// date (YYYY-MM-DD) -> тухайн өдрийн хуваарь. Хуучин `AdminScheduleManager`-с
// ялгаатай нь энд түлхүүр нь абстракт 7 хоногийн индекс (0-6) биш бодит огноо.
export interface WeekScheduleData {
  [date: string]: ScheduleDayData;
}

export interface WeekBranchOption {
  id: string;
  name: string;
}

interface AdminWeekScheduleManagerProps {
  /** 7 бодит огноо, Даваагаас эхэлнэ (YYYY-MM-DD). */
  weekDates: string[];
  schedule: WeekScheduleData;
  loading: boolean;
  allowFinishTimeEdit?: boolean;
  onUpdateDay: (date: string, day: ScheduleDayData, action: number) => void;
  /** Артистыг тухайн өдрөөр өөр салбарт шилжүүлэх сонголт (заавал биш). */
  branches?: WeekBranchOption[];
  branchByDate?: Record<string, string | undefined>;
  onBranchChange?: (date: string, branchId: string | undefined) => void;
  homeBranchId?: string;
  /** Салбар нь өөрчлөгдөөд хараахан хадгалагдаагүй өдрүүд. */
  dirtyBranchDates?: Set<string>;
  onSaveBranch?: (date: string) => void;
  /** Амралт тавих/цуцлах боломжтой эсэх (өгөхгүй бол toggle харагдахгүй). */
  allowLeaveEdit?: boolean;
  onSetLeave?: (date: string, status: EmployeeStatus) => void;
  onClearLeave?: (date: string) => void;
  leaveOptions?: { status: EmployeeStatus; label: string }[];
}

export function AdminWeekScheduleManager({
  weekDates,
  schedule,
  loading,
  allowFinishTimeEdit = true,
  onUpdateDay,
  branches,
  branchByDate,
  onBranchChange,
  homeBranchId,
  dirtyBranchDates,
  onSaveBranch,
  allowLeaveEdit = false,
  onSetLeave,
  onClearLeave,
  leaveOptions,
}: AdminWeekScheduleManagerProps) {
  const copyPrevious = (dateIndex: number) => {
    if (dateIndex === 0) return;
    const prevDate = weekDates[dateIndex - 1];
    const prev = schedule[prevDate] || { times: [], finish_time: null };
    onUpdateDay(
      weekDates[dateIndex],
      { times: [...prev.times], finish_time: prev.finish_time ?? null },
      0,
    );
    if (onBranchChange) {
      onBranchChange(weekDates[dateIndex], branchByDate?.[prevDate]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const d = new Date(`${date}T00:00:00`);
          const label = `${getDayName(d.getDay())} ${date.slice(5)}`;
          return (
            <div key={date} className="flex flex-col gap-2">
              {branches && branches.length > 0 && (
                <div className="flex flex-col gap-1">
                  <select
                    value={branchByDate?.[date] ?? homeBranchId ?? ""}
                    onChange={(e) => onBranchChange?.(date, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 focus:border-teal-500 focus:outline-none"
                    title="Тухайн өдөр ажиллах салбар"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id === homeBranchId ? `${b.name} (үндсэн)` : b.name}
                      </option>
                    ))}
                  </select>
                  {dirtyBranchDates?.has(date) && (
                    <button
                      onClick={() => onSaveBranch?.(date)}
                      disabled={loading}
                      className="w-full rounded-lg bg-teal-500 px-2 py-1.5 text-xs text-white hover:bg-teal-600 disabled:opacity-50"
                    >
                      Хадгалах
                    </button>
                  )}
                </div>
              )}
              <DayScheduleColumn
                loading={loading}
                dayName={label}
                dayIndex={index}
                allowFinishTimeEdit={allowFinishTimeEdit}
                day={schedule[date] || { times: [], finish_time: null }}
                onUpdateDay={(value, action) => onUpdateDay(date, value, action)}
                onCopyPrevious={index > 0 ? () => copyPrevious(index) : undefined}
                allowLeaveEdit={allowLeaveEdit}
                onSetLeave={
                  onSetLeave ? (status) => onSetLeave(date, status) : undefined
                }
                onClearLeave={
                  onClearLeave ? () => onClearLeave(date) : undefined
                }
                leaveOptions={leaveOptions}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
