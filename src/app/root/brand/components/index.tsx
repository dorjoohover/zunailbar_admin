"use client";

import { DataTable } from "@/components/data-table";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
} from "@/lib/constants";
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
import { useState } from "react";
import { Brand, IBrand } from "@/models";

const formSchema = z.object({
  name: z.string().min(1),
  edit: z.string().nullable().optional(),
});
const defaultValues = {
  name: "",
  edit: undefined,
};
type BrandType = z.infer<typeof formSchema>;
export const BrandPage = ({ data }: { data: ListType<Brand> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<BrandType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [categories, setCategories] = useState<ListType<Brand>>(data);

  const deleteLog = async (index: number) => {
    const id = categories!.items[index].id;
    const res = await deleteOne(Api.brand, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IBrand) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteLog);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Brand>(Api.brand, {
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
    const body = e as BrandType;
    const { edit, ...payload } = body;

    const res = edit
      ? await updateOne<Brand>(
          Api.brand,
          edit ?? "",
          payload as unknown as Brand
        )
      : await create<Brand>(Api.brand, e as Brand);
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
      <Modal
        title="Brand форм"
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
            <div className="grid grid-cols-2 gap-3 pb-5"></div>
            <div className="grid grid-cols-2 gap-3 pt-5">
              <FormItems
                control={form.control}
                name={"name"}
                className={"col-span-1"}
              >
                {(field) => {
                  return (
                    <TextField props={{ ...field }} label={"Brand name"} />
                  );
                }}
              </FormItems>
            </div>
          </div>
        </FormProvider>
      </Modal>
      <DataTable
        columns={columns}
        count={categories?.count}
        data={categories?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      />
      {action}
    </div>
  );
};
