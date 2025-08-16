"use client";

import { DataTable } from "@/components/data-table";
import { Product, Category, Warehouse, ICategory, IProductsWarehouse } from "@/models";
import { useEffect, useMemo, useState } from "react";
import { ListType, ACTION, PG, DEFAULT_PG, getEnumValues, SearchType, CategoryTypeValues } from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, search, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { DatePicker } from "@/shared/components/date.picker";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "@/components/ui/button";
import { CategoryType as CategoryTypEnum } from "@/lib/enum";
import ContainerHeader from "@/components/containerHeader";
import DynamicHeader from "@/components/dynamicHeader";

const formSchema = z.object({
  name: z.string().min(1),
  type: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.nativeEnum(CategoryTypEnum).nullable()).optional() as unknown as number,
  edit: z.string().nullable().optional(),
});
const defaultValues = {
  name: "",
  type: CategoryTypEnum.DEFAULT,
  edit: undefined,
};
type CategoryType = z.infer<typeof formSchema>;
export const CategoryPage = ({ data }: { data: ListType<Category> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<CategoryType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [categories, setCategories] = useState<ListType<Category>>(data);

  const deleteLog = async (index: number) => {
    const id = categories!.items[index].id;
    const res = await deleteOne(Api.category, id);
    refresh();
    return res.success;
  };
  const edit = async (e: ICategory) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteLog);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Category>(Api.category, {
      page,
      limit,
      sort,
      //   name: pg.filter,
    }).then((d) => {
      setCategories(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as CategoryType;
    const { edit, ...payload } = body;

    const res = edit ? await updateOne<ICategory>(Api.category, edit ?? "", payload as unknown as ICategory) : await create<ICategory>(Api.category, e as ICategory);
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
      <DynamicHeader count={categories?.count} />

      <div className="admin-container">
        <DataTable
          columns={columns}
          count={categories?.count}
          data={categories?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              title="Category форм"
              name={"Нэмэх"}
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
                  <div className="double-col">
                    <FormItems control={form.control} name={"name"} className={"col-span-1"}>
                      {(field) => {
                        return <TextField props={{ ...field }} label={"Category name"} />;
                      }}
                    </FormItems>
                    <FormItems label="Төрөл" control={form.control} name="type" className={"col-span-1"}>
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={getEnumValues(CategoryTypEnum).map((item) => {
                              return {
                                value: item.toString(),
                                label: CategoryTypeValues[item],
                              };
                            })}
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
        {action}
      </div>
    </div>
  );
};
