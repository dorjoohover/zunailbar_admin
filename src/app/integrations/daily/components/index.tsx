"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleX, Download } from "lucide-react";
import DynamicHeader from "@/components/dynamicHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { find } from "@/app/(api)";
import { fetcher } from "@/hooks/fetcher";
import { ACTION, ListType } from "@/lib/constants";
import { dateOnly, money, parseDate } from "@/lib/functions";
import { getTransactionTypeValue } from "@/lib/constants";
import {
  Branch,
  PaymentDailyBreakdownItem,
  PaymentDailySummary,
} from "@/models";
import { Api } from "@/utils/api";
import { DatePicker } from "@/shared/components/date.picker";
import { ComboBox } from "@/shared/components/combobox";
import { Modal } from "@/shared/components/modal";
import { SalarySectionNav } from "../../_components/section-nav";

type DailySummaryFilter = {
  from?: string;
  to?: string;
  branch_id?: string;
};

type DailySummaryFilterState = {
  from?: Date;
  to?: Date;
  branch_id?: string;
};

const parseDateValue = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const defaultSummary: PaymentDailySummary = {
  from: "",
  to: "",
  pre_amount: 0,
  cash_amount: 0,
  bank_amount: 0,
  total_amount: 0,
};

const normalizeReportFilter = (
  filter: DailySummaryFilterState,
): DailySummaryFilterState => {
  const from = filter.from;
  const to = filter.to;

  if (from && to && from.getTime() > to.getTime()) {
    return {
      ...filter,
      from: to,
      to: from,
    };
  }

  if (from && !to) {
    return {
      ...filter,
      to: from,
    };
  }

  if (!from && to) {
    return {
      ...filter,
      from: to,
    };
  }

  return filter;
};

