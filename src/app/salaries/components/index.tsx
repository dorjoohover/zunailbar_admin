"use client";
import { DataTable } from "@/components/data-table";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  ListDefault,
  VALUES,
  ZValidator,
  PaymentTypeValues,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, excel, find, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import DynamicHeader from "@/components/dynamicHeader";
import { INPUT_TYPE, PaymentType } from "@/lib/enum";
import {
  IIntegrationPayment,
  IntegrationPayment,
  PaymentDailySummary,
  User,
} from "@/models";
import {
  firstLetterUpper,
  mnDate,
  mnDateFormat,
  money,
  usernameFormatter,
} from "@/lib/functions";
import { DatePicker } from "@/shared/components/date.picker";
import { showToast } from "@/shared/components/showToast";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";

const formSchema = z.object({
  paid_at: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date(),
  ) as unknown as Date,
  type: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(PaymentType).nullable(),
    )
    .optional() as unknown as number,
  amount: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
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

type SalaryPaymentForm = z.infer<typeof formSchema>;
type SalaryHistory = IntegrationPayment & { user_name?: string };

const defaultDailySummary: PaymentDailySummary = {
  from: "",
  to: "",
  pre_amount: 0,
  cash_amount: 0,
  bank_amount: 0,
  total_amount: 0,
};

export const SalaryPage = ({
  data,
  users,
}: {
  data: ListType<IntegrationPayment>;
  users: ListType<User>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const [reportFilter, setReportFilter] = useState<{
    date?: DateRange;
    artist_id?: string;
  }>({});
  const [dailySummary, setDailySummary] =
    useState<PaymentDailySummary>(defaultDailySummary);
  const [payments, setPayments] = useState<ListType<SalaryHistory>>(ListDefault);
  const form = useForm<SalaryPaymentForm>({
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
    setPayments({ items, count: list.count });
  };

  const refreshReportCards = async () => {
    const params = getFilterParams();
    const summaryRes = await find<PaymentDailySummary>(
      Api.payment,
      params as any,
      "summary",
    );

    setDailySummary((summaryRes.data as any) ?? defaultDailySummary);
  };

  useEffect(() => {
    formatPayments(data);
  }, [data, userMap]);

  const columns = getColumns(
    (payment) => {
      setOpen(true);
      form.reset({ ...payment, edit: payment.id });
    },
    async (index) => {
      const id = payments.items[index]?.id;
      if (!id) return false;
      const res = await deleteOne(Api.integration_payment, id);
      await refresh({});
      return res.success;
    },
  );

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

    formatPayments(res);
    setAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    void refresh({});
    void refreshReportCards();
  }, [reportFilter]);

  const processAllSalaries = async () => {
    setAction(ACTION.RUNNING);
    const res = await find(Api.order, {} as any, "confirm");
    const processed = Number((res?.data as any)?.count ?? 0);
    const success = processed > 0;

    showToast(
      success ? "success" : "info",
      success
        ? `${processed} захиалгаар цалингийн бүртгэл үүслээ`
        : "Бодох захиалга олдсонгүй",
    );
    await refresh({});
    await refreshReportCards();
    setAction(ACTION.DEFAULT);
  };

  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as SalaryPaymentForm;
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
      showToast("success", edit ? "Түүх амжилттай засагдлаа" : "Цалин олгож бүртгэл үүслээ");
      form.reset(defaultValues);
    } else {
      showToast("error", res.error ?? "Алдаа гарлаа");
    }
    setAction(ACTION.DEFAULT);
  };

  const onInvalid = async <T,>(e: T) => {
    const error = Object.entries(e as any)
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
        `salary_history_${mnDate().toISOString().slice(0, 10)}.xlsx`,
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
            <Button
              onClick={processAllSalaries}
              disabled={action == ACTION.RUNNING}
              className="w-full sm:w-auto"
            >
              {action == ACTION.RUNNING ? "Бодож байна" : "Бүгдийн цалин бодох"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Урьдчилгаа",
              value: dailySummary.pre_amount,
              className: "border-amber-100 bg-amber-50",
            },
            {
              label: "Бэлэн",
              value: dailySummary.cash_amount,
              className: "border-emerald-100 bg-emerald-50",
            },
            {
              label: "Дансаар",
              value: dailySummary.bank_amount,
              className: "border-sky-100 bg-sky-50",
            },
            {
              label: "Нийт орсон",
              value: dailySummary.total_amount,
              className: "border-slate-200 bg-slate-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-4 shadow-light ${item.className}`}
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {money(String(item.value ?? 0), "₮")}
              </p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns}
          count={payments.count}
          data={payments.items}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          excel={downloadExcel}
          modalAdd={
            <Modal
              maw="xl"
              name="Цалин олгох"
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
