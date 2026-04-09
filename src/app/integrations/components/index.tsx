"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import DynamicHeader from "@/components/dynamicHeader";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetcher } from "@/hooks/fetcher";
import { ACTION, DEFAULT_PG, ListDefault, ListType, PG } from "@/lib/constants";
import {
  add15Days,
  mnDateFormat,
  money,
  usernameFormatter,
} from "@/lib/functions";
import {
  IOrderDetail,
  Integration,
  SalaryCalculationRow,
  SalaryReconciliationItem,
  User,
} from "@/models";
import { Api } from "@/utils/api";
import { ComboBox } from "@/shared/components/combobox";
import { DatePicker } from "@/shared/components/date.picker";
import { Modal } from "@/shared/components/modal";
import { showToast } from "@/shared/components/showToast";
import { excel, find } from "@/app/(api)";
import { getColumns } from "./columns";
import { SalarySectionNav } from "../_components/section-nav";

type IntegrationFilter = {
  from?: string;
  to?: string;
  artist_id?: string;
};

const defaultReconciliation = {
  count: 0,
  items: [],
  from: "",
  to: "",
  summary: undefined,
} as ListType<SalaryReconciliationItem>;

const parseDateValue = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const getInitialDateRange = (
  initialFilter?: IntegrationFilter,
): { from?: Date; to?: Date } => {
  const from = parseDateValue(initialFilter?.from);
  const to = parseDateValue(initialFilter?.to ?? initialFilter?.from);
  return { from, to };
};

const detailInfo = (detail: IOrderDetail) => {
  const parts = [
    detail.service_name,
    detail.start_time && detail.end_time
      ? `${detail.start_time.slice(0, 5)} - ${detail.end_time.slice(0, 5)}`
      : undefined,
    detail.description,
  ].filter(Boolean);

  return parts.join(" / ");
};

