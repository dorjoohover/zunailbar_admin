"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

type SummaryProps = {
  salary?: number;
  costTotal?: number;
  productTotal?: number;
};

export default function EChartPie({ salary = 0, costTotal = 0, productTotal = 0 }: SummaryProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const total = salary + costTotal + productTotal;
    const hasData = total > 0;

    const data = hasData
      ? [
          { value: salary, name: "Цалин", itemStyle: { color: "#a855f7" } },
          { value: costTotal, name: "Зардал", itemStyle: { color: "#3b82f6" } },
          { value: productTotal, name: "Бүтээгдэхүүн", itemStyle: { color: "#f97316" } },
        ].filter((d) => d.value > 0)
      : [{ value: 1, name: "Мэдээлэл байхгүй" }];

    chart.setOption({
      title: {
        text: "Нийт зардлын эзлэх хувь",
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
      color: ["#a855f7", "#3b82f6", "#f97316"],
    });

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      chart.dispose();
      resizeObserver.disconnect();
    };
  }, [salary, costTotal, productTotal]);

  return <div ref={chartRef} className="w-full h-[400px] p-4" />;
}
