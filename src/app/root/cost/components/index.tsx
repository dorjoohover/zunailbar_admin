"use client";

import { DataTable } from "@/components/data-table";
import { Brand, Category, IProduct, Product } from "@/models";
import { getColumns } from "./columns";
import { useState } from "react";
import { ListType, ACTION, PG, DEFAULT_PG } from "@/lib/constants";
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
import DynamicHeader from "@/components/dynamicHeader";

const formSchema = z.object({
  category_id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().nullable().optional(),

  size: z.string().nullable().optional(),
  edit: z.string().nullable().optional(),
});
type ProductType = z.infer<typeof formSchema>;
export const CostPage = ({ data, categories }: { data: ListType<Product>; categories: ListType<Category> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<ProductType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      edit: undefined,
    },
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
      page,
      limit,
      sort,
      name: pg.filter,
      type: CategoryType.COST,
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
    const res = edit ? await updateOne<IProduct>(Api.product, edit ?? "", payload as IProduct) : await create<IProduct>(Api.product, e as IProduct);
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
          modalAdd={
            <Modal
              name="Бараа нэмэх"
              title="Бараа нэмэх форм"
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
                  <div className="grid grid-cols-2 gap-3 pb-5">
                    <FormItems control={form.control} name="category_id" label="Төрөл">
                      {(field) => {
                        console.log(field.value);
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
                        <FormItems control={form.control} name={name} key={i} className={item.key === "name" ? "col-span-2" : ""}>
                          {(field) => {
                            return <TextField props={{ ...field }} label={label} />;
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
