import { useMemo } from "react";
import { DayScheduleColumn } from "./schedule.table.column";
interface AdminScheduleManagerProps {
  schedule: {
    [day: number]: string[];
  };
  loading: boolean;
  onUpdateSchedule: (dayIndex: number, times: string[], action: number) => void;
}

export function AdminScheduleManager({
  schedule,
  loading,
  onUpdateSchedule,
}: AdminScheduleManagerProps) {
  const dayNames = [
    "Даваа",
    "Мягмар",
    "Лхагва",
    "Пүрэв",
    "Баасан",
    "Бямба",
    "Ням",
  ];
  // Ашиглах нь
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      days.push({
        dayName: dayNames[i],
      });
    }
    return days;
  }, []);
  const copyPreviousDay = (dayIndex: number) => {
    if (dayIndex === 0) return;
    const previousDaySchedule = schedule[dayIndex - 1] || [];
    onUpdateSchedule(dayIndex, [...previousDaySchedule], 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => (
          <DayScheduleColumn
            loading={loading}
            key={index}
            dayName={day.dayName}
            dayIndex={index}
            times={schedule[index] || []}
            onUpdateTimes={(times, action) =>
              onUpdateSchedule(index, times, action)
            }
            onCopyPrevious={
              index > 0 ? () => copyPreviousDay(index) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
