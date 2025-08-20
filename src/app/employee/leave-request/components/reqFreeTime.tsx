"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Calendar04 from "@/components/calendar-04";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

function RequestFreeTime() {
  const [tab, setTab] = useState<"day" | "hour">("day");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const times = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

  const toggleTime = (time: string) => {
    setSelectedTimes(
      (prev) =>
        prev.includes(time)
          ? prev.filter((t) => t !== time) // дарсан бол арилгана
          : [...prev, time] // эс бөгөөс нэмнэ
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="space-y-5 w-full h-full">
        <div className="flex overflow-hidden rounded-2xl ring ring-gray-200">
          <Button variant={tab === "day" ? "default" : "outline"} onClick={() => setTab("day")} className={cn(tab === "day" ? "default" : "bg-slate-100", "flex-1 rounded-none border-none")}>
            Өдрөөр
          </Button>
          <Button variant={tab === "hour" ? "default" : "outline"} onClick={() => setTab("hour")} className={cn(tab === "hour" ? "default" : "bg-slate-100", "flex-1 rounded-none border-none")}>
            Цагаар
          </Button>
        </div>

        {/* Tab content */}
        {tab === "day" && (
          <div className="space-y-5">
            <h4 className="text-sm font-semibold hidden lg:block">Чөлөө авах хүсэлт (Өдрөөр)</h4>
            <Calendar04 />
          </div>
        )}

        {tab === "hour" && (
          <div className="space-y-5">
            <h4 className="text-sm font-semibold hidden lg:block">Чөлөө авах хүсэлт (Цагаар)</h4>
            <Calendar selected={date} onSelect={setDate} mode="single" className="w-full bg-white rounded-2xl border" />

            <div className="grid grid-cols-3 gap-2">
              {times.map((time) => (
                <Button key={time} type="button" variant={selectedTimes.includes(time) ? "primary" : "outline"} onClick={() => toggleTime(time)}>
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Textarea rows={7} placeholder="Дэлгэрэнгүй хүсэлт..." />
      <Button className="w-full">Илгээх</Button>
    </div>
  );
}

export default RequestFreeTime;
