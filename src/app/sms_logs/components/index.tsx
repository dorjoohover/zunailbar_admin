"use client";
import { ListType, DEFAULT_PG, PG, ACTION } from "@/lib/constants";
import { mobileFormatter } from "@/lib/functions";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { fetcher } from "@/hooks/fetcher";
import { Api } from "@/utils/api";
import { useState } from "react";
import DynamicHeader from "@/components/dynamicHeader";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateOne } from "@/app/(api)";
import { showToast } from "@/shared/components/showToast";

export interface SmsLog {
  id: string;
  mobile: string;
  message: string;
  success: boolean;
  error: string | null;
  created_at: string;
}

// WeSend SDK-ийн Balance, Pricing төрлөөс хэрэгтэй хэсэг
export interface SmsInfo {
  balance: {
    balance: number;
    next_expiry: { credits: number; expires_at: string } | null;
  };
  pricing: {
    sms: {
      credits_per_part: number;
      rate_multiplier: number;
      holiday: string | null;
      latin_part_size: number;
      unicode_part_size: number;
    };
    holidays: { name: string; starts_on: string; ends_on: string; rate_multiplier: number }[];
  };
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
    accessorKey: "error",
    header: () => <span>Алдаа</span>,
    cell: ({ row }) => (
      <span className="text-xs text-red-500 whitespace-pre-wrap break-all">
        {(row.getValue("error") as string | null) ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: () => <span>Огноо</span>,
    cell: ({ row }) => <span>{row.getValue("created_at")}</span>,
  },
];

const SmsInfoCards = ({ info }: { info: SmsInfo | null }) => {
  if (!info?.balance || !info?.pricing) {
    return (
      <div className="bg-white rounded-xl shadow-light border-light p-5 mb-4 text-sm text-red-500">
        WeSend-ээс кредит, үнийн мэдээлэл авч чадсангүй.
      </div>
    );
  }
  const { balance, pricing } = info;
  const sms = pricing.sms;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="bg-white rounded-xl shadow-light border-light p-5">
        <p className="text-sm text-gray-500">Үлдэгдэл кредит</p>
        <p className="text-2xl font-semibold">{balance.balance.toLocaleString()}</p>
        {balance.next_expiry && (
          <p className="text-xs text-gray-500 mt-1">
            {balance.next_expiry.credits.toLocaleString()} кредит{" "}
            {balance.next_expiry.expires_at.slice(0, 10)}-нд дуусна
          </p>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-light border-light p-5">
        <p className="text-sm text-gray-500">SMS үнэ</p>
        <p className="text-2xl font-semibold">
          {sms.credits_per_part * sms.rate_multiplier} кредит / хэсэг
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Латин {sms.latin_part_size}, кирилл {sms.unicode_part_size} тэмдэгт = 1 хэсэг
          {sms.holiday && ` · ${sms.holiday} (×${sms.rate_multiplier})`}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-light border-light p-5">
        <p className="text-sm text-gray-500">Үнэ өсөх баярууд</p>
        {pricing.holidays.length === 0 ? (
          <p className="text-sm mt-1">Байхгүй</p>
        ) : (
          <ul className="text-xs mt-1 space-y-1">
            {pricing.holidays.map((h) => (
              <li key={h.starts_on + h.name}>
                {h.name}: {h.starts_on} – {h.ends_on} (×{h.rate_multiplier})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export interface ReminderConfig {
  enabled: boolean;
  days: number;
}

const ReminderSettings = ({ config }: { config: ReminderConfig | null }) => {
  const [enabled, setEnabled] = useState(config?.enabled ?? false);
  const [days, setDays] = useState(String(config?.days ?? 28));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await updateOne(Api.order, "reminder", { enabled, days: +days });
    setSaving(false);
    showToast(res.success ? "success" : "info", res.success ? "Хадгалагдлаа!" : res.error ?? "Алдаа гарлаа");
  };

  return (
    <div className="bg-white rounded-xl shadow-light border-light p-5 mb-4 flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[220px]">
        <p className="font-medium">Үйлчилгээ сануулах SMS</p>
        <p className="text-xs text-gray-500">
          Сүүлийн захиалгаас {days || "N"} хоногийн дараа өдөр бүр 11:00 цагт өмнөх үйлчилгээг сануулна.
          Аль үйлчилгээнд явуулахыг Үйлчилгээ цэснээс тохируулна.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        {enabled ? "Асаалттай" : "Унтраалттай"}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Input
          type="number"
          min={1}
          max={365}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-20"
        />
        хоног
      </label>
      <Button onClick={save} disabled={saving}>
        Хадгалах
      </Button>
    </div>
  );
};

export const SmsLogPage = ({
  logs,
  info,
  reminder,
}: {
  logs: ListType<SmsLog>;
  info: SmsInfo | null;
  reminder: ReminderConfig | null;
}) => {
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
        <SmsInfoCards info={info} />
        <ReminderSettings config={reminder} />
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
