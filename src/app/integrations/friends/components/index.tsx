"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { CircleX } from "lucide-react";
import { DataTable } from "@/components/data-table";
import DynamicHeader from "@/components/dynamicHeader";
import { ComboBox } from "@/shared/components/combobox";
import { DatePicker } from "@/shared/components/date.picker";
import { Button } from "@/components/ui/button";
import { showToast } from "@/shared/components/showToast";
import { fetcher } from "@/hooks/fetcher";
import { excel } from "@/app/(api)";
import { Api } from "@/utils/api";
import { IOrder, User } from "@/models";
import { OrderStatus } from "@/lib/enum";
import { ListType, ACTION, PG, DEFAULT_PG } from "@/lib/constants";
import { mnDate, mnDateFormat, usernameFormatter } from "@/lib/functions";
import { getColumns } from "./columns";

type FriendFilter = {
  date?: DateRange;
  artist_id?: string;
};

const ListDefault = {
  count: 0,
  items: [],
} as ListType<IOrder>;

export function FriendsPage({
  data,
  users,
}: {
  data: ListType<IOrder>;
  users: ListType<User>;
}) {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [orders, setOrders] = useState<ListType<IOrder>>(ListDefault);
  const [reportFilter, setReportFilter] = useState<FriendFilter>({});

  const getFilterParams = () => {
    const fromDate = reportFilter.date?.from;
    const toDate = reportFilter.date?.to ?? reportFilter.date?.from;
    return {
      ...(fromDate ? { date: mnDateFormat(fromDate) } : {}),
      ...(toDate ? { end_date: mnDateFormat(toDate) } : {}),
      ...(reportFilter.artist_id ? { user_id: reportFilter.artist_id } : {}),
      friend: 0,
      order_status: OrderStatus.Friend,
    };
  };

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const res = await fetcher<IOrder>(Api.order, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      ...getFilterParams(),
      ...(pg.filter && { customer: pg.filter }),
    });
    setOrders(res);
    setAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    setOrders(data);
  }, [data]);

  useEffect(() => {
    void refresh({});
  }, [reportFilter]);

  const clearReportFilter = () => {
    setReportFilter({
      date: undefined,
      artist_id: undefined,
    });
  };

  const downloadExcel = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, sort } = pg;
    const res = await excel(Api.order, {
      page: page ?? DEFAULT_PG.page,
      limit: -1,
      sort: sort ?? DEFAULT_PG.sort,
      ...getFilterParams(),
      ...pg,
    });
    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "application/xlsx" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `friend_orders_${mnDate().toISOString().slice(0, 10)}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      showToast("error", res.message);
    }
    setAction(ACTION.DEFAULT);
  };

  return (
    <div>
      <DynamicHeader count={orders.count} titleOverride="Танилын будалт" />

      <div className="admin-container space-y-4">
        <div className="bg-white rounded-2xl shadow-light border-light p-4">
          <div className="flex flex-wrap gap-3 items-end">
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
              className="text-xs text-red-500 hover:text-red-500 bg-red-50 hover:bg-red-100 lg:h-10"
            >
              <CircleX />
            </Button>
          </div>
        </div>

        <DataTable
          columns={getColumns()}
          count={orders.count}
          data={orders.items}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          excel={downloadExcel}
        />
      </div>
    </div>
  );
}
