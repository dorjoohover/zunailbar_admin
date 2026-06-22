"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

type SnapshotItem = {
  date: string;
  revenue: number;
  expense: number;
  salary: number;
};

type Props = {
  items?: SnapshotItem[];
};

function formatMonth(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function groupByMonth(items: SnapshotItem[]) {
  const map = new Map<string, { revenue: number; expense: number; salary: number }>();
  for (const item of items) {
    const key = formatMonth(item.date);
    const prev = map.get(key) ?? { revenue: 0, expense: 0, salary: 0 };
    map.set(key, {
      revenue: prev.revenue + Number(item.revenue ?? 0),
      expense: prev.expense + Number(item.expense ?? 0),
      salary: prev.salary + Number(item.salary ?? 0),
    });
  }
  const keys = Array.from(map.keys()).sort();
  return {
    labels: keys,
    revenue: keys.map((k) => map.get(k)!.revenue),
    expense: keys.map((k) => map.get(k)!.expense),
    salary: keys.map((k) => map.get(k)!.salary),
  };
}

export default function EChart({ items = [] }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    const { labels, revenue, expense, salary } = groupByMonth(items);

    const hasData = labels.length > 0;
    const xLabels = hasData ? labels : ["Мэдээлэл байхгүй"];

    chart.setOption({
      title: {
        text: "Орлого / Зардал",
        left: "left",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any[]) =>
          params
            .map((p: any) => `${p.marker}${p.seriesName}: ${Number(p.value).toLocaleString()}₮`)
            .join("<br/>"),
      },
      legend: {
        data: ["Орлого", "Зардал", "Цалин"],
        top: 0,
        right: 0,
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: xLabels,
        axisLabel: { rotate: labels.length > 6 ? 30 : 0 },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (v: number) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v),
        },
      },
      series: [
        {
          name: "Орлого",
          type: "bar",
          data: hasData ? revenue : [],
          itemStyle: { color: "#f97316" },
        },
        {
          name: "Зардал",
          type: "bar",
          data: hasData ? expense : [],
          itemStyle: { color: "#3b82f6" },
        },
        {
          name: "Цалин",
          type: "bar",
          data: hasData ? salary : [],
          itemStyle: { color: "#a855f7" },
        },
      ],
    });

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      chart.dispose();
      resizeObserver.disconnect();
    };
  }, [items]);

  return <div ref={chartRef} className="w-full h-[400px] p-4" />;
}
