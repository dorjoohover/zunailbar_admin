"use client";

import { ChartConfig } from "@/components/ui/chart";
import DynamicHeader from "@/components/dynamicHeader";
import EChart from "./components/eChart";
import EChartPie from "./components/eChartPie";
import { ClipboardCheck, Milk, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const chartData = [
  { month: "January", manicure: 186, pedicure: 80 },
  { month: "February", manicure: 305, pedicure: 200 },
  { month: "March", manicure: 237, pedicure: 120 },
  { month: "April", manicure: 73, pedicure: 190 },
  { month: "May", manicure: 209, pedicure: 130 },
  { month: "June", manicure: 214, pedicure: 140 },
];

const chartConfig = {
  manicure: {
    label: "Manicure",
    color: "#2563eb",
  },
  pedicure: {
    label: "Pedicure",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <section>
      <DynamicHeader />
      <div className="admin-container space-y-0">
        <div className="space-y-4 py-4 border-b">
          <h1 className="font-semibold">Aдмин ерөнхий хянах самбар</h1>
          <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={"/employees"} className="w-full text-primary hover:text-white space-x-4 bg-white flex justify-between border border-slate-200 rounded-2xl h-full p-6 cursor-pointer hover:bg-primary duration-150">
              <div className="size-14 bg-orange-100 rounded-xl flex-center aspect-square">
                <ClipboardCheck className="size-5 text-primary" />
              </div>
              <div className="flex flex-col size-full justify-between text-left">
                <h1 className="font-medium text-sm flex items-center gap-2">Нийт захиалга</h1>
                <h3 className="text-2xl font-bold">number</h3>
              </div>
            </Link>
            <Link href={"/users"} className="w-full text-primary hover:text-white space-x-4 bg-white flex justify-between border border-slate-200 rounded-2xl h-full p-6 cursor-pointer hover:bg-primary duration-150">
              <div className="size-14 bg-blue-100 rounded-xl flex-center aspect-square">
                <UsersRound className="size-5 text-primary" />
              </div>
              <div className="flex flex-col size-full justify-between text-left">
                <h1 className="font-medium text-sm flex items-center gap-2">Нийт хэрэглэгч</h1>
                <h3 className="text-2xl font-bold">number</h3>
              </div>
            </Link>
            <Link href={"/products"} className="w-full text-primary hover:text-white space-x-4 bg-white flex justify-between border border-slate-200 rounded-2xl h-full p-6 cursor-pointer hover:bg-primary duration-150">
              <div className="size-14 bg-rose-100 rounded-xl flex-center aspect-square">
                <Milk className="size-5 text-primary" />
              </div>
              <div className="flex flex-col size-full justify-between text-left">
                <h1 className="font-medium text-sm flex items-center gap-2">Нийт бүтээгдэхүүн</h1>
                <h3 className="text-2xl font-bold">number</h3>
              </div>
            </Link>
            <Link href={"/employees"} className="w-full text-primary hover:text-white space-x-4 bg-white flex justify-between border border-slate-200 rounded-2xl h-full p-6 cursor-pointer hover:bg-primary duration-150">
              <div className="size-14 bg-green-100 rounded-xl flex-center aspect-square">
                {/* <Money className="size-5 text-primary" /> */}
                <span className="text-2xl text-primary">₮</span>
              </div>
              <div className="flex flex-col size-full justify-between text-left">
                <h1 className="font-medium text-sm flex items-center gap-2">Нийт орлого</h1>
                <h3 className="text-2xl font-bold">money</h3>
              </div>
            </Link>
          </div>
        </div>
        <div className="space-y-4 py-4 border-b">
          <h1 className="font-semibold">График үзүүлэлтүүд</h1>
          <div className="double-col">
            <div className="bg-white rounded-2xl border border-slate-200">
              <EChart />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200">
              <EChartPie />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="admin-container grid grid-cols-2 gap-x-8">
        <div className="p-8 py-6 rounded-lg bg-white shadow-md space-y-8">
          <div className="space-y-1">
            <h1 className="font-semibold text-lg">Жишээ чарт</h1>
            <p className="text-sm text-slate-600">Lorem ipsum dolor sit.</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="manicure" fill="oklch(70.4% 0.04 256.788)" radius={4} />
              <Bar dataKey="pedicure" fill="oklch(37.2% 0.044 257.287)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div> */}
    </section>
  );
}
