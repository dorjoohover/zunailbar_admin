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
  SalaryReconciliationItem,
  SalaryReconciliationResponse,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  order_count: 0,
  artist_id: "",
  user_name: "",
  edit: undefined,
};
type SalaryType = z.infer<typeof formSchema>;
const defaultReconciliation: SalaryReconciliationResponse = {
  from: "",
  to: "",
  count: 0,
  items: [],
  summary: {
    income_amount: 0,
    transferred_amount: 0,
    balance_amount: 0,
    order_count: 0,
  },
};
export const PrePage = ({
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
  const form = useForm<SalaryType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [salaries, setSalaries] =
    useState<ListType<IntegrationPayment>>(ListDefault);
  const [reconciliation, setReconciliation] =
    useState<SalaryReconciliationResponse>(defaultReconciliation);
  const deleteLog = async (index: number) => {
    const id = salaries!.items[index].id;
    const res = await deleteOne(Api.integration_payment, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IIntegrationPayment) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const userMap = useMemo(
    () => new Map(users.items.map((b) => [b.id, b])),
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

  const userFormatter = (data: ListType<IntegrationPayment>) => {
    const items: IntegrationPayment[] = data.items.map((item) => {
      const user = userMap.get(item.artist_id);

      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });
    setSalaries({ items, count: data.count });
  };
  const mapReconciliationItems = (items: SalaryReconciliationItem[]) => {
    return items.map((item) => {
      const user = userMap.get(item.artist_id);
      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });
  };
  const refreshReconciliation = async () => {
    const params = getFilterParams();
    const res = await find<SalaryReconciliationItem>(
      Api.integration,
      { ...params, limit: -1 } as any,
      "reconciliation",
    );
    const payload =
      (res.data as unknown as SalaryReconciliationResponse) ??
      defaultReconciliation;
    setReconciliation({
      ...defaultReconciliation,
      ...payload,
      items: mapReconciliationItems(payload.items ?? []),
      summary: {
        ...defaultReconciliation.summary,
        ...(payload.summary ?? {}),
      },
    });
  };

  useEffect(() => {
    userFormatter(data);
  }, [data]);
  const columns = getColumns(edit, deleteLog);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const { from, to, artist_id } = getFilterParams();
    await fetcher<IntegrationPayment>(Api.integration_payment, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      from,
      to,
      artist_id,
      ...pg,
    }).then((d) => {
      userFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  useEffect(() => {
    void refresh({});
    void refreshReconciliation();
  }, [reportFilter]);
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as SalaryType;
    const { edit, ...payload } = body;

    const res = edit
      ? await updateOne<IIntegrationPayment>(
          Api.integration_payment,
          edit ?? "",
          payload as unknown as IIntegrationPayment,
        )
      : await create<IIntegrationPayment>(
          Api.integration_payment,
          e as IIntegrationPayment,
        );
    if (res.success) {
      refresh();
      setOpen(false);
      showToast("info", edit ? "Амжилттай засварлалаа" : "Амжилттай нэмлээ");
      form.reset({});
    } else {
      showToast("error", res.error ?? "Алдаа гарлаа");
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    const error = Object.entries(e as any)
      .map(([er, v], i) => {
        if ((v as any)?.message) {
          return (v as any)?.message;
        }
        const value = VALUES[er];
        return i == 0 ? firstLetterUpper(value) : value;
      })
      .join(", ");
    showToast("info", error);
  };
  const downloadExcel = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
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
        `salary_${mnDate().toISOString().slice(0, 10)}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      showToast("error", res.message);
    }
    console.log(res);
    setAction(ACTION.DEFAULT);
  };
  const clearReportFilter = () => {
    setReportFilter({
      date: undefined,
      artist_id: undefined,
    });
  };
  return (
    <div className="">
      <DynamicHeader />

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

        <div className="bg-white rounded-2xl shadow-light border-light p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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
                  {money(String(reconciliation.summary.income_amount ?? 0), "₮")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Нийт шилжүүлсэн</p>
                <p className="text-sm font-semibold">
                  {money(
                    String(reconciliation.summary.transferred_amount ?? 0),
                    "₮",
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Үлдэгдэл</p>
                <p className="text-sm font-semibold">
                  {money(
                    String(reconciliation.summary.balance_amount ?? 0),
                    "₮",
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артист</TableHead>
                  <TableHead>Үйлчилгээний тоо</TableHead>
                  <TableHead>Орлого</TableHead>
                  <TableHead>Шилжүүлсэн</TableHead>
                  <TableHead>Үлдэгдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliation.items.length > 0 ? (
                  reconciliation.items.map((item) => (
                    <TableRow key={item.artist_id}>
                      <TableCell className="font-medium">
                        {item.user_name || "-"}
                      </TableCell>
                      <TableCell>{item.order_count}</TableCell>
                      <TableCell>
                        {money(String(item.income_amount ?? 0), "₮")}
                      </TableCell>
                      <TableCell>
                        {money(String(item.transferred_amount ?? 0), "₮")}
                      </TableCell>
                      <TableCell>
                        {money(String(item.balance_amount ?? 0), "₮")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-500 py-8"
                    >
                      Сонгосон хугацаанд тооцооны мэдээлэл алга байна.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DataTable
          columns={columns}
          count={salaries?.count}
          data={salaries?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          excel={downloadExcel}
          modalAdd={
            <Modal
              maw="xl"
              name={"Цалин нэмэх"}
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(v) => {
                setOpen(v);
                form.reset(defaultValues);
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="divide-y">
                  <div className="double-col">
                    <FormItems
                      label="Статус"
                      control={form.control}
                      name="type"
                      className={"col-span-1"}
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={getEnumValues(PaymentType).map((item) => {
                              return {
                                value: item.toString(),
                                label: PaymentTypeValues[item],
                              };
                            })}
                          />
                        );
                      }}
                    </FormItems>
                    <FormItems
                      label="Нэр"
                      control={form.control}
                      name="artist_id"
                      className={"col-span-1"}
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={users.items.map((item) => {
                              return {
                                value: item.id,
                                label: usernameFormatter(item),
                              };
                            })}
                          />
                        );
                      }}
                    </FormItems>
                    <FormItems
                      label="Төлсөн огноо"
                      control={form.control}
                      name="paid_at"
                    >
                      {(field) => {
                        return (
                          <DatePicker
                            name=""
                            mode="single"
                            pl="Огноо сонгох"
                            value={field.value as any}
                            onChange={(e) => field.onChange(e)}
                          />
                        );
                      }}
                    </FormItems>
                    <FormItems
                      label="Төлсөн дүн"
                      control={form.control}
                      name="amount"
                    >
                      {(field) => {
                        return (
                          <TextField
                            props={{
                              ...field,
                            }}
                            type={INPUT_TYPE.MONEY}
                          />
                        );
                      }}
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
