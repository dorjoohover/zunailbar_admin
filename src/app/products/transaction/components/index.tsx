"use client";
import { DataTable } from "@/components/data-table";
import {
  Branch,
  IProductTransaction,
  Product,
  ProductTransaction,
  User } from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  Option,
  SearchType,
  VALUES,
  ZValidator } from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api, API } from "@/utils/api";
import {
  create,
  deleteOne,
  excel,
  findRaw,
  search,
  updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { INPUT_TYPE, ROLE, UserStatus } from "@/lib/enum";
import {
  dateOnly,
  firstLetterUpper,
  mnDate,
  money,
  objectCompact,
  parseDate,
  searchProductFormatter,
  searchUsernameFormatter } from "@/lib/functions";
import DynamicHeader from "@/components/dynamicHeader";
import { showToast } from "@/shared/components/showToast";
import { DatePicker } from "@/shared/components/date.picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const formSchema = z.object({
  branch_id: ZValidator.branch,
  product_id: ZValidator.product,
  user_id: z.string().nullable().optional(),
  date: z
    .preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date(),
    )
    .optional() as unknown as Date,
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number(),
  ) as unknown as number,
  unit_price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative(),
  ) as unknown as number,
  total_amount: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative(),
  ) as unknown as number,
  edit: z.string().nullable().optional() });
type TransactionType = z.infer<typeof formSchema>;
type FilterType = {
  product?: string;
  user?: string;
  branch?: string;
  start?: Date;
  end?: Date;
};
const defaultValues: TransactionType = {
  branch_id: "",
  edit: undefined,
  product_id: "",
  date: mnDate() as any,
  quantity: 0,
  unit_price: 0,
  total_amount: 0,
  user_id: "" };
