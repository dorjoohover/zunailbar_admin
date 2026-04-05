"use client";

import Link from "next/link";
import { DateRange } from "react-day-picker";
import { CircleX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DynamicHeader from "@/components/dynamicHeader";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/hooks/fetcher";
import {
  ACTION,
  DEFAULT_PG,
  ListDefault,
  ListType,
  PG,
} from "@/lib/constants";
import { mnDateFormat, money, usernameFormatter } from "@/lib/functions";
import { Integration, IntegrationListSummary, User } from "@/models";
import { Api } from "@/utils/api";
import { ComboBox } from "@/shared/components/combobox";
import { DatePicker } from "@/shared/components/date.picker";
import { showToast } from "@/shared/components/showToast";
import { excel, find } from "@/app/(api)";
import { getColumns } from "./columns";

type IntegrationFilter = {
  from?: string;
  to?: string;
  artist_id?: string;
};

type IntegrationTableItem = Integration & { user_name?: string };

const defaultSummary: IntegrationListSummary = {
  total_amount: 0,
  total_order_count: 0,
  total_count: 0,
};

const parseDateValue = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const getInitialDateRange = (initialFilter?: IntegrationFilter): DateRange | undefined => {
  const from = parseDateValue(initialFilter?.from);
  const to = parseDateValue(initialFilter?.to ?? initialFilter?.from);

  if (!from) return undefined;

  return {
    from,
    to,
  };
};

export const IntegrationsPage = ({
  data,
  users,
  initialFilter,
}: {
  data: ListType<Integration>;
  users: ListType<User>;
  initialFilter?: IntegrationFilter;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [reportFilter, setReportFilter] = useState<{
    date?: DateRange;
    artist_id?: string;
  }>({
    date: getInitialDateRange(initialFilter),
    artist_id: initialFilter?.artist_id,
  });
  const [integrations, setIntegrations] = useState<ListType<IntegrationTableItem>>(
    ListDefault as ListType<IntegrationTableItem>,
  );

  const userMap = useMemo(
    () => new Map(users.items.map((item) => [item.id, item])),
    [users.items],
  );

  const getFilterParams = () => {
    const fromDate = reportFilter.date?.from;
    const toDate = reportFilter.date?.to ?? reportFilter.date?.from;

    return {
      ...(fromDate ? { from: mnDateFormat(fromDate) } : {}),
      ...(toDate ? { to: mnDateFormat(toDate) } : {}),
      ...(reportFilter.artist_id ? { artist_id: reportFilter.artist_id } : {}),
    };
  };

  const formatIntegrations = (list: ListType<Integration>) => {
    const items = list.items.map((item) => {
      const user = userMap.get(item.artist_id);

      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });

    setIntegrations({
      items,
      count: list.count,
      summary: list.summary ?? defaultSummary,
      from: list.from,
      to: list.to,
    });
  };

  useEffect(() => {
    formatIntegrations(data);
  }, [data, userMap]);

  const getHistoryHref = (integration?: Integration) => {
    const params = new URLSearchParams();
    const { from, to, artist_id } = getFilterParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (artist_id) params.set("artist_id", artist_id);
    if (integration?.artist_id) params.set("artist_id", integration.artist_id);

    const query = params.toString();
    return `/integrations/history${query ? `?${query}` : ""}`;
  };

  const columns = getColumns(getHistoryHref);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const { from, to, artist_id } = getFilterParams();

    const res = await fetcher<Integration>(Api.integration, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      from,
      to,
      artist_id,
      ...pg,
    });

    formatIntegrations(res);
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

  const downloadExcel = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, sort } = pg;
    const { from, to, artist_id } = getFilterParams();
    const res = await excel(Api.integration, {
      page: page ?? DEFAULT_PG.page,
      limit: -1,
      sort: sort ?? DEFAULT_PG.sort,
      from,
      to,
      artist_id,
      ...pg,
    });

    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "application/xlsx" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "integrations.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      showToast("error", res.message);
    }

    setAction(ACTION.DEFAULT);
  };

  const clearReportFilter = () => {
    setReportFilter({
      date: undefined,
      artist_id: undefined,
    });
  };

  const summary = (integrations.summary as IntegrationListSummary | undefined) ?? defaultSummary;

  return (
    <div>
      <DynamicHeader />

      <div className="admin-container space-y-4">
        <div className="rounded-2xl border-light bg-white p-4 shadow-light">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <label>
                <span className="filter-label">Хугацаа</span>
                <DatePicker
                  mode="range"
                  value={reportFilter.date}
                  onChange={(value) =>
                    setReportFilter((prev) => ({
                      ...prev,
                      date: value as DateRange | undefined,
                    }))
                  }
                  pl="Огноо сонгох"
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
              <Button
                variant="ghost"
                onClick={clearReportFilter}
                className="bg-red-50 text-xs text-red-500 hover:bg-red-100 hover:text-red-500 lg:h-10"
              >
                <CircleX />
              </Button>
            </div>

            <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
              <Button variant="outline" asChild>
                <Link href={getHistoryHref()}>Цалингийн түүх</Link>
              </Button>
              <Button
                onClick={processAllSalaries}
                disabled={action == ACTION.RUNNING}
                className="w-full sm:w-auto"
              >
                {action == ACTION.RUNNING ? "Бодож байна" : "Бүгдийн цалин бодох"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-light">
            <p className="text-sm text-slate-500">Нийт бодогдсон цалин</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {money(String(summary.total_amount ?? 0), "₮")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-light">
            <p className="text-sm text-slate-500">Үйлчилгээний нийт тоо</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.total_order_count ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-light">
            <p className="text-sm text-slate-500">Тооцооны бүртгэл</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.total_count ?? integrations.count ?? 0}
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          count={integrations.count}
          data={integrations.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          excel={downloadExcel}
        />
      </div>
    </div>
  );
};
