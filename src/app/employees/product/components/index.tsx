"use client";
import { DataTable } from "@/components/data-table";
import { ACTION, DEFAULT_PG, getEnumValues, getValuesUserProductStatus, ListType, Option, PG } from "@/lib/constants";
import { useEffect, useMemo, useState } from "react";
import { UserProductStatus } from "@/lib/enum";
import z from "zod";

import { Api } from "@/utils/api";
import { fetcher } from "@/hooks/fetcher";
import { Branch, Brand, IUserProduct, Product, User, UserProduct } from "@/models";
import { getColumns } from "./columns";
import DynamicHeader from "@/components/dynamicHeader";
import { create, deleteOne, updateOne } from "@/app/(api)";
import { objectCompact, usernameFormatter } from "@/lib/functions";
import { FormItems } from "@/shared/components/form.field";
import { Modal } from "@/shared/components/modal";
import { TextField } from "@/shared/components/text.field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { ComboBox } from "@/shared/components/combobox";
import { showToast } from "@/shared/components/showToast";

type FilterType = {
  branch?: string;
  user?: string;
  product?: string;
  status?: number;
};

const formSchema = z.object({
  user_id: z.string().min(1),
  product_id: z.string().min(1),
  product_name: z.string().nullable().optional(),
  user_name: z.string().nullable().optional(),
  quantity: z.preprocess((val) => (typeof val === "string" ? parseFloat(val) : val), z.number()) as unknown as number,
  user_product_status: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.nativeEnum(UserProductStatus).nullable()).optional() as unknown as number,
  edit: z.string().nullable().optional(),
});
const defaultValues: UserProductType = {
  user_id: "",
  product_id: "",
  product_name: "",
  user_name: "",
  quantity: 0,
  user_product_status: UserProductStatus.Active,
  edit: undefined,
};
type UserProductType = z.infer<typeof formSchema>;
export const EmployeeProductPage = ({ data, products, branches, users, brands }: { data: ListType<UserProduct>; brands: ListType<Brand>; branches: ListType<Branch>; users: ListType<User>; products: ListType<Product> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<boolean | undefined>(false);
  const form = useForm<UserProductType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [userProduct, setUserProduct] = useState<ListType<UserProduct>>(data);

  const productMap = useMemo(() => new Map(products.items.map((p) => [p.id, p])), [products.items]);

  const userProductFormatter = (data: ListType<UserProduct>) => {
    const items: UserProduct[] = data.items.map((item) => {
      const product = productMap.get(item.product_id);
      return {
        ...item,
        brand_name: product?.brand_name ?? "-",
      };
    });
    setUserProduct({ items, count: data.count });
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const { edit, ...body } = form.getValues();
    let payload = body;

    const res = edit ? await updateOne<UserProduct>(Api.user_product, edit as string, payload as UserProduct) : await create(Api.user_product, { items: [payload as UserProduct] });
    if (res.success) {
      refresh();

      showToast("success", edit ? "Мэдээлэл засагдсан." : "Амжилттай нэмлээ.");
      setOpen(false);
      form.reset(defaultValues);
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);

    // setSuccess(false);
  };

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<UserProduct>(Api.user_product, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
    }).then((d) => {
      userProductFormatter(d);
      // form.reset(undefined);
    });
    setAction(ACTION.DEFAULT);
  };
  const edit = (e: IUserProduct) => {
    setOpen(true);
    form.reset({
      edit: e.id,
      product_id: e.product_id,
      product_name: e.product_name,
      quantity: e.quantity,
      user_id: e.user_id,
      user_product_status: e.user_product_status,
      user_name: e.user_name,
    });
  };
  const setStatus = async (index: number, status: number) => {
    const res = await updateOne(Api.user_product, userProduct.items[index].id, {
      user_product_status: status,
    });
    res.success ? showToast("success", "Амжилттай шинэчлэгдлээ.") : showToast("error", res.error ?? "");
    refresh();
  };
  const deleteUserProduct = async (index: number) => {
    const id = userProduct!.items[index].id;
    const res = await deleteOne(Api.user_product, id);
    refresh();
    return res.success;
  };
  const columns = getColumns(edit, setStatus, deleteUserProduct);
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
        user_product_status: filter?.status,
        page: 0,
      })
    );
  }, [filter]);
  const groups: { key: keyof FilterType; label: string; items: Option[] }[] = useMemo(
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
        items: getEnumValues(UserProductStatus).map((s) => ({
          value: s,
          label: getValuesUserProductStatus[s].name,
        })),
      },
    ],
    [branches.items]
  );

  return (
    <div className="relative w-full">
      <DynamicHeader count={data.count} />

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
                  //       <span className="">{it.label as string}</span>
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
            </>
          }
          columns={columns}
          data={userProduct.items}
          refresh={refresh}
          loading={action === ACTION.RUNNING}
          count={userProduct.count}
          modalAdd={
            <Modal
              maw="md"
              name={"Бүтээгдэхүүн олгох"}
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(v) => {
                setOpen(v);
                form.reset(defaultValues);
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                  <FormItems label="Ажилтан" control={form.control} name="user_id" className="pb-5 border-b">
                    {(field) => {
                      return (
                        <ComboBox
                          search={true}
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
                  <div className="space-y-4 pt-5">
                    <FormItems label="Бүтээгдэхүүн" control={form.control} name="product_id">
                      {(field) => {
                        return (
                          <ComboBox
                            search={true}
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
                    <FormItems control={form.control} name={"quantity"} className={"col-span-2"}>
                      {(field) => {
                        return <TextField props={{ ...field }} type={"number"} label={"Тоо ширхэг"} />;
                      }}
                    </FormItems>
                    <FormItems control={form.control} name={"user_product_status"} label="Төлөв" className={"col-span-2"}>
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={getEnumValues(UserProductStatus).map((item) => {
                              return {
                                value: item.toString(),
                                label: getValuesUserProductStatus[item].name,
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
      </div>
    </div>
  );
};
