import { useEffect, useState } from "react";
import { Plus, Copy, RotateCcw, Edit3, Check } from "lucide-react";
import { TimeSlotPill } from "./schedule.table.time.slot";
import { AddTimeModal } from "./schedule.add.time";
import { LoaderMini } from "../loader";

interface DayScheduleColumnProps {
  dayName: string;
  dayIndex: number;
  loading: boolean;
  times: string[];
  onUpdateTimes: (times: string[], action: number) => void;
  onCopyPrevious?: () => void;
}

export function DayScheduleColumn({
  dayName,
  loading,
  times,
  onUpdateTimes,
  onCopyPrevious,
}: DayScheduleColumnProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [send, setSend] = useState(false);
  const [showAddTime, setShowAddTime] = useState(false);

  // All possible full-hour times from 07:00 to 22:00
  const allAvailableTimes = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const toggleTime = (time: string) => {
    if (times.includes(time)) {
      onUpdateTimes(
        times.filter((t) => t !== time),
        1
      );
    } else {
      // Add and sort
      const newTimes = [...times, time].sort();
      onUpdateTimes(newTimes, 1);
    }
  };

  const addTime = (time: string) => {
    if (!times.includes(time)) {
      const newTimes = [...times, time].sort();
      onUpdateTimes(newTimes, 0);
    }
  };

  const resetDay = () => {
    onUpdateTimes([], 0);
  };

  const availableTimesToAdd = allAvailableTimes.filter(
    (t) => !times.includes(t)
  );

  useEffect(() => {
    if (send) {
      onUpdateTimes([], 2);
      setSend(false);
    }
  }, [send]);

  return (
    <div className="flex flex-col border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-slate-200">
        <div className="text-slate-800 mb-1 text-sm">{dayName}</div>
        <div className="text-teal-600 text-xs mt-1">
          {times.length} цаг идэвхтэй
        </div>
      </div>

      {/* Time slots */}
      <div className="flex-1 space-y-2 mb-4 min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoaderMini />
          </div>
        ) : isEditMode ? (
          // Edit mode: show all possible times as toggles
          <div className="space-y-1.5">
            {allAvailableTimes.map((time) => (
              <button
                key={time}
                onClick={() => toggleTime(time)}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                  times.includes(time)
                    ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        ) : (
          // View mode: show only active times
          <>
            {times.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-8">
                Цаг оруулаагүй байна
              </div>
            ) : (
              times.map((time) => (
                <TimeSlotPill
                  key={time}
                  time={time}
                  onRemove={() => toggleTime(time)}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-3 border-t border-slate-200">
        {/* Edit mode toggle */}
        <button
          onClick={() => {
            if (isEditMode) setSend(true);
            setIsEditMode(!isEditMode);
          }}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
            isEditMode
              ? "bg-teal-500 hover:bg-teal-600 text-white"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          {isEditMode ? <Check size={14} /> : <Edit3 size={14} />}
          <span>{isEditMode ? "Дуусгах" : "Засах"}</span>
        </button>

        {!isEditMode && (
          <>
            {/* Add time */}
            {availableTimesToAdd.length > 0 && (
              <button
                onClick={() => setShowAddTime(true)}
                className="w-full flex text-xs items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
              >
                <Plus size={14} />
                <span>Цаг нэмэх</span>
              </button>
            )}

            {/* Copy previous day */}
            {onCopyPrevious && (
              <button
                onClick={onCopyPrevious}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] whitespace-nowrap transition-colors"
                title="Өмнөх өдрийн хуваарь хуулах"
              >
                <Copy size={12} />
                <span>Өмнөхийг хуулах</span>
              </button>
            )}

            {/* Reset */}
            {times.length > 0 && (
              <button
                onClick={resetDay}
                className="w-full flex items-center text-sm justify-center gap-2 px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-xs transition-colors"
              >
                <RotateCcw size={12} />
                <span>Цэвэрлэх</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Add Time Modal */}
      {showAddTime && (
        <AddTimeModal
          availableTimes={availableTimesToAdd}
          onSelectTime={addTime}
          onClose={() => setShowAddTime(false)}
        />
      )}
    </div>
  );
}