export const ProductTransactionPage = ({
  data,
  users,
  branches,
  products }: {
  data: ListType<ProductTransaction>;
  users: SearchType<User>[];
  branches: ListType<Branch>;
  products: SearchType<Product>[];
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<TransactionType>({
    resolver: zodResolver(formSchema),
    defaultValues });
  const [transactions, setTransactions] =
    useState<ListType<IProductTransaction> | null>(null);
  const [summaryTotal, setSummaryTotal] = useState<number>(0);
  const [lastPrices, setLastPrices] = useState<
    Array<{ date: string; unit_price: number; quantity: number }>
  >([]);

  const productId = form.watch("product_id");
  const quantity = form.watch("quantity");
  const unit_price = form.watch("unit_price");
  useEffect(() => {
    const total = Number(quantity ?? 0) * Number(unit_price ?? 0);
    if (!Number.isNaN(total)) {
      form.setValue("total_amount", total);
    }
  }, [quantity, unit_price]);

  useEffect(() => {
    if (!productId) {
      setLastPrices([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await findRaw<any[]>(
          Api.product_transaction,
          {},
          `purchase-prices/${productId}`,
        );
        if (!cancelled) {
          setLastPrices(
            (res.data ?? []).map((r: any) => ({
              date: r.date ?? "",
              unit_price: Number(r.unit_price ?? 0),
              quantity: Number(r.quantity ?? 0) })),
          );
        }
      } catch {
        if (!cancelled) setLastPrices([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const transactionFormatter = (data: any) => {
    const items: IProductTransaction[] = (data?.items ?? []).map(
      (item: any) => ({
        ...item }),
    );
    setTransactions({ items, count: data?.count ?? 0 });
    setSummaryTotal(Number(data?.summary?.total ?? 0));
  };
  useEffect(() => {
    transactionFormatter(data);
  }, [data]);

  const refreshProducts = async () => {
    const res = await search<Product>(Api.product, { limit: 20, page: 0 });
    if (res?.data) {
      setItems((prev) => ({ ...prev, [Api.product]: res.data }));
    }
  };
  const deleteProduct = async (index: number) => {
    const id = transactions!.items[index].id;
    const res = await deleteOne(Api.product_transaction, id);
    refresh();
    refreshProducts();
    return res.success;
  };
  const edit = async (e: IProductTransaction) => {
    setOpen(true);
    form.reset({
      branch_id: e.branch_id ?? "",
      product_id: e.product_id ?? "",
      user_id: e.user_id ?? "",
      date: (e.date ? new Date(e.date as any) : mnDate()) as any,
      quantity: Number(e.quantity ?? 0),
      unit_price: Number((e as any).price ?? e.unit_price ?? 0),
      total_amount: Number(e.total_amount ?? 0),
      edit: e.id });
  };
  const columns = getColumns(edit, deleteProduct);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const branch_id = filter?.branch;
    const user_id = filter?.user;
    const product_id = filter?.product;
    const start_date = filter?.start ? dateOnly(filter.start) : undefined;
    const end_date = filter?.end ? dateOnly(filter.end) : undefined;
    await fetcher<ProductTransaction>(Api.product_transaction_admin, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      branch_id,
      user_id,
      product_id,
      start_date,
      end_date }).then((d) => {
      transactionFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as TransactionType;
    const { edit, ...payload } = body;
    const submitPayload: any = {
      ...payload,
      user_id: payload.user_id || null,
      date: payload.date ? dateOnly(payload.date as Date) : undefined };
    const res = edit
      ? await updateOne<IProductTransaction>(
          Api.product_transaction,
          edit ?? "",
          submitPayload,
        )
      : await create<IProductTransaction>(
          Api.product_transaction,
          submitPayload,
        );
    if (res.success) {
      refresh();
      // Бүтээгдэхүүний үлдэгдэл өөрчлөгдсөн тул combobox-ны items-ыг шинэчлэх.
      refreshProducts();
      setOpen(false);
      form.reset(defaultValues);
      showToast(
        "success",
        edit ? "Шинэчлэгдлээ!" : "Амжилттай нэмлээ!",
      );
    } else {
      showToast("error", res.error ?? "");
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

  const [filter, setFilter] = useState<FilterType>();
  const [searchState, setSearchState] = useState<
    Partial<Record<keyof FilterType, string>>
  >({});
  const changeFilter = (key: string, value: any) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    refresh(
      objectCompact({
        branch_id: filter?.branch,
        user_id: filter?.user,
        product_id: filter?.product,
        start_date: filter?.start ? dateOnly(filter.start) : undefined,
        end_date: filter?.end ? dateOnly(filter.end) : undefined,
        page: 0 }) as PG,
    );
  }, [filter]);

  const groups: {
    key: keyof FilterType;
    label: string;
    items: Option[];
    search?: boolean;
  }[] = useMemo(
    () => [
      {
        key: "branch",
        label: "Салбар",
        items: branches.items.map((b) => ({ value: b.id, label: b.name })) },
      {
        key: "user",
        label: "Артист",
        items: users.map((b) => ({
          value: b.id,
          label: searchUsernameFormatter(b.value) })) },
      {
        key: "product",
        label: "Бүтээгдэхүүн",
        search: true,
        items: products.map((b) => ({
          value: b.id,
          label: searchProductFormatter(b.value) ?? "" })) },
    ],
    [branches.items, users, products],
  );

  const [items, setItems] = useState({
    [Api.product]: products,
    [Api.user]: users });
  const searchField = async (v: string, key: Api, edit?: boolean) => {
    let value = "";
    if (v.length > 1) value = v;
    if (v.length == 1) return;
    const payload =
      key === Api.product
        ? { id: value }
        : edit === undefined
          ? {
              id: value,
              role: ROLE.E_M,
              user_status: UserStatus.ACTIVE }
          : {
              role: ROLE.E_M,
              user_status: UserStatus.ACTIVE,
              value: v };
    await search(key as any, {
      ...payload,
      limit: 20,
      page: 0 }).then((d) => {
      setItems((prev) => ({
        ...prev,
        [key]: d.data }));
    });
  };

  const downloadExcel = async () => {
    setAction(ACTION.RUNNING);
    const start_date = filter?.start ? dateOnly(filter.start) : undefined;
    const end_date = filter?.end ? dateOnly(filter.end) : undefined;
    const res = await excel(Api.product_transaction_admin, {
      branch_id: filter?.branch,
      user_id: filter?.user,
      product_id: filter?.product,
      start_date,
      end_date,
      limit: -1 });
    if (res.success && res.data) {
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `product_transaction_${(mnDate() as Date)
          .toISOString()
          .slice(0, 10)}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      showToast("error", res.message ?? "Excel татаж чадсангүй");
    }
    setAction(ACTION.DEFAULT);
  };

  return (
    <div>
      <DynamicHeader count={transactions?.count} />
      <div className="admin-container">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="text-sm">
            <span className="text-slate-500 mr-2">Нийт зардлын дүн:</span>
            <span className="font-bold text-base">
              {money(String(summaryTotal))}₮
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadExcel}
            disabled={action === ACTION.RUNNING}
            className="gap-2"
          >
            <Download className="size-4" />
            Excel татах
          </Button>
        </div>
        <DataTable
          clear={() => setFilter(undefined)}
          filter={
            <>
              {groups.map((item, i) => {
                const { key } = item;
                const filteredItems = item.search
                  ? item.items.filter((it) =>
                      it.label
                        .toLowerCase()
                        .includes(
                          (searchState[key] || "").toLowerCase(),
                        ),
                    )
                  : item.items;
                return (
                  <label key={i}>
                    <span className="filter-label">{item.label}</span>
                    <ComboBox
                      pl={item.label}
                      name={item.label}
                      className="max-w-36 text-xs!"
                      value={
                        filter?.[key] ? String(filter[key]) : ""
                      }
                      items={filteredItems.map((it) => ({
                        value: String(it.value),
                        label: it.label as string }))}
                      search={
                        item.search
                          ? (searchValue: string) => {
                              setSearchState((prev) => ({
                                ...prev,
                                [key]: searchValue }));
                            }
                          : undefined
                      }
                      props={{
                        value: filter?.[key]
                          ? String(filter[key])
                          : "",
                        onChange: (val: string) =>
                          changeFilter(key, val),
                        onBlur: () => {},
                        name: key,
                        ref: () => {} }}
                    />
                  </label>
                );
              })}
              <label>
                <span className="filter-label">Эхлэл</span>
                <DatePicker
                  pl="Эхлэх"
                  mode="single"
                  value={filter?.start}
                  onChange={(v) => changeFilter("start", v)}
                />
              </label>
              <label>
                <span className="filter-label">Төгсгөл</span>
                <DatePicker
                  pl="Дуусах"
                  mode="single"
                  value={filter?.end}
                  onChange={(v) => changeFilter("end", v)}
                />
              </label>
            </>
          }
          columns={columns}
          count={transactions?.count}
          data={transactions?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              maw="xl"
              name="Хэрэглээ нэмэх"
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(v) => {
                setOpen(v);
                form.reset(defaultValues);
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="space-y-3">
                  <div className="double-col">
                    <FormItems
                      label="Салбар"
                      control={form.control}
                      name="branch_id"
                    >
                      {(field) => (
                        <ComboBox
                          className="w-full"
                          props={{ ...field }}
                          items={branches.items.map((item) => ({
                            value: item.id,
                            label: item.name }))}
                        />
                      )}
                    </FormItems>
                    <FormItems
                      label="Ажилтан (заавал биш)"
                      control={form.control}
                      name="user_id"
                    >
                      {(field) => (
                        <ComboBox
                          search={(e) => searchField(e, Api.user)}
                          props={{ ...field }}
                          items={items[Api.user].map((item) => ({
                            value: item.id,
                            label: searchUsernameFormatter(item.value) }))}
                        />
                      )}
                    </FormItems>
                  </div>
                  <div className="col-span-full">
                    <FormItems
                      label="Бүтээгдэхүүн"
                      control={form.control}
                      name="product_id"
                    >
                      {(field) => (
                        <ComboBox
                          search={(e) => searchField(e, Api.product)}
                          props={{ ...field }}
                          items={items[Api.product].map((item) => ({
                            value: item.id,
                            label: searchProductFormatter(item.value) }))}
                        />
                      )}
                    </FormItems>
                    {lastPrices.length > 0 && (
                      <div className="mt-2 rounded-lg bg-slate-50 border p-2 text-xs space-y-1">
                        <div className="font-semibold text-slate-700">
                          Сүүлийн худалдан авалтын үнэ
                        </div>
                        {lastPrices.map((p, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-slate-500">
                              {p.date
                                ? parseDate(new Date(p.date), false)
                                : "-"}
                            </span>
                            <span>
                              {p.quantity > 0 ? `${p.quantity} ширхэг — ` : ""}
                              <span className="font-semibold text-slate-700">
                                {money(String(p.unit_price))}₮
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="double-col">
                    <FormItems label="Огноо" control={form.control} name="date">
                      {(field) => (
                        <DatePicker
                          pl="Огноо сонгох"
                          mode="single"
                          value={field.value as Date | undefined}
                          onChange={(v) => field.onChange(v)}
                        />
                      )}
                    </FormItems>
                    <FormItems
                      label="Тоо ширхэг"
                      control={form.control}
                      name="quantity"
                    >
                      {(field) => (
                        <TextField props={{ ...field }} type={INPUT_TYPE.NUMBER} />
                      )}
                    </FormItems>
                  </div>
                  <div className="double-col">
                    <FormItems
                      label="Нэгжийн өртөг"
                      control={form.control}
                      name="unit_price"
                    >
                      {(field) => (
                        <TextField props={{ ...field }} type={INPUT_TYPE.NUMBER} />
                      )}
                    </FormItems>
                    <FormItems
                      label="Нийт дүн"
                      control={form.control}
                      name="total_amount"
                    >
                      {(field) => (
                        <TextField props={{ ...field }} type={INPUT_TYPE.NUMBER} />
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
