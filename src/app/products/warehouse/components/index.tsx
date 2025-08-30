"use client";

import { DataTable } from "@/components/data-table";
import {
  Product,
  ProductWarehouse,
  Warehouse,
  IProductWarehouse,
  IProductsWarehouse,
} from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  SearchType,
  Option,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, excel, search, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { DatePicker } from "@/shared/components/date.picker";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { checkEmpty, dateOnly, mnDate, objectCompact } from "@/lib/functions";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContainerHeader from "@/components/containerHeader";
import DynamicHeader from "@/components/dynamicHeader";
import { FilterPopover } from "@/components/layout/popover";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Calendar } from "@/components/ui/calendar";
import { showToast } from "@/shared/components/showToast";
const productItemSchema = z.object({
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nullable()
  ) as unknown as number,
  product_id: z.string().min(1, "Бүтээгдэхүүн заавал сонгоно").nullable(),
});

const formSchema = z.object({
  warehouse_id: z.string().min(1),
  products: z
    .array(productItemSchema)
    .min(1, "Хамгийн багадаа 1 бүтээгдэхүүн нэмнэ"),
  edit: z.string().nullable().optional(),
});
const defaultValues = {
  warehouse_id: "",
  products: [],
  edit: undefined,
};
type FilterType = {
  warehouse?: string;
  product?: string;
  start?: Date;
  end?: Date;
};
type ProductWarehouseType = z.infer<typeof formSchema>;
export const ProductWarehousePage = ({
  data,
  warehouses,
  productData,
}: {
  data: ListType<ProductWarehouse>;
  warehouses: ListType<Warehouse>;
  productData: ListType<Product>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<ProductWarehouseType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [productWarehouse, setProductWarehouse] =
    useState<ListType<IProductWarehouse> | null>(null);

  const warehouseMap = useMemo(
    () => new Map(warehouses.items.map((p) => [p.id, p])),
    [warehouses.items]
  );

  const productWarehouseFormatter = (data: ListType<IProductWarehouse>) => {
    const items: IProductWarehouse[] = data.items.map((item) => {
      const warehouse = warehouseMap.get(item.warehouse_id);
      return {
        ...item,
        warehouse_name: warehouse?.name ?? "",
      };
    });

    setProductWarehouse({ items, count: data.count });
  };

  const [products, setProducts] = useState<SearchType<number>[]>([]);
  useEffect(() => {
    productWarehouseFormatter(data);
  }, [data]);

  const deleteLog = async (index: number) => {
    const id = productWarehouse!.items[index].id;
    const res = await deleteOne(Api.product_log, id);
    refresh();
    return res.success;
  };

  const edit = async (e: IProductWarehouse) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };

  const columns = getColumns(edit, deleteLog);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<IProductWarehouse>(Api.product_warehouse, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
    }).then((d) => {
      productWarehouseFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };

  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as ProductWarehouseType;
    const { edit, ...payload } = body;

    const res = edit
      ? await updateOne<IProductsWarehouse>(
          Api.product_warehouse,
          edit ?? "",
          payload as IProductsWarehouse
        )
      : await create<IProductsWarehouse>(
          Api.product_warehouse,
          e as IProductsWarehouse
        );
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

  const searchProduct = async (name = "") => {
    const result = await search<number>(Api.product, { id: name });
    setProducts(result.data);
  };

  useEffect(() => {
    searchProduct();
  }, []);

  const { fields, append, replace } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const handleProductClickOnce = (productId: string, quantity: number) => {
    const existing = form.getValues("products");

    const alreadyExists = existing?.some((p) => p.product_id === productId);

    if (!alreadyExists && quantity > 0) {
      append({
        product_id: productId,
        quantity: 1,
      });
    }
  };

  const handleProductQuantityChange = (
    productId: string,
    change: number,
    qty: number
  ) => {
    const products = form.getValues("products");
    const index = products.findIndex((p) => p.product_id === productId);

    if (index !== -1) {
      const updated = [...products];
      const currentQty = (updated[index].quantity as number) ?? 0;
      const newQty = currentQty + change;

      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        if (qty >= newQty)
          updated[index] = {
            ...updated[index],
            quantity: newQty,
          };
      }

      form.setValue("products", updated);
    } else {
      if (change > 0 && qty > change) {
        append({
          product_id: productId,
          quantity: change,
        });
      }
    }
  };

  const [filter, setFilter] = useState<FilterType>();
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    refresh(
      objectCompact({
        warehouse_id: filter?.warehouse,
        product_id: filter?.product,
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
          key: "warehouse",
          label: "Агуулах",
          items: warehouses.items.map((b) => ({ value: b.id, label: b.name })),
        },

        {
          key: "product",
          label: "Бүтээгдэхүүн",
          items: productData.items.map((b) => ({ value: b.id, label: b.name })),
        },
      ],
      [productData.items, warehouses.items]
    );

  const downloadExcel = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const res = await excel(Api.product_warehouse, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? -1,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
    });
    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "application/xlsx" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `product_warehouse_${mnDate().toISOString().slice(0, 10)}.xlsx`
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

  return (
    <div className="">
      <DynamicHeader count={productWarehouse?.count} />

      <div className="admin-container">
        <DataTable
          excel={downloadExcel}
          clear={() => setFilter(undefined)}
          filter={
            <div className="inline-flex gap-3 w-full flex-wrap">
              {groups.map((item, i) => {
                const { key } = item;
                return (
                  <FilterPopover
                    key={i}
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
            </div>
          }
          columns={columns}
          count={productWarehouse?.count}
          data={productWarehouse?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              name={"Бараа нэмэх"}
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              reset={() => {
                setOpen(false);
                form.reset({});
              }}
              maw="5xl"
              setOpen={setOpen}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="">
                  <div className="flex flex-col gap-4">
                    <Input
                      placeholder="Бүтээгдэхүүн хайх..."
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length >= 2) searchProduct(value);
                        else searchProduct("");
                      }}
                      className="w-full bg-white"
                    />
                    {/* <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={compare}
                    onCheckedChange={(val) => form.setValue("compare", val)}
                    id="compare-switch"
                  />
                  <label
                    htmlFor="compare-switch"
                    className="text-sm text-muted-foreground"
                  >
                    Зөвхөн хэрэглэгчийн авсан бүтээгдэхүүнүүд (
                    {visibleProducts.length})
                  </label>
                </div> */}
                  </div>
                  <div className="double-col flex flex-col">
                    <FormItems
                      label="Агуулах"
                      control={form.control}
                      name="warehouse_id"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={warehouses.items.map((item) => {
                              return {
                                value: item.id,
                                label: item.name,
                              };
                            })}
                          />
                        );
                      }}
                    </FormItems>
                    <div className="bg-white border p-3 rounded-xl space-y-2">
                      <div className="grid grid-cols-20 items-center justify-between w-full py-2 font-bold px-4 text-sm">
                        <span className="col-span-1">№</span>
                        <span className="col-span-4">Бренд</span>
                        <span className="col-span-4">Төрөл</span>
                        <span className="col-span-5">Бараа</span>
                        <span className="col-span-1">Тоо</span>
                        <span className="col-span-5 text-center">Үйлдэл</span>
                      </div>
                      <ScrollArea className="h-[55vh] w-full divide-y border pt-0 bg-white">
                        {products.map((product, index) => {
                          const [brand, category, name, quantity] =
                            product.value.split("__");
                          return (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-3 pr-6 border-b last:border-none"
                            >
                              <div className="grid grid-cols-20 items-center justify-between w-full gap-4">
                                <span className="text-sm text-start font-medium text-gray-700 truncate col-span-1">
                                  {index + 1}
                                </span>
                                <span className="text-sm text-start font-medium text-gray-700 truncate col-span-4">
                                  {checkEmpty(brand)}
                                </span>
                                <span className="text-sm font-medium text-gray-700 truncate col-span-4">
                                  {checkEmpty(category)}
                                </span>
                                <span className="text-sm font-medium text-gray-700 col-span-5">
                                  {checkEmpty(name)}
                                </span>
                                <span className="text-sm font-medium text-gray-700 col-span-1">
                                  {quantity}
                                </span>
                                <div className="flex items-center justify-center gap-1 col-span-5">
                                  <Button
                                    variant="default"
                                    className=""
                                    size="icon"
                                    onClick={() =>
                                      handleProductQuantityChange(
                                        product.id,
                                        -1,
                                        +quantity
                                      )
                                    }
                                  >
                                    −
                                  </Button>
                                  <Input
                                    type="number"
                                    className="w-16 text-center bg-white no-spinner hide-number-arrows border-primary border-2"
                                    max={quantity}
                                    value={
                                      (form
                                        .watch("products")
                                        ?.find(
                                          (p) => p.product_id === product.id
                                        )?.quantity as number) ?? 0
                                    }
                                    onClick={() =>
                                      handleProductClickOnce(
                                        product.id,
                                        +quantity
                                      )
                                    }
                                    onChange={(e) => {
                                      const val = parseInt(
                                        e.target.value || "0",
                                        10
                                      );
                                      const existing =
                                        form.getValues("products");
                                      const index = existing.findIndex(
                                        (p) => p.product_id === product.id
                                      );
                                      const updated = [...existing];
                                      if (val > +quantity) return;
                                      if (val <= 0 && index !== -1) {
                                        updated.splice(index, 1);
                                      } else if (index !== -1) {
                                        updated[index] = {
                                          ...updated[index],
                                          quantity: val,
                                        };
                                      } else if (val > 0) {
                                        updated.push({
                                          product_id: product.id,
                                          quantity: val,
                                        });
                                      }
                                      form.setValue("products", updated);
                                    }}
                                  />
                                  <Button
                                    variant="default"
                                    className=""
                                    size="icon"
                                    onClick={() =>
                                      handleProductQuantityChange(
                                        product.id,
                                        1,
                                        +quantity
                                      )
                                    }
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </FormProvider>
            </Modal>
          }
        />
        {action}
      </div>
    </div>
  );
};
