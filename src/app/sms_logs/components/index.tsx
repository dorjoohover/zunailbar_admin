"use client";
import { ListType, DEFAULT_PG, PG, ACTION } from "@/lib/constants";
import { mobileFormatter } from "@/lib/functions";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { fetcher } from "@/hooks/fetcher";
import { Api } from "@/utils/api";
import { useState } from "react";
import DynamicHeader from "@/components/dynamicHeader";

export interface SmsLog {
  id: string;
  mobile: string;
  message: string;
  success: boolean;
  created_at: string;
}

const columns: ColumnDef<SmsLog>[] = [
  {
    id: "index",
    header: () => <span>№</span>,
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  {
    accessorKey: "mobile",
    header: () => <span>Утас</span>,
    cell: ({ row }) => <span>{mobileFormatter(row.getValue("mobile"))}</span>,
  },
  {
    accessorKey: "message",
    header: () => <span>Мессеж</span>,
    cell: ({ row }) => (
      <span className="text-xs whitespace-pre-wrap">{row.getValue("message")}</span>
    ),
  },
  {
    accessorKey: "success",
    header: () => <span>Төлөв</span>,
    cell: ({ row }) => {
      const ok = row.getValue("success") as boolean;
      return (
        <span className={ok ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
          {ok ? "Амжилттай" : "Амжилтгүй"}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: () => <span>Огноо</span>,
    cell: ({ row }) => <span>{row.getValue("created_at")}</span>,
  },
];

export const SmsLogPage = ({ logs }: { logs: ListType<SmsLog> }) => {
  const [data, setData] = useState<ListType<SmsLog>>(logs);
  const [action, setAction] = useState(ACTION.DEFAULT);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const res = await fetcher<SmsLog>(Api.sms_logs, {
      page: pg.page ?? DEFAULT_PG.page,
      limit: pg.limit ?? DEFAULT_PG.limit,
      sort: pg.sort ?? DEFAULT_PG.sort,
    });
    setData(res);
    setAction(ACTION.DEFAULT);
  };

  return (
    <div className="relative">
      <DynamicHeader count={data.count} />
      <div className="admin-container relative">
        <div className="bg-white rounded-xl shadow-light border-light p-0 md:p-5">
          <DataTable
            search={false}
            columns={columns}
            count={data.count}
            data={data.items ?? []}
            refresh={refresh}
            loading={action === ACTION.RUNNING}
          />
        </div>
      </div>
    </div>
  );
};
