"use client";

import Link from "next/link";
import z from "zod";
import { DateRange } from "react-day-picker";
import { CircleX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicHeader from "@/components/dynamicHeader";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { create, deleteOne, excel, updateOne } from "@/app/(api)";
import { fetcher } from "@/hooks/fetcher";
import {
  ACTION,
  DEFAULT_PG,
  getEnumValues,
  ListDefault,
  ListType,
  PaymentTypeValues,
  PG,
  VALUES,
  ZValidator,
} from "@/lib/constants";
import { INPUT_TYPE, PaymentType } from "@/lib/enum";
import {
  firstLetterUpper,
  mnDate,
  mnDateFormat,
  money,
  usernameFormatter,
} from "@/lib/functions";
import {
  IIntegrationPayment,
  IntegrationPayment,
  SalaryReconciliationSummary,
  User,
} from "@/models";
import { Api } from "@/utils/api";
import { getColumns } from "./columns";
import { Modal } from "@/shared/components/modal";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { DatePicker } from "@/shared/components/date.picker";
import { TextField } from "@/shared/components/text.field";
import { showToast } from "@/shared/components/showToast";

const formSchema = z.object({
  paid_at: z.preprocess(
    (value) => (typeof value === "string" ? new Date(value) : value),
    z.date(),
  ) as unknown as Date,
  type: z.preprocess(
    (value) => (typeof value === "string" ? parseInt(value, 10) : value),
    z.nativeEnum(PaymentType).nullable(),
  ) as unknown as number,
  amount: z.preprocess(
    (value) => (typeof value === "string" ? parseFloat(value) : value),
    z.number(),
  ) as unknown as number,
  artist_id: ZValidator.user,
  user_name: z.string(),
  edit: z.string().nullable().optional(),
});

const defaultValues = {
  paid_at: new Date(),
  type: PaymentType.Salary,
  amount: 0,
  artist_id: "",
  user_name: "",
  edit: undefined,
};

type IntegrationHistoryFilter = {
  from?: string;
  to?: string;
  artist_id?: string;
};

type IntegrationHistoryForm = z.infer<typeof formSchema>;
type IntegrationHistoryItem = IntegrationPayment & { user_name?: string };

const defaultSummary: SalaryReconciliationSummary = {
  income_amount: 0,
  transferred_amount: 0,
  balance_amount: 0,
  order_count: 0,
};

const parseDateValue = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const getInitialDateRange = (
  initialFilter?: IntegrationHistoryFilter,
): DateRange | undefined => {
  const from = parseDateValue(initialFilter?.from);
  const to = parseDateValue(initialFilter?.to ?? initialFilter?.from);

  if (!from) return undefined;

  return {
    from,
    to,
  };
};

export const IntegrationHistoryPage = ({
  data,
  users,
  initialFilter,
}: {
  data: ListType<IntegrationPayment>;
  users: ListType<User>;
  initialFilter?: IntegrationHistoryFilter;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const [reportFilter, setReportFilter] = useState<{
    date?: DateRange;
    artist_id?: string;
  }>({
    date: getInitialDateRange(initialFilter),
    artist_id: initialFilter?.artist_id,
  });
  const [payments, setPayments] = useState<ListType<IntegrationHistoryItem>>(
    ListDefault as ListType<IntegrationHistoryItem>,
  );

  const form = useForm<IntegrationHistoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

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

  const formatPayments = (list: ListType<IntegrationPayment>) => {
    const items = list.items.map((item) => {
      const user = userMap.get(item.artist_id);
      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });

    setPayments({
      items,
      count: list.count,
      summary: list.summary ?? defaultSummary,
      from: list.from,
      to: list.to,
    });
  };

  useEffect(() => {
    formatPayments(data);
  }, [data, userMap]);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const { from, to, artist_id } = getFilterParams();

    const res = await fetcher<IntegrationPayment>(Api.integration_payment, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      from,
      to,
      artist_id,
      ...pg,
    });
    console.log(res);
    formatPayments(res);
    setAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    void refresh({});
  }, [reportFilter]);

  const deleteLog = async (index: number) => {
    const id = payments.items[index]?.id;
    if (!id) return false;

    const res = await deleteOne(Api.integration_payment, id);
    await refresh({});
    return res.success;
  };

  const edit = async (payment: IIntegrationPayment) => {
    setOpen(true);
    form.reset({ ...payment, edit: payment.id });
  };

  const columns = getColumns(edit, deleteLog);

  const onSubmit = async <T,>(values: T) => {
    setAction(ACTION.RUNNING);
    const body = values as IntegrationHistoryForm;
    const { edit, user_name, ...payload } = body;

    const res = edit
      ? await updateOne<IIntegrationPayment>(
          Api.integration_payment,
          edit ?? "",
          payload as unknown as IIntegrationPayment,
        )
      : await create<IIntegrationPayment>(
          Api.integration_payment,
          payload as unknown as IIntegrationPayment,
        );

    if (res.success) {
      await refresh({});
      setOpen(false);
      form.reset(defaultValues);
      showToast(
        "success",
        edit ? "Түүх амжилттай засагдлаа" : "Цалин олгож бүртгэл үүслээ",
      );
    } else {
      showToast("error", res.error ?? "Алдаа гарлаа");
    }

    setAction(ACTION.DEFAULT);
  };

  const onInvalid = async <T,>(errors: T) => {
    const error = Object.entries(errors as any)
      .map(([key, value], index) => {
        if ((value as any)?.message) {
          return (value as any)?.message;
        }

        const fieldName = VALUES[key];
        return index === 0 ? firstLetterUpper(fieldName) : fieldName;
      })
      .join(", ");

    showToast("info", error);
  };

  const downloadExcel = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, sort } = pg;
    const { from, to, artist_id } = getFilterParams();
    const res = await excel(Api.integration_payment, {
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
      link.setAttribute(
        "download",
        `integration_history_${mnDate().toISOString().slice(0, 10)}.xlsx`,
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

  const clearReportFilter = () => {
    setReportFilter({
      date: undefined,
      artist_id: undefined,
    });
  };

  const getIntegrationsHref = () => {
    const params = new URLSearchParams();
    const { from, to, artist_id } = getFilterParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (artist_id) params.set("artist_id", artist_id);

    const query = params.toString();
    return `/integrations${query ? `?${query}` : ""}`;
  };

  const summary =
    (payments.summary as SalaryReconciliationSummary | undefined) ??
    defaultSummary;

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

            <Button variant="outline" asChild>
              <Link href={getIntegrationsHref()}>Тооцооны бүртгэл</Link>
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          count={payments.count}
          data={payments.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          excel={downloadExcel}
          filterRight={
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Артистын тооцооны үлдэгдэл
                </h3>
                <p className="text-sm text-slate-500">
                  Сонгосон хугацаанд орсон орлого болон шилжүүлсэн дүн
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Нийт орлого</p>
                  <p className="text-sm font-semibold">
                    {money(String(summary.income_amount ?? 0), "₮")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Нийт шилжүүлсэн</p>
                  <p className="text-sm font-semibold">
                    {money(String(summary.transferred_amount ?? 0), "₮")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Үлдэгдэл</p>
                  <p className="text-sm font-semibold">
                    {money(String(summary.balance_amount ?? 0), "₮")}
                  </p>
                </div>
              </div>
            </div>
          }
          modalAdd={
            <Modal
              maw="xl"
              name="Цалин нэмэх"
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(value) => {
                setOpen(value);
                form.reset(defaultValues);
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="divide-y">
                  <div className="double-col">
                    <FormItems
                      label="Төрөл"
                      control={form.control}
                      name="type"
                      className="col-span-1"
                    >
                      {(field) => (
                        <ComboBox
                          props={{ ...field }}
                          items={getEnumValues(PaymentType).map((item) => ({
                            value: item.toString(),
                            label: PaymentTypeValues[item],
                          }))}
                        />
                      )}
                    </FormItems>
                    <FormItems
                      label="Артист"
                      control={form.control}
                      name="artist_id"
                      className="col-span-1"
                    >
                      {(field) => (
                        <ComboBox
                          props={{ ...field }}
                          items={users.items.map((item) => ({
                            value: item.id,
                            label: usernameFormatter(item),
                          }))}
                        />
                      )}
                    </FormItems>
                    <FormItems
                      label="Төлсөн огноо"
                      control={form.control}
                      name="paid_at"
                    >
                      {(field) => (
                        <DatePicker
                          name=""
                          mode="single"
                          pl="Огноо сонгох"
                          value={field.value as any}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    </FormItems>
                    <FormItems
                      label="Төлсөн дүн"
                      control={form.control}
                      name="amount"
                    >
                      {(field) => (
                        <TextField
                          props={{
                            ...field,
                          }}
                          type={INPUT_TYPE.MONEY}
                        />
                      )}
                    </FormItems>
                  </div>
                </div>
              </FormProvider>
            </Modal>
          }
        />
      </div>
    </div>
  );
};