export function DailySummaryPage({
  data,
  initialFilter,
  branches,
}: {
  data?: PaymentDailySummary;
  initialFilter?: DailySummaryFilter;
  branches: ListType<Branch>;
}) {
  const initialState = useMemo(
    () => ({
      from: parseDateValue(initialFilter?.from),
      to: parseDateValue(initialFilter?.to ?? initialFilter?.from),
      branch_id: initialFilter?.branch_id,
    }),
    [initialFilter],
  );
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [detailAction, setDetailAction] = useState(ACTION.DEFAULT);
  const [detailOpen, setDetailOpen] = useState(false);
  const [summary, setSummary] = useState<PaymentDailySummary>(
    data ?? defaultSummary,
  );
  const [detailRows, setDetailRows] = useState<PaymentDailyBreakdownItem[]>([]);
  const [reportFilter, setReportFilter] = useState(initialState);
  const normalizedReportFilter = useMemo(
    () => normalizeReportFilter(reportFilter),
    [reportFilter],
  );

  const getFilterParams = () => ({
    ...(normalizedReportFilter.from
      ? { from: dateOnly(normalizedReportFilter.from) }
      : {}),
    ...(normalizedReportFilter.to
      ? { to: dateOnly(normalizedReportFilter.to) }
      : {}),
    ...(normalizedReportFilter.branch_id
      ? { branch_id: normalizedReportFilter.branch_id }
      : {}),
  });

  const refresh = async () => {
    setAction(ACTION.RUNNING);
    const res = await find<any>(
      Api.payment,
      getFilterParams() as any,
      "summary",
    );
    setSummary((res.data as unknown as PaymentDailySummary) ?? defaultSummary);
    setAction(ACTION.DEFAULT);
  };

  const openBreakdown = async () => {
    setDetailOpen(true);
    setDetailRows([]);
    setDetailAction(ACTION.RUNNING);
    const res = await fetcher<PaymentDailyBreakdownItem>(
      Api.payment,
      {
        page: 0,
        limit: 500,
        ...getFilterParams(),
      } as any,
      "breakdown",
    );
    setDetailRows(res.items ?? []);
    setDetailAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    void refresh();
    setDetailOpen(false);
    setDetailRows([]);
  }, [reportFilter]);

  const clearReportFilter = () => {
    setReportFilter(initialState);
    setSummary(data ?? defaultSummary);
    setDetailOpen(false);
    setDetailRows([]);
  };

  const downloadSummary = () => {
    const rows = [
      [
        "Эхлэх огноо",
        "Дуусах огноо",
        "Салбар",
        "Урьдчилгаа",
        "Данс / карт",
        "Бэлэн",
        "Нийт",
      ],
      [
        summary.from || "-",
        summary.to || summary.from || "-",
        branches.items.find((item) => item.id === reportFilter.branch_id)
          ?.name ?? "Бүгд",
        String(summary.pre_amount ?? 0),
        String(summary.bank_amount ?? 0),
        String(summary.cash_amount ?? 0),
        String(summary.total_amount ?? 0),
      ],
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "daily_summary.csv");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const detailTotal = detailRows.reduce(
    (total, item) => total + Number(item.amount ?? 0),
    0,
  );
  const detailOrderTotal = Array.from(
    detailRows.reduce((acc, item) => {
      if (!item.order_id) return acc;
      if (!acc.has(item.order_id)) {
        acc.set(item.order_id, Number(item.order_total_amount ?? 0));
      }
      return acc;
    }, new Map<string, number>()),
  ).reduce((total, [, amount]) => total + amount, 0);
  const summaryCards = useMemo(
    () => [
      {
        label: "Урьдчилгаа",
        value: money(String(summary.pre_amount ?? 0), "₮"),
      },
      {
        label: "Данс / карт",
        value: money(String(summary.bank_amount ?? 0), "₮"),
      },
      {
        label: "Бэлэн",
        value: money(String(summary.cash_amount ?? 0), "₮"),
      },
      {
        label: "Нийт",
        value: money(String(summary.total_amount ?? 0), "₮"),
      },
    ],
    [summary],
  );

  return (
    <div>
      <DynamicHeader />

      <div className="admin-container space-y-4">
        <SalarySectionNav />

        <div className="rounded-2xl border-light bg-white p-4 shadow-light">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <label>
                <span className="filter-label">Эхлэх огноо</span>
                <DatePicker
                  mode="single"
                  value={normalizedReportFilter.from}
                  onChange={(value) =>
                    setReportFilter((prev) => ({
                      ...prev,
                      from: value as Date | undefined,
                    }))
                  }
                  pl="Эхлэх огноо"
                />
              </label>
              <label>
                <span className="filter-label">Дуусах огноо</span>
                <DatePicker
                  mode="single"
                  value={normalizedReportFilter.to}
                  onChange={(value) =>
                    setReportFilter((prev) => ({
                      ...prev,
                      to: value as Date | undefined,
                    }))
                  }
                  pl="Дуусах огноо"
                />
              </label>
              <label className="min-w-[220px]">
                <span className="filter-label">Салбар</span>
                <ComboBox
                  pl="Салбар сонгох"
                  props={{
                    name: "branch_id",
                    value: normalizedReportFilter.branch_id ?? "",
                    onChange: (value) =>
                      setReportFilter((prev) => ({
                        ...prev,
                        branch_id: value || undefined,
                      })),
                    onBlur: () => {},
                    ref: () => {},
                  }}
                  items={branches.items.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                />
              </label>
              <Button
                variant="ghost"
                onClick={clearReportFilter}
                className="bg-red-50 text-xs text-red-500 hover:bg-red-100 hover:text-red-500 lg:h-10"
              >
                <CircleX />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={refresh}
                disabled={action === ACTION.RUNNING}
              >
                Шинэчлэх
              </Button>
              <Button
                variant="ghost"
                onClick={downloadSummary}
                className="bg-green-500 text-white hover:bg-green-500/80 hover:text-white"
              >
                <Download />
                Экспорт
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-light bg-white p-4 shadow-light">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Нэгтгэл</h2>
              <p className="text-xs text-slate-500">
                {summary.from
                  ? `${summary.from}${summary.to ? ` - ${summary.to}` : ""}`
                  : "Сонгосон хугацааны борлуулалтын нэгтгэл"}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {branches.items.find(
                (item) => item.id === normalizedReportFilter.branch_id,
              )?.name ?? "Бүх салбар"}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border-light bg-white p-4 shadow-light">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Эхлэх огноо</TableHead>
                <TableHead>Дуусах огноо</TableHead>
                <TableHead>Салбар</TableHead>
                <TableHead>Урьдчилгаа</TableHead>
                <TableHead>Данс / карт</TableHead>
                <TableHead>Бэлэн</TableHead>
                <TableHead>Нийт</TableHead>
                <TableHead>Дэлгэрэнгүй</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{summary.from || "-"}</TableCell>
                <TableCell>{summary.to || summary.from || "-"}</TableCell>
                <TableCell>
                  {branches.items.find(
                    (item) => item.id === reportFilter.branch_id,
                  )?.name ?? "Бүх салбар"}
                </TableCell>
                <TableCell>
                  {money(String(summary.pre_amount ?? 0), "₮")}
                </TableCell>
                <TableCell>
                  {money(String(summary.bank_amount ?? 0), "₮")}
                </TableCell>
                <TableCell>
                  {money(String(summary.cash_amount ?? 0), "₮")}
                </TableCell>
                <TableCell className="font-bold text-slate-900">
                  {money(String(summary.total_amount ?? 0), "₮")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void openBreakdown()}
                    disabled={action === ACTION.RUNNING}
                  >
                    Дэлгэрэнгүй
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <Modal
          open={detailOpen}
          setOpen={setDetailOpen}
          maw="6xl"
          title="Борлуулалтын задрал"
          description={`${summary.from || "-"}${summary.to ? ` - ${summary.to}` : ""}${
            normalizedReportFilter.branch_id
              ? ` · ${branches.items.find((item) => item.id === normalizedReportFilter.branch_id)?.name ?? ""}`
              : ""
          }`}
        >
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Урьдчилгаа</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(summary.pre_amount ?? 0), "₮")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Данс / карт</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(summary.bank_amount ?? 0), "₮")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Бэлэн</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(summary.cash_amount ?? 0), "₮")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Нийт</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(summary.total_amount ?? 0), "₮")}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Огноо</TableHead>
                  <TableHead>Салбар</TableHead>
                  <TableHead>Артист</TableHead>
                  <TableHead>Үйлчилгээ</TableHead>
                  <TableHead>Төлбөр</TableHead>
                  <TableHead>Төлсөн дүн</TableHead>
                  <TableHead>Нийт үнэ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailAction === ACTION.RUNNING ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      Уншиж байна
                    </TableCell>
                  </TableRow>
                ) : detailRows.length ? (
                  detailRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {parseDate(item.order_date ?? "", false)}
                      </TableCell>
                      <TableCell>{item.branch_name ?? "-"}</TableCell>
                      <TableCell>{item.artist_names ?? "-"}</TableCell>
                      <TableCell>{item.service_names ?? "-"}</TableCell>
                      <TableCell>
                        {[
                          Number(item.pre_amount ?? 0) > 0 ? "Урьдчилгаа" : "",
                          Number(item.paid_amount ?? 0) > 0
                            ? (getTransactionTypeValue[
                                (String(
                                  item.transaction_type ?? "",
                                ).toUpperCase() ||
                                  "BANK") as keyof typeof getTransactionTypeValue
                              ] ?? "Дансаар")
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" + ") || "-"}
                      </TableCell>
                      <TableCell>
                        {money(String(item.amount ?? 0), "₮")}
                      </TableCell>
                      <TableCell>
                        {money(String(item.order_total_amount ?? 0), "₮")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      Задралын мэдээлэл алга байна
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-slate-900">
                    Нийт
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {money(String(detailTotal), "₮")}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {money(String(detailOrderTotal), "₮")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Modal>
      </div>
    </div>
  );
}
