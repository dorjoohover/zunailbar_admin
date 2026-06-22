"use client";

import DynamicHeader from "@/components/dynamicHeader";
import EChart from "./eChart";
import EChartPie from "./eChartPie";
import {
  Coins,
  PackageOpen,
  PiggyBank,
  Receipt,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Branch } from "@/models";
import { Api, API } from "@/utils/api";
import { money, parseDate } from "@/lib/functions";
import { DatePicker } from "@/shared/components/date.picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { showToast } from "@/shared/components/showToast";
import { create, findRaw } from "@/app/(api)";

type StatNumbers = {
  orderCount: number;
  revenue: number;
  expense: number;
  costTotal: number;
  productTotal: number;
  salary: number;
  profit: number;
  profitPercent: number;
};

const ALL_BRANCHES = "__ALL__";

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const todayDate = () => new Date();

// Backend `/^\d{4}-\d{2}-\d{2}$/` regex-тэй яг тааруулна. `parseDate` нь "yyyy/MM/dd" буцаадаг тул хувиргана.
const toYMD = (d?: Date) => {
  if (!d) return "";
  return parseDate(d, false).replace(/\//g, "-");
};

export const DashboardClient = ({ branches }: { branches: Branch[] }) => {
  const [branchId, setBranchId] = useState<string>(ALL_BRANCHES);
  const [startDate, setStartDate] = useState<Date | undefined>(monthStart());
  const [endDate, setEndDate] = useState<Date | undefined>(todayDate());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatNumbers>({
    orderCount: 0,
    revenue: 0,
    expense: 0,
    costTotal: 0,
    productTotal: 0,
    salary: 0,
    profit: 0,
    profitPercent: 0,
  });
  const [chartItems, setChartItems] = useState<any[]>([]);

  const fromYMD = useMemo(() => toYMD(startDate), [startDate]);
  const toYMDValue = useMemo(() => toYMD(endDate), [endDate]);
  const [backfilling, setBackfilling] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const backfillSnapshots = async () => {
    if (backfilling) return;
    setBackfilling(true);
    try {
      const res = await create<{
        start_date?: string;
        end_date?: string;
      }>(
        Api.order,
        {
          start_date: fromYMD || undefined,
          end_date: toYMDValue || undefined,
        },
        "dashboard/backfill",
      );
      if (res.success) {
        const payload = (res.data as any)?.payload ?? res.data ?? {};
        const count = payload?.count ?? 0;
        showToast(
          "success",
          `Snapshot шинэчлэгдлээ (${count} захиалга боловсруулагдсан)`,
        );
        setRefreshKey((k) => k + 1);
      } else {
        showToast("info", res.error ?? "Snapshot шинэчлэхэд алдаа гарлаа");
      }
    } catch (err) {
      showToast("info", (err as Error).message ?? "Алдаа гарлаа");
    } finally {
      setBackfilling(false);
    }
  };

  useEffect(() => {
    if (!fromYMD || !toYMDValue) return;
    const branchFilter =
      branchId && branchId !== ALL_BRANCHES ? branchId : undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          start_date: fromYMD,
          end_date: toYMDValue,
        };
        if (branchFilter) params.branch_id = branchFilter;

        const res = await findRaw<{
          items: any[];
          summary: {
            revenue: number;
            expense: number;
            cost_total: number;
            product_total: number;
            salary: number;
            profit: number;
            order_count: number;
            profit_percent: number;
          };
        }>(Api.dashboard, params);

        if (cancelled) return;

        const summary = res.data?.summary ?? {
          revenue: 0,
          expense: 0,
          cost_total: 0,
          product_total: 0,
          salary: 0,
          profit: 0,
          order_count: 0,
          profit_percent: 0,
        };
        setChartItems(res.data?.items ?? []);
        setStats({
          orderCount: Number(summary.order_count ?? 0),
          revenue: Number(summary.revenue ?? 0),
          expense: Number(summary.expense ?? 0),
          costTotal: Number(summary.cost_total ?? 0),
          productTotal: Number(summary.product_total ?? 0),
          salary: Number(summary.salary ?? 0),
          profit: Number(summary.profit ?? 0),
          profitPercent: Number(summary.profit_percent ?? 0),
        });
      } catch (err) {
        if (!cancelled) {
          showToast("info", (err as Error).message ?? "Алдаа гарлаа");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [branchId, fromYMD, toYMDValue, refreshKey]);

  return (
    <section>
      <DynamicHeader />
      <div className="admin-container space-y-0">
        <div className="space-y-4 py-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-semibold">Aдмин ерөнхий хянах самбар</h1>
            <div className="flex flex-wrap items-end gap-2">
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger className="w-44 bg-white h-10">
                  <SelectValue placeholder="Салбар сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BRANCHES}>Бүх салбар</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DatePicker
                name="Эхлэх огноо"
                pl="Эхлэх огноо"
                mode="single"
                value={startDate}
                onChange={(v) => setStartDate(v as Date | undefined)}
              />
              <DatePicker
                name="Дуусах огноо"
                pl="Дуусах огноо"
                mode="single"
                value={endDate}
                onChange={(v) => setEndDate(v as Date | undefined)}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2"
                onClick={backfillSnapshots}
                disabled={backfilling}
                title="Хуучин захиалга/зардлын мэдээллээс dashboard snapshot-ыг (огноо × салбар) дахин үүсгэх"
              >
                <RefreshCw
                  className={`size-4 ${backfilling ? "animate-spin" : ""}`}
                />
                {backfilling ? "Шинэчилж байна..." : "Snapshot шинэчлэх"}
              </Button>
            </div>
          </div>
          <div className="w-full grid grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              icon={<Wallet className="size-5 text-primary" />}
              iconBg="bg-orange-100"
              title="Нийт орлого"
              value={loading ? "..." : `${money(String(stats.revenue))}₮`}
              href="/orders"
            />
            <StatCard
              icon={<Receipt className="size-5 text-primary" />}
              iconBg="bg-blue-100"
              title="Нийт зардал"
              value={loading ? "..." : `${money(String(+stats.costTotal + +stats.productTotal))}₮`}
              href="/products/cost"
            />
            <StatCard
              icon={<Coins className="size-5 text-primary" />}
              iconBg="bg-rose-100"
              title="Нийт цалин"
              value={loading ? "..." : `${money(String(stats.salary))}₮`}
              href="/employees"
            />
            <StatCard
              icon={<PiggyBank className="size-5 text-primary" />}
              iconBg="bg-green-100"
              title="Нийт ашиг"
              value={loading ? "..." : `${money(String(stats.profit))}₮`}
            />
         
            <StatCard
              icon={<TrendingUp className="size-5 text-primary" />}
              iconBg="bg-emerald-100"
              title="Ашгийн хувь"
              value={loading ? "..." : `${stats.profitPercent}%`}
            />
          </div>
        </div>
        <div className="space-y-4 py-4 border-b">
          <h1 className="font-semibold">График үзүүлэлтүүд</h1>
          <div className="double-col">
            <div className="bg-white rounded-2xl border border-slate-200">
              <EChart items={chartItems} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200">
              <EChartPie
                salary={stats.salary}
                costTotal={stats.costTotal}
                productTotal={stats.productTotal}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({
  icon,
  iconBg,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  href?: string;
}) => {
  const inner = (
    <div className="w-full text-primary hover:text-white space-x-4 bg-white flex justify-between border border-slate-200 rounded-2xl h-full p-6 cursor-pointer hover:bg-primary duration-150">
      <div
        className={`size-14 ${iconBg} rounded-xl flex-center aspect-square`}
      >
        {icon}
      </div>
      <div className="flex flex-col size-full justify-between text-left">
        <h1 className="font-medium text-sm flex items-center gap-2">{title}</h1>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }
  return inner;
};
