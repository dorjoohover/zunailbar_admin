"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

type CategoryItem = {
  category: string;
  total: number;
};

type Props = {
  categories?: CategoryItem[];
};

const COLORS = [
  "#f97316", "#3b82f6", "#a855f7", "#10b981", "#f43f5e",
  "#eab308", "#06b6d4", "#84cc16", "#ec4899", "#6366f1",
];

export default function EChartPie({ categories = [] }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const filtered = categories.filter((c) => c.total > 0);
    const hasData = filtered.length > 0;

    const data = hasData
      ? filtered.map((c, i) => ({
          value: c.total,
          name: c.category,
          itemStyle: { color: COLORS[i % COLORS.length] },
        }))
      : [{ value: 1, name: "Мэдээлэл байхгүй" }];

    chart.setOption({
      title: {
        text: "Зардлын ангиллаар",
        left: "left",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "item",
        formatter: (p: any) =>
          `${p.marker}${p.name}: ${Number(p.value).toLocaleString()}₮ (${p.percent}%)`,
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "middle",
        formatter: (name: string) => {
          const item = filtered.find((c) => c.category === name);
          return item ? `${name}: ${Number(item.total).toLocaleString()}₮` : name;
        },
      },
      series: [
        {
          name: "Зардал",
          type: "pie",
          radius: ["40%", "65%"],
          center: ["60%", "50%"],
          data,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: hasData,
            formatter: "{b}: {d}%",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
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
  }, [categories]);

  return <div ref={chartRef} className="w-full h-[400px] p-4" />;
}
