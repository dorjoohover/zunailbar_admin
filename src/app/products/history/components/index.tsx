"use client";
import { DataTable } from "@/components/data-table";
import { IProductLog, Product, ProductLog } from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  getValuesProductLogStatus,
  Option,
  VALUES,
  SearchType,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, search, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { CategoryType, ProductLogStatus } from "@/lib/enum";
import { DatePicker } from "@/shared/components/date.picker";
import DynamicHeader from "@/components/dynamicHeader";
import {
  dateOnly,
  firstLetterUpper,
  objectCompact,
  searchProductFormatter,
} from "@/lib/functions";
import { FilterPopover } from "@/components/layout/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/shared/components/showToast";

const formSchema = z
  .object({
    product_id: z.string().min(1),

    quantity: z.preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number()
    ) as unknown as number,
    price: z.preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number()
    ) as unknown as number,
    currency: z.string().min(1),
    total_amount: z.preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number()
    ) as unknown as number,
    paid_amount: z.preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number()
    ) as unknown as number,
    cargo: z.preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number()
    ) as unknown as number,
    currency_amount: z.preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number()
    ) as unknown as number,
    edit: z.string().nullable().optional(),
    date: z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date()
    ) as unknown as Date,
  })
  .refine((data) => (data?.paid_amount ?? 0) <= (data?.total_amount ?? 0), {
    message: "Төлсөн дүн нийт дүнгээс хэтэрч болохгүй",
    path: ["paid_amount"], // алдаа paid_amount дээр харагдана
  });
const defaultValues = {
  currency: "cny",
  currency_amount: 500,
  product_id: "",
  cargo: "",
  quantity: "",
  total_amount: 0,
  paid_amount: "",
  date: "",
  product_log_status: ProductLogStatus.Bought,
};
type FilterType = {
  product?: string;
  status?: number;
  start?: Date;
  end?: Date;
};

