"use client";

import { DataTable } from "@/components/data-table";
import {
  Branch,
  Brand,
  Category,
  IProduct,
  IProductTransaction,
  Product,
  ProductTransaction,
  User,
} from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  getValuesProductTransactionStatus,
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
import { getColumns } from "./columns";
import { ProductTransactionStatus } from "@/lib/enum";
import { objectCompact, usernameFormatter } from "@/lib/functions";
import ContainerHeader from "@/components/containerHeader";
import DynamicHeader from "@/components/dynamicHeader";
import { FilterPopover } from "@/components/layout/popover";
import { Checkbox } from "@radix-ui/react-checkbox";

const formSchema = z.object({
  branch_id: z.string().min(1),
  product_id: z.string().min(1),
  user_id: z.string().nullable().optional(),
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,

  edit: z.string().nullable().optional(),
  product_transaction_status: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(ProductTransactionStatus).nullable()
    )
    .optional() as unknown as number,
});
type TransactionType = z.infer<typeof formSchema>;
type FilterType = {
  product?: string;
  user?: string;
  branch?: string;
  status?: number;
};
const defaultValues = {
  branch_id: undefined,
  edit: undefined,
  product_id: undefined,
  product_transaction_status: undefined,
  quantity: undefined,
  user_id: undefined,
};
export const ProductTransactionPage = ({
  data,
  users,
  branches,
  products,
}: {
  data: ListType<ProductTransaction>;
  users: ListType<User>;
  branches: ListType<Branch>;
  products: ListType<Product>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<TransactionType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [transactions, setTransactions] =
    useState<ListType<IProductTransaction> | null>(null);
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items]
  );
  const userMap = useMemo(
    () => new Map(users.items.map((u) => [u.id, u])),
    [users.items]
  );
  const productMap = useMemo(
    () => new Map(products.items.map((p) => [p.id, p])),
    [products.items]
  );
  const transactionFormatter = (data: ListType<ProductTransaction>) => {
    const items: IProductTransaction[] = data.items.map((item) => {
      const branch = branchMap.get(item.branch_id);
      const user = userMap.get(item.user_id);
      const product = productMap.get(item.product_id);

      return {
        ...item,
        branch_name: branch?.name ?? "",
        user_name: user ? usernameFormatter(user) : "",
        product_name: product?.name ?? "",
      };
    });

    setTransactions({ items, count: data.count });
  };
  useEffect(() => {
    transactionFormatter(data);
  }, [data]);
  const deleteProduct = async (index: number) => {
    const id = transactions!.items[index].id;
    const res = await deleteOne(Api.product_transaction, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IProductTransaction) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteProduct);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<ProductTransaction>(Api.product_transaction_admin, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
    }).then((d) => {
      transactionFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as TransactionType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<IProductTransaction>(
          Api.product_transaction,
          edit ?? "",
          payload as IProductTransaction
        )
      : await create<IProductTransaction>(
          Api.product_transaction,
          e as IProductTransaction
        );
    if (res.success) {
      refresh();
      setOpen(false);
      form.reset(defaultValues);
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
        user_id: filter?.user,
        product_id: filter?.product,
        product_transaction_status: filter?.status,
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
          key: "user",
          label: "Артист",
          items: users.items.map((b) => ({
            value: b.id,
            label: usernameFormatter(b),
          })),
        },
        {
          key: "product",
          label: "Бүтээгдэхүүн",
          items: products.items.map((b) => ({ value: b.id, label: b.name })),
        },
        {
          key: "status",
          label: "Статус",
          items: getEnumValues(ProductTransactionStatus).map((s) => ({
            value: s,
            label: getValuesProductTransactionStatus[s],
          })),
        },
      ],
      [branches.items]
    );
  return (
    <div className="">
      <DynamicHeader count={transactions?.count} />

      <div className="admin-container">
        <DataTable
          clear={() => setFilter(undefined)}
          filter={
            <div className="inline-flex gap-3 w-full flex-wrap">
              {groups.map((item, i) => {
                const { key } = item;
                return (
                  <FilterPopover
                    content={item.items.map((it, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={filter?.[key] == it.value}
                          onCheckedChange={() => changeFilter(key, it.value)}
                        />
                        <span>{it.label as string}</span>
                      </label>
                    ))}
                    value={
                      filter?.[key]
                        ? item.items.filter(
                            (item) => item.value == filter[key]
                          )[0].label
                        : undefined
                    }
                    label={item.label}
                  />
                );
              })}
            </div>
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
              title="Барааны хэрэглээ"
              name={"Бараа нэмэх" + transactions?.count}
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              reset={() => {
                setOpen(false);
                form.reset(defaultValues);
              }}
              setOpen={setOpen}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormItems
                    label="Салбар"
                    control={form.control}
                    name="branch_id"
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
                    label="Ажилтан"
                    control={form.control}
                    name="user_id"
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
                    label="Бүтээгдэхүүн"
                    control={form.control}
                    name="product_id"
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
                  <FormItems
                    label="Төлөв"
                    control={form.control}
                    name="product_transaction_status"
                  >
                    {(field) => {
                      return (
                        <ComboBox
                          props={{ ...field }}
                          items={getEnumValues(ProductTransactionStatus).map(
                            (item) => {
                              return {
                                value: item.toString(),
                                label: getValuesProductTransactionStatus[item],
                              };
                            }
                          )}
                        />
                      );
                    }}
                  </FormItems>
                  {[
                    {
                      key: "quantity",
                      type: "number",
                      label: "Тоо ширхэг",
                    },
                    // {
                    //   key: "price",
                    //   type: "number",
                    //   label: "Үнэ",
                    // },
                    // {
                    //   key: "total_amount",
                    //   type: "number",
                    //   label: "Нийт үнэ",
                    // },
                  ].map((item, i) => {
                    const name = item.key as keyof TransactionType;
                    const label = item.label as keyof TransactionType;
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
                              type={item.type}
                              label={label}
                            />
                          );
                        }}
                      </FormItems>
                    );
                  })}
                  <FormItems
                    label="Бараа"
                    control={form.control}
                    name="product_id"
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
              </FormProvider>
            </Modal>
          }
        />
        {action}
      </div>
      {/* <ProductDialog
        editingProduct={editingProduct}
        onChange={onChange}
        save={handleSave}
      /> */}
    </div>
  );
};
