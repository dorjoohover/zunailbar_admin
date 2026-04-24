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

type DailySummaryRow = {
  date: string;
  branch_id?: string;
  branch_name: string;
  pre_amount: number;
  bank_amount: number;
  card_amount: number;
  cash_amount: number;
  total_amount: number;
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
  card_amount: 0,
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

const numberValue = (value?: number) => Number(value ?? 0);

const getDateKey = (value?: Date | string) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
      return trimmed.replaceAll("/", "-");
    }

    const normalized = parseDate(trimmed, false).replaceAll("/", "-");
    if (normalized) return normalized;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateOnly(date);
};

const getDateLabel = (value?: Date | string) => {
  const key = getDateKey(value);
  return key ? key.replaceAll("-", "/") : "";
};

const getDateRangeKeys = (from?: string, to?: string) => {
  if (!from && !to) return [];

  const startKey = from ?? to;
  const endKey = to ?? from;
  if (!startKey || !endKey) return [];

  const start = new Date(startKey);
  const end = new Date(endKey);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const current = new Date(start);
  const dates: string[] = [];

  while (current <= end) {
    dates.push(dateOnly(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const getPaymentTypeLabel = (value?: string) =>
  getTransactionTypeValue[
    (String(value ?? "").toUpperCase() ||
      "BANK") as keyof typeof getTransactionTypeValue
  ] ?? "Дансаар";

const isCashPayment = (value?: string) =>
  String(value ?? "").toUpperCase() === "CASH";

const isCardPayment = (value?: string) =>
  String(value ?? "").toUpperCase() === "CARD";

const paymentAmount = (amount?: number, label?: string) => {
  const value = numberValue(amount);
  if (value <= 0) return "-";
  const formatted = money(String(value), "₮");
  return label ? `${label} · ${formatted}` : formatted;
};

const rewardAmount = (amount?: number, label?: string) => {
  const value = numberValue(amount);
  if (value <= 0) return "-";
  const formatted = `-${money(String(value), "₮")}`;
  return label ? `${label} · ${formatted}` : formatted;
};

const isSameDailyRow = (
  item: PaymentDailyBreakdownItem,
  row: DailySummaryRow,
) =>
  getDateKey(item.order_date) === row.date &&
  (!row.branch_id || item.branch_id === row.branch_id);

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
  const [allDetailRows, setAllDetailRows] = useState<
    PaymentDailyBreakdownItem[]
  >([]);
  const [detailRows, setDetailRows] = useState<PaymentDailyBreakdownItem[]>([]);
  const [selectedDailyRow, setSelectedDailyRow] = useState<DailySummaryRow>();
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
    const filterParams = getFilterParams();
    const [summaryRes, breakdownRes] = await Promise.all([
      find<any>(Api.payment, filterParams as any, "summary"),
      fetcher<PaymentDailyBreakdownItem>(
        Api.payment,
        {
          page: 0,
          limit: 500,
          ...filterParams,
        } as any,
        "breakdown",
      ),
    ]);

    const items = breakdownRes.items ?? [];
    setSummary(
      (summaryRes.data as unknown as PaymentDailySummary) ?? defaultSummary,
    );
    setAllDetailRows(items);
    if (selectedDailyRow) {
      setDetailRows(items.filter((item) => isSameDailyRow(item, selectedDailyRow)));
    }
    setAction(ACTION.DEFAULT);
  };

  const openBreakdown = (row: DailySummaryRow) => {
    setSelectedDailyRow(row);
    setDetailOpen(true);
    setDetailRows(allDetailRows.filter((item) => isSameDailyRow(item, row)));
    setDetailAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    void refresh();
    setDetailOpen(false);
    setDetailRows([]);
    setSelectedDailyRow(undefined);
  }, [reportFilter]);

  const clearReportFilter = () => {
    setReportFilter(initialState);
    setSummary(data ?? defaultSummary);
    setAllDetailRows([]);
    setDetailOpen(false);
    setDetailRows([]);
    setSelectedDailyRow(undefined);
  };

  const downloadSummary = () => {
    const rows = [
      [
        "Огноо",
        "Салбар",
        "Урьдчилгаа",
        "Данс",
        "Карт",
        "Бэлэн",
        "Нийт",
      ],
      ...dailyRows.map((row) => [
        row.date,
        row.branch_name,
        String(row.pre_amount ?? 0),
        String(row.bank_amount ?? 0),
        String(row.card_amount ?? 0),
        String(row.cash_amount ?? 0),
        String(row.total_amount ?? 0),
      ]),
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

  const dailyRows = useMemo(() => {
    const grouped = new Map<string, DailySummaryRow>();
    const fallbackBranchName =
      branches.items.find(
        (item) => item.id === normalizedReportFilter.branch_id,
      )?.name ?? "Бүх салбар";

    for (const item of allDetailRows) {
      const date = getDateKey(item.order_date);
      if (!date) continue;

      const current = grouped.get(date) ?? {
        date,
        branch_id: normalizedReportFilter.branch_id,
        branch_name: fallbackBranchName,
        pre_amount: 0,
        bank_amount: 0,
        card_amount: 0,
        cash_amount: 0,
        total_amount: 0,
      };
      const paidAmount = numberValue(item.paid_amount);

      current.pre_amount += numberValue(item.pre_amount);
      current.total_amount += numberValue(item.amount);
      if (paidAmount > 0 && isCashPayment(item.transaction_type)) {
        current.cash_amount += paidAmount;
      } else if (paidAmount > 0 && isCardPayment(item.transaction_type)) {
        current.card_amount += paidAmount;
      } else {
        current.bank_amount += paidAmount;
      }

      grouped.set(date, current);
    }

    const rangeKeys = getDateRangeKeys(summary.from, summary.to);
    const rows = (rangeKeys.length ? rangeKeys : [...grouped.keys()])
      .map(
        (date) =>
          grouped.get(date) ?? {
            date,
            branch_id: normalizedReportFilter.branch_id,
            branch_name: fallbackBranchName,
            pre_amount: 0,
            bank_amount: 0,
            card_amount: 0,
            cash_amount: 0,
            total_amount: 0,
          },
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    if (rows.length) return rows;

    return [
      {
        date: summary.from || "-",
        branch_id: normalizedReportFilter.branch_id,
        branch_name: fallbackBranchName,
        pre_amount: numberValue(summary.pre_amount),
        bank_amount: numberValue(summary.bank_amount),
        card_amount: numberValue(summary.card_amount),
        cash_amount: numberValue(summary.cash_amount),
        total_amount: numberValue(summary.total_amount),
      },
    ];
  }, [allDetailRows, branches.items, normalizedReportFilter.branch_id, summary]);

  const detailSummary = detailRows.reduce(
    (acc, item) => {
      const paidAmount = numberValue(item.paid_amount);
      acc.pre_amount += numberValue(item.pre_amount);
      acc.discount_amount += numberValue(item.discount_amount);
      acc.total_amount += numberValue(item.amount);
      if (paidAmount > 0 && isCashPayment(item.transaction_type)) {
        acc.cash_amount += paidAmount;
      } else if (paidAmount > 0 && isCardPayment(item.transaction_type)) {
        acc.card_amount += paidAmount;
      } else {
        acc.bank_amount += paidAmount;
      }
      return acc;
    },
    {
      pre_amount: 0,
      discount_amount: 0,
      bank_amount: 0,
      card_amount: 0,
      cash_amount: 0,
      total_amount: 0,
    },
  );
  const summaryCards = useMemo(
    () => [
      {
        label: "Урьдчилгаа",
        value: money(String(summary.pre_amount ?? 0), "₮"),
      },
      {
        label: "Данс",
        value: money(String(summary.bank_amount ?? 0), "₮"),
      },
      {
        label: "Карт",
        value: money(String(summary.card_amount ?? 0), "₮"),
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
                <TableHead>Огноо</TableHead>
                <TableHead>Салбар</TableHead>
                <TableHead>Урьдчилгаа</TableHead>
                <TableHead>Данс</TableHead>
                <TableHead>Карт</TableHead>
                <TableHead>Бэлэн</TableHead>
                <TableHead>Нийт</TableHead>
                <TableHead>Дэлгэрэнгүй</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyRows.map((row) => (
                <TableRow key={`${row.date}-${row.branch_id ?? "all"}`}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.branch_name}</TableCell>
                  <TableCell>
                    {money(String(row.pre_amount ?? 0), "₮")}
                  </TableCell>
                  <TableCell>
                    {money(String(row.bank_amount ?? 0), "₮")}
                  </TableCell>
                  <TableCell>
                    {money(String(row.card_amount ?? 0), "₮")}
                  </TableCell>
                  <TableCell>
                    {money(String(row.cash_amount ?? 0), "₮")}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">
                    {money(String(row.total_amount ?? 0), "₮")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openBreakdown(row)}
                      disabled={action === ACTION.RUNNING}
                    >
                      Дэлгэрэнгүй
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Modal
          open={detailOpen}
          setOpen={setDetailOpen}
          maw="6xl"
          title="Борлуулалтын задрал"
          description={`${selectedDailyRow?.date ?? summary.from ?? "-"}${
            selectedDailyRow?.branch_name ? ` · ${selectedDailyRow.branch_name}` : ""
          }`}
        >
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Урьдчилгаа</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(detailSummary.pre_amount ?? 0), "₮")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Урамшуулал</p>
                <p className="text-sm font-semibold text-rose-600">
                  {rewardAmount(detailSummary.discount_amount)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Данс</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(detailSummary.bank_amount ?? 0), "₮")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Карт</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(detailSummary.card_amount ?? 0), "₮")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Бэлэн</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(detailSummary.cash_amount ?? 0), "₮")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Нийт</p>
                <p className="text-sm font-semibold text-slate-900">
                  {money(String(detailSummary.total_amount ?? 0), "₮")}
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
                  <TableHead>Урьдчилгаа</TableHead>
                  <TableHead>Урамшуулал</TableHead>
                  <TableHead>Үлдэгдэл төлбөр</TableHead>
                  <TableHead>Нийт үнэ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailAction === ACTION.RUNNING ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      Уншиж байна
                    </TableCell>
                  </TableRow>
                ) : detailRows.length ? (
                  detailRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {getDateLabel(item.order_date)}
                      </TableCell>
                      <TableCell>{item.branch_name ?? "-"}</TableCell>
                      <TableCell>{item.artist_names ?? "-"}</TableCell>
                      <TableCell>{item.service_names ?? "-"}</TableCell>
                      <TableCell>
                        {paymentAmount(item.pre_amount, "Урьдчилгаа")}
                      </TableCell>
                      <TableCell>
                        {rewardAmount(
                          item.discount_amount,
                          item.voucher_name || "Урамшуулал",
                        )}
                      </TableCell>
                      <TableCell>
                        {paymentAmount(
                          item.paid_amount,
                          getPaymentTypeLabel(item.transaction_type),
                        )}
                      </TableCell>
                      <TableCell>
                        {money(String(item.order_total_amount ?? 0), "₮")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      Задралын мэдээлэл алга байна
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-rose-600">
                    {rewardAmount(detailSummary.discount_amount)}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    Нийт
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {money(String(detailSummary.total_amount), "₮")}
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