export const IntegrationsPage = ({
  data,
  reconciliation,
  users,
  initialFilter,
}: {
  data: ListType<Integration>;
  reconciliation: ListType<SalaryReconciliationItem>;
  users: ListType<User>;
  initialFilter?: IntegrationFilter;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [detailAction, setDetailAction] = useState(ACTION.DEFAULT);
  const [reportFilter, setReportFilter] = useState<{
    from?: Date;
    to?: Date;
    artist_id?: string;
  }>({
    ...getInitialDateRange(initialFilter),
    artist_id: initialFilter?.artist_id,
  });
  const [rows, setRows] = useState<ListType<SalaryCalculationRow>>(
    ListDefault as ListType<SalaryCalculationRow>,
  );
  const [selectedRow, setSelectedRow] = useState<SalaryCalculationRow>();
  const [detailRows, setDetailRows] = useState<IOrderDetail[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  const userMap = useMemo(
    () => new Map(users.items.map((item) => [item.id, item])),
    [users.items],
  );

  const getFilterParams = () => {
    const fromDate = reportFilter.from;
    const toDate = reportFilter.to ?? reportFilter.from;

    return {
      ...(fromDate ? { from: mnDateFormat(fromDate) } : {}),
      ...(toDate ? { to: mnDateFormat(toDate) } : {}),
      ...(reportFilter.artist_id ? { artist_id: reportFilter.artist_id } : {}),
    };
  };

  const formatRows = (
    integrationList: ListType<Integration>,
    reconciliationList: ListType<SalaryReconciliationItem>,
  ) => {
    const salaryMap = new Map<
      string,
      { salary_amount: number; order_count: number }
    >();

    for (const item of integrationList.items ?? []) {
      const current = salaryMap.get(item.artist_id) ?? {
        salary_amount: 0,
        order_count: 0,
      };

      salaryMap.set(item.artist_id, {
        salary_amount: current.salary_amount + Number(item.amount ?? 0),
        order_count: current.order_count + Number(item.order_count ?? 0),
      });
    }

    const reconciliationMap = new Map(
      (reconciliationList.items ?? []).map((item) => [item.artist_id, item]),
    );
    const artistIds = new Set([
      ...salaryMap.keys(),
      ...(reconciliationList.items ?? []).map((item) => item.artist_id),
    ]);
    const filterParams = getFilterParams();

    const items = [...artistIds]
      .map((artist_id) => {
        const salary = salaryMap.get(artist_id);
        const reconciliationItem = reconciliationMap.get(artist_id);
        const user = userMap.get(artist_id);

        return {
          artist_id,
          user_name: user ? usernameFormatter(user) : "",
          from:
            filterParams.from ??
            reconciliationList.from ??
            integrationList.from ??
            "",
          to:
            filterParams.to ??
            reconciliationList.to ??
            integrationList.to ??
            filterParams.from ??
            "",
          income_amount: Number(reconciliationItem?.income_amount ?? 0),
          salary_amount: Number(
            reconciliationItem?.salary_amount ?? salary?.salary_amount ?? 0,
          ),
          order_count: Number(
            reconciliationItem?.order_count ?? salary?.order_count ?? 0,
          ),
          transferred_amount: Number(
            reconciliationItem?.transferred_amount ?? 0,
          ),
          balance_amount: Number(reconciliationItem?.balance_amount ?? 0),
          percent: Number(reconciliationItem?.percent ?? user?.percent ?? 0),
          salary_day: Number(reconciliationItem?.salary_day ?? 0),
        } satisfies SalaryCalculationRow;
      })
      .sort((a, b) => (a.user_name ?? "").localeCompare(b.user_name ?? ""));

    setRows({
      count: items.length,
      items,
      from:
        filterParams.from ??
        reconciliationList.from ??
        integrationList.from ??
        "",
      to: filterParams.to ?? reconciliationList.to ?? integrationList.to ?? "",
    });
  };

  useEffect(() => {
    formatRows(data, reconciliation ?? defaultReconciliation);
  }, [data, reconciliation, userMap]);

  const loadDetails = async (row: SalaryCalculationRow) => {
    setSelectedRow(row);
    setDetailRows([]);
    setDetailOpen(true);
    setDetailAction(ACTION.RUNNING);
    const from = row.from || undefined;
    const to = row.to || row.from || undefined;

    const detailRes = await fetcher<IOrderDetail>(Api.order_detail, {
      page: 0,
      limit: 500,
      sort: false,
      user_id: row.artist_id,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    } as any);

    const items = (detailRes.items ?? []).sort((a, b) => {
      const dateA = new Date(a.order_date ?? 0).getTime();
      const dateB = new Date(b.order_date ?? 0).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return (a.start_time ?? "").localeCompare(b.start_time ?? "");
    });

    setDetailRows(items);
    setDetailAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    if (!rows.items.length) {
      setSelectedRow(undefined);
      setDetailRows([]);
      setDetailOpen(false);
      return;
    }
  }, [rows.items]);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { sort } = pg;
    const { from, to, artist_id } = getFilterParams();

    const [integrationRes, reconciliationRes] = await Promise.all([
      fetcher<Integration>(Api.integration, {
        page: 0,
        limit: 500,
        sort: sort ?? DEFAULT_PG.sort,
        from,
        to,
        artist_id,
        ...pg,
      }),
      find<SalaryReconciliationItem>(
        Api.integration,
        {
          page: 0,
          limit: 500,
          sort: sort ?? DEFAULT_PG.sort,
          from,
          to,
          artist_id,
          ...pg,
        },
        "reconciliation",
      ),
    ]);

    formatRows(integrationRes, reconciliationRes.data);
    setAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    void refresh({});
  }, [reportFilter]);

  const processAllSalaries = async () => {
    setAction(ACTION.RUNNING);
    const { from, to } = getFilterParams();
    const res = await find(
      Api.order,
      {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      } as any,
      "confirm",
    );
    const processed = Number((res?.data as any)?.count ?? 0);

    showToast(
      processed > 0 ? "success" : "info",
      processed > 0
        ? `${processed} захиалгаар цалингийн бүртгэл үүслээ`
        : "Бодох захиалга олдсонгүй",
    );

    await refresh({});
    setAction(ACTION.DEFAULT);
  };

  const downloadSummary = async () => {
    const { from, to, artist_id } = getFilterParams();

    const res = await excel(
      Api.integration,
      {
        page: 0,
        limit: -1,
        sort: DEFAULT_PG.sort,
        from,
        to,
        artist_id,
      },
      "report_summary",
    );

    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "application/xlsx" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `salary_summary_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    }

    showToast("error", res.message ?? "Экспорт хийхэд алдаа гарлаа");
  };

  const clearReportFilter = () => {
    setReportFilter({
      from: undefined,
      to: undefined,
      artist_id: undefined,
    });
  };

  const detailTotal = detailRows.reduce(
    (total, item) => total + Number(item.price ?? 0),
    0,
  );
  const summaryCards = useMemo(() => {
    const totalArtists = rows.items.length;
    const totalOrders = rows.items.reduce(
      (total, item) => total + Number(item.order_count ?? 0),
      0,
    );
    const totalIncome = rows.items.reduce(
      (total, item) => total + Number(item.income_amount ?? 0),
      0,
    );
    const totalSalary = rows.items.reduce(
      (total, item) => total + Number(item.salary_amount ?? 0),
      0,
    );
    const totalProfit = totalIncome - totalSalary;
    const totalTransferred = rows.items.reduce(
      (total, item) => total + Number(item.transferred_amount ?? 0),
      0,
    );
    const totalBalance = rows.items.reduce(
      (total, item) => total + Number(item.balance_amount ?? 0),
      0,
    );

    return [
      {
        label: "Артист",
        value: String(totalArtists),
      },
      {
        label: "Захиалга",
        value: String(totalOrders),
      },
      {
        label: "Нийт орлого",
        value: money(String(totalIncome), "₮"),
      },
      {
        label: "Цалин",
        value: money(String(totalSalary), "₮"),
      },
      {
        label: "Ашиг",
        value: money(String(totalProfit), "₮"),
      },
      {
        label: "Шилжүүлсэн",
        value: money(String(totalTransferred), "₮"),
      },
      {
        label: "Цалингийн үлдэгдэл",
        value: money(String(totalBalance), "₮"),
      },
    ];
  }, [rows.items]);

  return (
    <div>
      <DynamicHeader />

      <div className="admin-container space-y-4">
        <SalarySectionNav />

        <div className="rounded-2xl border-light bg-white p-4 shadow-light">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Нэгтгэл</h2>
              <p className="text-xs text-slate-500">
                {(rows.from || reportFilter.from) &&
                (rows.to || reportFilter.to)
                  ? `${rows.from || mnDateFormat(reportFilter.from!)} - ${
                      rows.to || mnDateFormat(reportFilter.to!)
                    }`
                  : "Сонгосон хугацааны цалингийн нэгтгэл"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
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

        <DataTable
          columns={getColumns((row) => void loadDetails(row))}
          limit={Math.max(rows.items.length, 1)}
          count={rows.count}
          data={rows.items}
          refresh={refresh}
          loading={action === ACTION.RUNNING}
          search={false}
          fitContainer
          clear={clearReportFilter}
          filter={
            <>
              <label>
                <span className="filter-label">Эхлэх огноо</span>
                <DatePicker
                  mode="single"
                  value={reportFilter.from}
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
                  value={reportFilter.to}
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
                <span className="filter-label">Артист</span>
                <ComboBox
                  pl="Артист сонгох"
                  props={{
                    name: "artist_id",
                    value: reportFilter.artist_id ?? "",
                    onChange: (value) =>
                      setReportFilter((prev) => ({
                        ...prev,
                        artist_id: value || undefined,
                      })),
                    onBlur: () => {},
                    ref: () => {},
                  }}
                  items={users.items.map((item) => ({
                    value: item.id,
                    label: usernameFormatter(item),
                  }))}
                />
              </label>
            </>
          }
          filterRight={
            <div className="flex w-full flex-wrap justify-end gap-2 xl:w-auto">
              <Button
                variant="outline"
                onClick={processAllSalaries}
                disabled={action === ACTION.RUNNING}
              >
                {action === ACTION.RUNNING ? "Бодож байна" : "Цалин бодох"}
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
          }
        />

        <Modal
          open={detailOpen}
          setOpen={setDetailOpen}
          maw="6xl"
          title="Нэгтгэлийн захиалгын задрал"
          description={
            selectedRow
              ? `${selectedRow.user_name ?? "Артист"} · ${selectedRow.from || "-"}${selectedRow.to ? ` - ${selectedRow.to}` : ""}`
              : "Захиалгын задралыг харуулна."
          }
        >
          <div className="space-y-4">
            {selectedRow && (
              <div className="grid gap-2 sm:grid-cols-5">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Нийт орлого</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {money(String(selectedRow.income_amount ?? 0), "₮")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Цалин</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {money(String(selectedRow.salary_amount ?? 0), "₮")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Ашиг</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {money(
                      String(
                        Number(selectedRow.income_amount ?? 0) -
                          Number(selectedRow.salary_amount ?? 0),
                      ),
                      "₮",
                    )}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Шилжүүлсэн</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {money(String(selectedRow.transferred_amount ?? 0), "₮")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Хувь / Цалингийн өдөр
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedRow.percent ?? 0}% /{" "}
                    {selectedRow.salary_day
                      ? add15Days(selectedRow.salary_day)
                      : "-"}
                  </p>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артист</TableHead>
                  <TableHead>Огноо</TableHead>
                  <TableHead>Захиалгын мэдээлэл</TableHead>
                  <TableHead>Дүн</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailAction === ACTION.RUNNING ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      Уншиж байна
                    </TableCell>
                  </TableRow>
                ) : detailRows.length ? (
                  detailRows.map((item, index) => (
                    <TableRow
                      key={`${item.id ?? item.order_id ?? index}-${index}`}
                    >
                      <TableCell>{selectedRow?.user_name ?? "-"}</TableCell>
                      <TableCell>{item.order_date ?? "-"}</TableCell>
                      <TableCell className="whitespace-normal">
                        {detailInfo(item) || "-"}
                      </TableCell>
                      <TableCell>
                        {money(String(item.price ?? 0), "₮")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      Дэлгэрэнгүй мэдээлэл алга байна
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-slate-900">
                    Нийт
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {money(String(detailTotal), "₮")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Modal>
      </div>
    </div>
  );
};
