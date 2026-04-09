"use client";

import z from "zod";
import { Download, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicHeader from "@/components/dynamicHeader";
import { DataTable } from "@/components/data-table";
import { TableActionButtons } from "@/components/tableActionButtons";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  parseDate,
  usernameFormatter,
} from "@/lib/functions";
import {
  IIntegrationPayment,
  IntegrationPayment,
  IntegrationTransferSummaryRow,
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
import { SalarySectionNav } from "../../_components/section-nav";

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
  salary_amount: 0,
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
): { from?: Date; to?: Date } => {
  const from = parseDateValue(initialFilter?.from);
  const to = parseDateValue(initialFilter?.to ?? initialFilter?.from);
  return { from, to };
};

const toFormDate = (value: Date | string) => {
  if (value instanceof Date) {
    return value;
  }

  if (!value) {
    return new Date();
  }

  return new Date(value.includes("T") ? value : `${value}T00:00:00`);
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [reportFilter, setReportFilter] = useState<{
    from?: Date;
    to?: Date;
    artist_id?: string;
  }>({
    ...getInitialDateRange(initialFilter),
    artist_id: initialFilter?.artist_id,
  });
  const [payments, setPayments] = useState<ListType<IntegrationHistoryItem>>(
    ListDefault as ListType<IntegrationHistoryItem>,
  );
  const [rows, setRows] = useState<ListType<IntegrationTransferSummaryRow>>(
    ListDefault as ListType<IntegrationTransferSummaryRow>,
  );
  const [selectedRow, setSelectedRow] =
    useState<IntegrationTransferSummaryRow>();
  const [detailRows, setDetailRows] = useState<IntegrationHistoryItem[]>([]);

  const form = useForm<IntegrationHistoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

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

  const formatPayments = (list: ListType<IntegrationPayment>) => {
    const items = list.items.map((item) => {
      const user = userMap.get(item.artist_id);
      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });
    const filterParams = getFilterParams();
    const grouped = new Map<string, IntegrationTransferSummaryRow>();

    for (const item of items) {
      const current = grouped.get(item.artist_id) ?? {
        artist_id: item.artist_id,
        user_name: item.user_name,
        from: filterParams.from ?? list.from ?? "",
        to: filterParams.to ?? list.to ?? filterParams.from ?? "",
        payment_count: 0,
        transferred_amount: 0,
      };

      current.payment_count += 1;
      current.transferred_amount += Number(item.amount ?? 0);
      current.user_name = current.user_name || item.user_name;
      grouped.set(item.artist_id, current);
    }

    const summaryItems = [...grouped.values()].sort((a, b) =>
      (a.user_name ?? "").localeCompare(b.user_name ?? ""),
    );

    setPayments({
      items,
      count: list.count,
      summary: list.summary ?? defaultSummary,
      from: list.from,
      to: list.to,
    });
    setRows({
      items: summaryItems,
      count: summaryItems.length,
      summary: list.summary ?? defaultSummary,
      from: filterParams.from ?? list.from ?? "",
      to: filterParams.to ?? list.to ?? "",
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

    formatPayments(res);
    setAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    void refresh({});
  }, [reportFilter]);

  useEffect(() => {
    if (!rows.items.length) {
      setSelectedRow(undefined);
      setDetailRows([]);
      setDetailOpen(false);
      return;
    }

    if (
      selectedRow &&
      !rows.items.some((item) => item.artist_id === selectedRow.artist_id)
    ) {
      setSelectedRow(undefined);
      setDetailRows([]);
      setDetailOpen(false);
    }
  }, [rows.items, selectedRow]);

  useEffect(() => {
    if (!selectedRow) {
      setDetailRows([]);
      return;
    }

    const items = payments.items
      .filter((item) => item.artist_id === selectedRow.artist_id)
      .sort(
        (a, b) =>
          new Date(b.paid_at ?? 0).getTime() -
          new Date(a.paid_at ?? 0).getTime(),
      );

    setDetailRows(items);
  }, [payments.items, selectedRow]);

  const deletePayment = async (payment: IIntegrationPayment) => {
    const res = await deleteOne(Api.integration_payment, payment.id);
    await refresh({});
    return res.success;
  };

  const edit = async (payment: IIntegrationPayment) => {
    setDetailOpen(false);
    setOpen(true);
    form.reset({
      ...payment,
      paid_at: toFormDate(payment.paid_at),
      edit: payment.id,
    });
  };

  const openDetail = (row: IntegrationTransferSummaryRow) => {
    setSelectedRow(row);
    setDetailOpen(true);
  };

  const columns = getColumns(openDetail);

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
        edit
          ? "Шилжүүлгийн бүртгэл шинэчлэгдлээ"
          : "Шилжүүлэг амжилттай бүртгэгдлээ",
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
      from: undefined,
      to: undefined,
      artist_id: undefined,
    });
  };

  const summary =
    (payments.summary as SalaryReconciliationSummary | undefined) ??
    defaultSummary;
  const totalProfit =
    Number(summary.income_amount ?? 0) - Number(summary.salary_amount ?? 0);
  const summaryCards = useMemo(() => {
    const totalArtists = rows.items.length;
    const totalPayments = rows.items.reduce(
      (total, item) => total + Number(item.payment_count ?? 0),
      0,
    );

    return [
      {
        label: "Артист",
        value: String(totalArtists),
      },
      {
        label: "Шилжүүлэг",
        value: String(totalPayments),
      },
      {
        label: "Орлого",
        value: money(String(summary.income_amount ?? 0), "₮"),
      },
      {
        label: "Цалин",
        value: money(String(summary.salary_amount ?? 0), "₮"),
      },
      {
        label: "Ашиг",
        value: money(String(totalProfit), "₮"),
      },
      {
        label: "Шилжүүлсэн",
        value: money(String(summary.transferred_amount ?? 0), "₮"),
      },
      {
        label: "Цалингийн үлдэгдэл",
        value: money(String(summary.balance_amount ?? 0), "₮"),
      },
    ];
  }, [rows.items, summary, totalProfit]);
  const detailTotal = detailRows.reduce(
    (total, item) => total + Number(item.amount ?? 0),
    0,
  );

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
                  : "Сонгосон хугацааны шилжүүлгийн нэгтгэл"}
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
          columns={columns}
          count={rows.count}
          data={rows.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
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
                onClick={() => {
                  form.reset(defaultValues);
                  setOpen(true);
                }}
              >
                <Plus className="size-4" />
                Шилжүүлэг нэмэх
              </Button>
              <Button
                variant="ghost"
                onClick={() => void downloadExcel()}
                className="bg-green-500 text-white hover:bg-green-500/80 hover:text-white"
              >
                <Download />
                Экспорт
              </Button>
              <Modal
                maw="xl"
                title="Шилжүүлэг нэмэх"
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
            </div>
          }
        />

        <Modal
          open={detailOpen}
          setOpen={setDetailOpen}
          maw="6xl"
          title="Шилжүүлгийн дэлгэрэнгүй"
          description={
            selectedRow
              ? `${selectedRow.user_name ?? "Артист"} · ${selectedRow.from || "-"}${selectedRow.to ? ` - ${selectedRow.to}` : ""}`
              : "Шилжүүлгийн мөрүүдийг харуулна."
          }
        >
          <div className="space-y-4">
            {selectedRow && (
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Шилжүүлгийн тоо</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedRow.payment_count ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Шилжүүлсэн дүн</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {money(String(selectedRow.transferred_amount ?? 0), "₮")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">Хугацаа</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedRow.from || "-"}
                    {selectedRow.to ? ` - ${selectedRow.to}` : ""}
                  </p>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артист</TableHead>
                  <TableHead>Төлсөн огноо</TableHead>
                  <TableHead>Төрөл</TableHead>
                  <TableHead>Дүн</TableHead>
                  <TableHead>Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailRows.length ? (
                  detailRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{selectedRow?.user_name ?? "-"}</TableCell>
                      <TableCell>
                        {parseDate(new Date(item.paid_at), false)}
                      </TableCell>
                      <TableCell>
                        {PaymentTypeValues[item.type as PaymentType] ?? "-"}
                      </TableCell>
                      <TableCell>
                        {money(String(item.amount ?? 0), "₮")}
                      </TableCell>
                      <TableCell>
                        <TableActionButtons
                          rowData={item}
                          onEdit={(data) => void edit(data)}
                          onRemove={(data) => deletePayment(data)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
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
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Modal>
      </div>
    </div>
  );
};
