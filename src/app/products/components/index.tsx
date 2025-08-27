"use client";
import { DataTable } from "@/components/data-table";
import { Brand, Category, IProduct, Product } from "@/models";
import { getColumns } from "./columns";
import { useEffect, useMemo, useState } from "react";
import { ListType, ACTION, PG, DEFAULT_PG, Option } from "@/lib/constants";
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
import { CategoryType } from "@/lib/enum";
import { showToast } from "@/shared/components/showToast";
import DynamicHeader from "@/components/dynamicHeader";
import { objectCompact } from "@/lib/functions";
import { FilterPopover } from "@/components/layout/popover";
import { Checkbox } from "@radix-ui/react-checkbox";

const formSchema = z.object({
  brand_id: z.string().nullable().optional(),
  category_id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  edit: z.string().nullable().optional(),
});

type FilterType = {
  brand?: string;
  category?: string;
};
type ProductType = z.infer<typeof formSchema>;
const defaultValues = {
  edit: undefined,
  branch_id: undefined,
  category_id: undefined,
  name: "",
  size: undefined,
  color: undefined,
};
export const ProductPage = ({
  data,
  categories,
  brands,
}: {
  data: ListType<Product>;
  categories: ListType<Category>;
  brands: ListType<Brand>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<ProductType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [products, setProducts] = useState<ListType<Product>>(data);
  const deleteProduct = async (index: number) => {
    const id = products.items[index].id;
    const res = await deleteOne(Api.product, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IProduct) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteProduct);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Product>(Api.product, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      name: pg.filter,
      type: CategoryType.DEFAULT,
      ...pg,
    }).then((d) => {
      console.log(d);
      setProducts(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as ProductType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<IProduct>(Api.product, edit ?? "", payload as IProduct)
      : await create<IProduct>(Api.product, e as IProduct);
    console.log(res);
    if (res.success) {
      refresh();
      setOpen(false);
      clear();
    }
    setAction(ACTION.DEFAULT);
    showToast("success", "Амжилттай хадгалагдлаа!");
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
    showToast("error", "Мэдээлэл дутуу байна!");
  };
  const [filter, setFilter] = useState<FilterType>();
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    refresh(
      objectCompact({
        brand_id: filter?.brand,
        category_id: filter?.category,
        page: 0,
      })
    );
  }, [filter]);
  const groups: { key: keyof FilterType; label: string; items: Option[] }[] =
    useMemo(
      () => [
        {
          key: "brand",
          label: "Brand",
          items: brands.items.map((b) => ({ value: b.id, label: b.name })),
        },
        {
          key: "category",
          label: "Category",
          items: categories.items.map((b) => ({
            value: b.id,
            label: b.name,
          })),
        },
      ],
      [brands.items, categories.items]
    );
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  return (
    <div className="">
      <DynamicHeader count={products.count} />

      <div className="admin-container">
        <DataTable
          columns={columns}
          count={products.count}
          data={products.items}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
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
          modalAdd={
            <Modal
              // w="md"
              maw="xl"
              name="Бараа нэмэх"
              title="Бараа нэмэх форм"
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              reset={() => {
                clear();
                setOpen(false);
              }}
              setOpen={(v) => setOpen(v)}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="divide-y ">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-5">
                    <FormItems
                      control={form.control}
                      name="category_id"
                      label="Төрөл"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={categories.items.map((item) => {
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
                      control={form.control}
                      name="brand_id"
                      label="Брэнд"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={brands.items.map((item) => {
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
                  <div className="grid grid-cols-2 gap-3 pt-5">
                    {[
                      {
                        key: "name",
                        label: "Нэр",
                      },
                      {
                        key: "color",
                        label: "Өнгө",
                      },
                      {
                        key: "size",
                        label: "Хэмжээ  ",
                      },
                    ].map((item, i) => {
                      const name = item.key as keyof ProductType;
                      const label = item.label as keyof ProductType;
                      return (
                        <FormItems
                          control={form.control}
                          name={name}
                          key={i}
                          className={item.key === "name" ? "col-span-2" : ""}
                        >
                          {(field) => {
                            return (
                              <TextField props={{ ...field }} label={label} />
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
