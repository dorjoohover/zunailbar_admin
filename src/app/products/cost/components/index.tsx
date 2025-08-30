"use client";
import { DataTable } from "@/components/data-table";
import { Branch, Category, Cost, ICost, Product } from "@/models";
import { getColumns } from "./columns";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  ListDefault,
  getEnumValues,
  getValuesCostStatus,
  Option,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { CostStatus } from "@/lib/enum";
import { dateOnly, mnDate, objectCompact } from "@/lib/functions";
import DynamicHeader from "@/components/dynamicHeader";
import { FilterPopover } from "@/components/layout/popover";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Calendar } from "@/components/ui/calendar";

const formSchema = z.object({
  category_id: z.string().nullable().optional(),
  branch_id: z.string().min(1),
  product_id: z.string().min(1),
  date: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ) as unknown as Date,
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  cost_status: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(CostStatus).nullable()
    )
    .optional() as unknown as number,
  edit: z.string().nullable().optional(),
});
const defaultValues = {
  category_id: undefined,
  branch_id: "",
  product_id: "",
  date: mnDate(),
  price: 0,
  edit: undefined,
  cost_status: CostStatus.Paid,
};
type CostType = z.infer<typeof formSchema>;
type FilterType = {
  category?: string;
  branch?: string;
  product?: string;
  start?: Date;
  end?: Date;
  status?: number;
};
export const CostPage = ({
  data,
  products,
  branches,
  categories,
}: {
  data: ListType<Cost>;
  products: ListType<Product>;
  branches: ListType<Branch>;
  categories: ListType<Category>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<CostType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [costs, setCosts] = useState<ListType<Cost>>(ListDefault);
  const productMap = useMemo(
    () => new Map(products.items.map((b) => [b.id, b])),
    [products.items]
  );
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items]
  );

  const costFormatter = (data: ListType<Cost>) => {
    const items: Cost[] = data.items.map((item) => {
      const product = productMap.get(item.product_id);
      const branch = branchMap.get(item.branch_id);

      return {
        ...item,
        branch_name: branch?.name ?? "",
        product_name: product?.name ?? "",
      };
    });

    setCosts({ items, count: data.count });
  };
  useEffect(() => {
    costFormatter(data);
  }, [data]);
  const deleteProduct = async (index: number) => {
    const id = costs?.items?.[index]?.id ?? "";
    const res = await deleteOne(Api.product, id);
    refresh();
    return res.success;
  };
  const edit = async (e: ICost) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteProduct);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Cost>(Api.cost, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      name: pg.filter,
      ...pg,
    }).then((d) => {
      costFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as CostType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<ICost>(Api.cost, edit ?? "", payload as ICost)
      : await create<ICost>(Api.cost, e as ICost);
    if (res.success) {
      refresh();
      setOpen(false);
      form.reset({});
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
  };
  const [filter, setFilter] = useState<FilterType>();
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    refresh(
      objectCompact({
        branch_id: filter?.branch,
        category_id: filter?.category,
        product_id: filter?.product,
        user_product_status: filter?.status,
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
          key: "branch",
          label: "Салбар",
          items: branches.items.map((b) => ({ value: b.id, label: b.name })),
        },
        {
          key: "category",
          label: "Category",
          items: categories.items.map((b) => ({ value: b.id, label: b.name })),
        },

        {
          key: "product",
          label: "Бүтээгдэхүүн",
          items: products.items.map((b) => ({ value: b.id, label: b.name })),
        },
        {
          key: "status",
          label: "Статус",
          items: getEnumValues(CostStatus).map((s) => ({
            value: s,
            label: getValuesCostStatus[s],
          })),
        },
      ],
      [branches.items, categories.items, products.items]
    );
  return (
    <div className="">
      <DynamicHeader count={costs?.count} />

      <div className="admin-container">
        <DataTable
          clear={() => setFilter(undefined)}
          filter={
            <>
              {groups.map((item, i) => {
                const { key } = item;
                return (
                  // <FilterPopover
                  // key={i}
                  //   content={item.items.map((it, index) => (
                  //     <label
                  //       key={index}
                  //       className="checkbox-label"
                  //     >
                  //       <Checkbox
                  //         checked={filter?.[key] == it.value}
                  //         onCheckedChange={() => changeFilter(key, it.value)}
                  //       />
                  //       <span>{it.label as string}</span>
                  //     </label>
                  //   ))}
                  //   value={
                  //     filter?.[key]
                  //       ? item.items.filter(
                  //           (item) => item.value == filter[key]
                  //         )[0].label
                  //       : undefined
                  //   }
                  //   label={item.label}
                  // />
                    <label key={i}>
                    <span className="filter-label">{item.label as string}</span>
                    <ComboBox
                      pl={item.label}
                      name={item.label}
                      className="max-w-36 text-xs!"
                      search={true}
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
          count={costs?.count}
          data={costs?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              maw="xl"
              name="Зардал нэмэх"
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              reset={() => {
                setOpen(false);
                form.reset({});
              }}
              setOpen={(v) => setOpen(v)}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="divide-y">
                  <div className="grid gap-3 pb-5">
                    <FormItems
                      control={form.control}
                      name="product_id"
                      label="Зардал"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={products.items.map((item) => {
                              return {
                                value: item.id,
                                label: item.name,
                              };
                            })}
                          />
                        );
                      }}
                    </FormItems>
                  </div>
                  <div className="grid gap-3 py-5 double-col">
                    <FormItems
                      control={form.control}
                      name="branch_id"
                      label="Салбар"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={branches.items.map((item) => {
                              return {
                                value: item.id,
                                label: item.name,
                              };
                            })}
                          />
                        );
                      }}
                    </FormItems>
                    <FormItems
                      label="Төлөв"
                      control={form.control}
                      name="cost_status"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={getEnumValues(CostStatus).map((item) => {
                              return {
                                value: item.toString(),
                                label: getValuesCostStatus[item],
                              };
                            })}
                          />
                        );
                      }}
                    </FormItems>
                  </div>

                  <div className="grid gap-3 pt-5 double-col">
                    {[
                      {
                        key: "price",
                        label: "Үнэ",
                        type: "money",
                      },
                      {
                        key: "date",
                        label: "Огноо",
                        type: "date",
                      },
                    ].map((item, i) => {
                      const name = item.key as keyof CostType;
                      const label = item.label as keyof CostType;
                      return (
                        <FormItems
                          control={form.control}
                          name={name}
                          key={i}
                          className={item.key === "name" ? "col-span-2" : ""}
                        >
                          {(field) => {
                            return (
                              <TextField
                                props={{ ...field }}
                                label={label}
                                type={item.type}
                              />
                            );
                          }}
                        </FormItems>
                      );
                    })}
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
