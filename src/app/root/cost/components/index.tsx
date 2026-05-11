"use client";

import { DataTable } from "@/components/data-table";
import { CostCategory, ICostCategory } from "@/models";
import { useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  VALUES,
  ZValidator,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import DynamicHeader from "@/components/dynamicHeader";
import { showToast } from "@/shared/components/showToast";
import { firstLetterUpper } from "@/lib/functions";
import { getColumns } from "./columns";

const formSchema = z.object({
  name: ZValidator.name,
  edit: z.string().nullable().optional(),
});
const defaultValues = {
  name: "",
  edit: undefined,
};
type CostCategoryFormType = z.infer<typeof formSchema>;

export const CostPage = ({ data }: { data: ListType<CostCategory> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<CostCategoryFormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [costCategories, setCostCategories] =
    useState<ListType<CostCategory>>(data);

  const deleteCostCategory = async (index: number) => {
    const id = costCategories!.items[index].id;
    const res = await deleteOne(Api.cost_category, id);
    refresh();
    return res.success;
  };
  const edit = async (e: ICostCategory) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteCostCategory);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort, filter: searchValue } = pg;
    await fetcher<CostCategory>(Api.cost_category, {
      page,
      limit,
      sort,
      ...(searchValue && { name: searchValue }),
    }).then((d) => {
      setCostCategories(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as CostCategoryFormType;
    const { edit, ...payload } = body;

    const res = edit
      ? await updateOne<ICostCategory>(
          Api.cost_category,
          edit ?? "",
          payload as unknown as ICostCategory,
        )
      : await create<ICostCategory>(
          Api.cost_category,
          payload as ICostCategory,
        );
    if (res.success) {
      refresh();
      setOpen(false);
      form.reset(defaultValues);
      showToast(
        "success",
        edit ? "Зардлын ангилал засагдсан." : "Зардлын ангилал нэмлээ.",
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

  return (
    <div className="">
      <DynamicHeader count={costCategories?.count} />

      <div className="admin-container">
        <DataTable
          columns={columns}
          count={costCategories?.count}
          data={costCategories?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              maw="md"
              name={
                form.watch("edit")
                  ? "Зардлын ангилал засах"
                  : "Зардлын ангилал нэмэх"
              }
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(v) => {
                setOpen(v);
                form.reset(defaultValues);
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="space-y-4">
                  <FormItems
                    control={form.control}
                    name="name"
                    className="col-span-1"
                    label="Ангиллын нэр"
                  >
                    {(field) => <TextField props={{ ...field }} />}
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