type LogType = z.infer<typeof formSchema>;
export const ProductHistoryPage = ({
  data,
  products,
}: {
  data: ListType<ProductLog>;
  products: SearchType<Product>[];
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<LogType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [transactions, setTransactions] =
    useState<ListType<IProductLog> | null>(null);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p.value])),
    [products]
  );

  const logFormatter = (data: ListType<ProductLog>) => {
    const items: IProductLog[] = data.items.map((item) => {
      const product = productMap.get(item.product_id);

      return {
        ...item,
        product_name: searchProductFormatter(product ?? "") ?? "",
      };
    });

    setTransactions({ items, count: data.count });
  };
  useEffect(() => {
    logFormatter(data);
  }, [data]);
  const deleteLog = async (index: number) => {
    const id = transactions!.items[index].id;
    const res = await deleteOne(Api.product_log, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IProductLog) => {
    setOpen(true);

    const cargo = Math.abs(Math.round(+e.total_amount - e.quantity * e.price));

    form.reset({
      ...e,
      price: e.price / (e.currency_amount ?? 1),
      quantity: e.quantity,
      currency_amount: e.currency_amount,
      cargo: cargo < 1000 ? 0 : cargo,
      total_amount: +e.total_amount,
      edit: e.id,
    });
  };
  const setStatus = async (index: number, status: number) => {
    if (transactions?.items != null) {
      await updateOne(Api.product_log, transactions?.items[index].id, {
        product_log_status: status,
      });
      refresh();
    }
  };
  const columns = getColumns(edit, deleteLog, setStatus);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<ProductLog>(Api.product_log, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
      //   name: pg.filter,
    }).then((d) => {
      console.log(d);
      logFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as LogType;
    let { edit, cargo, ...payload } = body;
    payload = {
      ...payload,
      price: Math.round(
        +(payload.total_amount ?? 0) / +(payload.quantity ?? 1)
      ),
      total_amount: Math.round(+(payload.total_amount ?? 0)),
    };

    const res = edit
      ? await updateOne<IProductLog>(
          Api.product_log,
          edit ?? "",
          payload as unknown as IProductLog
        )
      : await create<IProductLog>(
          Api.product_log,
          payload as unknown as IProductLog
        );
    if (res.success) {
      refresh();
      setOpen(false);
      form.reset(defaultValues);
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    const error =
      Object.keys(e as any)
        .map((er, i) => {
          const value = VALUES[er];
          return i == 0 ? firstLetterUpper(value) : value;
        })
        .join(", ") + "оруулна уу!";
    showToast("info", error);
  };
  const qty = form.watch("quantity") ?? 0;
  const price = form.watch("price") ?? 0;
  const currency = form.watch("currency_amount") ?? 0;
  const cargo = form.watch("cargo") ?? 0;

  useEffect(() => {
    let total =
      (Number(qty) || 0) * (Number(price) || 0) * +(currency ?? 1) +
      +(cargo ?? 0);
    const paid = +(form.getValues("paid_amount") ?? 0);
    if (Math.abs(paid - total) < 100) total = paid;
    form.setValue("total_amount", total, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [qty, price, form, currency, cargo]);

  const [filter, setFilter] = useState<FilterType>();
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    refresh(
      objectCompact({
        product_id: filter?.product,
        product_log_status: filter?.status,
        start_date: filter?.start ? dateOnly(filter?.start) : undefined,
        end_date: filter?.end ? dateOnly(filter?.end) : undefined,

        page: 0,
      })
    );
  }, [filter]);
  const groups: { key: keyof FilterType; label: string; items: Option[] }[] =
    useMemo(
      () => [
        {
          key: "product",
          label: "Бүтээгдэхүүн",
          items: products.map((b) => ({
            value: b.id,
            label: searchProductFormatter(b.value),
          })),
        },

        {
          key: "status",
          label: "Статус",
          items: getEnumValues(ProductLogStatus).map((s) => ({
            value: s,
            label: getValuesProductLogStatus[s].name,
          })),
        },
      ],
      [products]
    );
  const [items, setItems] = useState({
    [Api.product]: products,
  });
  const searchField = async (v: string, key: Api, edit?: boolean) => {
    let value = "";
    if (v.length > 1) value = v;
    if (v.length == 1) return;

    const payload = { id: value, type: CategoryType.DEFAULT };

    await search(key as any, {
      ...payload,
      limit: 20,
      page: 0,
    }).then((d) => {
      console.log(key, d.data);
      setItems((prev) => ({
        ...prev,
        [key]: d.data,
      }));
    });
  };
  return (
    <div className="">
      <DynamicHeader count={transactions?.count} />

      <div className="admin-container">
        <DataTable
          clear={() => setFilter(undefined)}
          filter={
            <>
              {groups.map((item, i) => {
                const { key } = item;
                return (
                  // <FilterPopover
                  //   key={i}
                  //   content={item.items.map((it, index) => (
                  //     <label key={index} className="checkbox-label">
                  //       <Checkbox checked={filter?.[key] == it.value} onCheckedChange={() => changeFilter(key, it.value)} />
                  //       <span>{it.label as string}</span>
                  //     </label>
                  //   ))}
                  //   value={filter?.[key] ? item.items.filter((item) => item.value == filter[key])[0].label : undefined}
                  //   label={item.label}
                  // />
                  <label key={i}>
                    <span className="filter-label">{item.label as string}</span>
                    <ComboBox
                      pl={item.label}
                      name={item.label}
                      className="max-w-36 text-xs!"
                      value={filter?.[key] ? String(filter[key]) : ""} //
                      items={item.items.map((it) => ({
                        value: String(it.value),
                        label: it.label as string,
                      }))}
                      props={{
                        value: filter?.[key] ? String(filter[key]) : "",
                        onChange: (val: string) => changeFilter(key, val),
                        onBlur: () => {},
                        name: key,
                        ref: () => {},
                      }}
                    />
                  </label>
                );
              })}
              <FilterPopover
                content={
                  <div className="flex flex-col gap-2">
                    <Calendar
                      mode="single"
                      selected={filter?.start}
                      onSelect={(e) =>
                        setFilter((prev) => ({ ...prev, start: e }))
                      }
                    />
                  </div>
                }
                value={filter?.start?.toString()}
                label={"Эхлэх огноо"}
              />
              <FilterPopover
                content={
                  <div className="flex flex-col gap-2">
                    <Calendar
                      mode="single"
                      selected={filter?.end}
                      onSelect={(e) =>
                        setFilter((prev) => ({ ...prev, end: e }))
                      }
                    />
                  </div>
                }
                value={filter?.end?.toString()}
                label={"Дуусах огноо"}
              />
            </>
          }
          columns={columns}
          count={transactions?.count}
          data={transactions?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              // w="2xl"
              maw="xl"
              name="Худалдан авалт нэмэх"
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(v) => {
                setOpen(v);
                form.reset(defaultValues);
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="">
                  <FormItems
                    label="Бүтээгдэхүүн"
                    control={form.control}
                    name="product_id"
                  >
                    {(field) => {
                      return (
                        <ComboBox
                          search={(e) => searchField(e, Api.product)}
                          props={{ ...field }}
                          items={items[Api.product].map((item) => {
                            return {
                              value: item.id,
                              label: searchProductFormatter(item.value),
                            };
                          })}
                        />
                      );
                    }}
                  </FormItems>
                  <div className="divide-x-gray"></div>

                  <div className="double-col">
                    <div className="relative">
                      <FormItems
                        label="Currency Value"
                        control={form.control}
                        name="currency_amount"
                      >
                        {(field) => {
                          return (
                            <div className="relative">
                              <div className="relative h-10">
                                <Input
                                  onChange={(e) => field.onChange(e)}
                                  value={field.value as string | undefined}
                                  type="text"
                                  className="h-full pr-10"
                                />
                              </div>
                            </div>
                          );
                        }}
                      </FormItems>
                      <FormItems
                        control={form.control}
                        name="currency"
                        className="absolute bottom-0.5 right-0.5"
                      >
                        {(field) => {
                          return (
                            <Select
                              value={field.value as string | undefined}
                              onValueChange={(e) => field.onChange(e)}
                            >
                              <SelectTrigger className="text-xs font-semibold border-0">
                                <SelectValue placeholder="Currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="cny" defaultChecked={true}>
                                    CNY
                                  </SelectItem>
                                  <SelectItem value="mnt">MNT</SelectItem>
                                  <SelectItem value="krw">KRW</SelectItem>
                                  <SelectItem value="usd">USD</SelectItem>
                                  <SelectItem value="eur">EUR</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          );
                        }}
                      </FormItems>
                    </div>

                    {[
                      {
                        key: "cargo",
                        type: "money",
                        label: "Kargo",
                      },
                      {
                        key: "quantity",
                        type: "number",
                        label: "Тоо ширхэг",
                      },
                      // {
                      //   key: "currency",
                      //   label: "Currency",
                      // },
                      // {
                      //   key: "currency_value",
                      //   label: "Currency value",
                      //   type: "number",
                      // },
                      {
                        key: "price",
                        type: "number",
                        label: "Үнэ",
                      },

                      {
                        key: "total_amount",
                        type: "money",
                        label: "Нийт дүн",
                      },
                      {
                        key: "paid_amount",
                        type: "money",
                        label: "Төлсөн дүн",
                      },
                      // {
                      //   key: "total_amount",
                      //   type: "money",
                      //   label: "Нийт үнэ",
                      // },
                    ].map((item, i) => {
                      const name = item.key as keyof LogType;
                      const label = item.label as keyof LogType;
                      return (
                        <FormItems
                          control={form.control}
                          name={name}
                          key={i}
                          label={label}
                          className={item.key === "name" ? "col-span-2" : ""}
                        >
                          {(field) => {
                            return (
                              <TextField
                                props={{ ...field }}
                                type={item.type}
                              />
                            );
                          }}
                        </FormItems>
                      );
                    })}
                  </div>
                  <div className="divide-x-gray"></div>

                  <div className="double-col ">
                    <FormItems label="Огноо" control={form.control} name="date">
                      {(field) => {
                        return (
                          <DatePicker
                            name=""
                            pl="Огноо сонгох"
                            props={{ ...field }}
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
