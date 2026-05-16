"use client";

import { DataTable } from "@/components/data-table";
import { CostCategory, ICostCategory } from "@/models";
import { useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  SearchType,
  VALUES,
  ZValidator,
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
import DynamicHeader from "@/components/dynamicHeader";
import { showToast } from "@/shared/components/showToast";
import { firstLetterUpper } from "@/lib/functions";
import { getColumns } from "./columns";

const formSchema = z.object({
  name: ZValidator.name,
  parent_id: z.string().nullable().optional(),
  edit: z.string().nullable().optional(),
});
const defaultValues: CostCategoryFormType = {
  name: "",
  parent_id: null,
  edit: undefined,
};
type CostCategoryFormType = z.infer<typeof formSchema>;

export const CostPage = ({
  data,
  parents,
}: {
  data: ListType<CostCategory>;
  parents: SearchType<CostCategory>[];
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<CostCategoryFormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [costCategories, setCostCategories] =
    useState<ListType<CostCategory>>(data);
  const [parentOptions, setParentOptions] =
    useState<SearchType<CostCategory>[]>(parents);

  const deleteCostCategory = async (index: number) => {
    const id = costCategories!.items[index].id;
    const res = await deleteOne(Api.cost_category, id);
    refresh();
    return res.success;
  };
  const edit = async (e: ICostCategory) => {
    setOpen(true);
    form.reset({
      name: e.name,
      parent_id: e.parent_id ?? null,
      edit: e.id,
    });
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
    const { edit, parent_id, ...rest } = body;
    const payload = {
      ...rest,
      parent_id: parent_id ?? null,
    };

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
      const p = await search<CostCategory>(Api.cost_category, {
        limit: 50,
        top_level: true,
      } as any);
      setParentOptions(p.data);
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

  const editingId = form.watch("edit");
  const parentItems = useMemo(
    () =>
      parentOptions
        .filter((p) => p.id !== editingId)
        .map((p) => ({
          value: p.id,
          label: p.value?.split("__")?.[0] ?? p.value,
        })),
    [parentOptions, editingId],
  );

  const parentSearch = async (v: string) => {
    if (v.length === 1) return;
    const res = await search<CostCategory>(Api.cost_category, {
      limit: 50,
      id: v.length > 1 ? v : "",
      top_level: true,
    } as any);
    setParentOptions(res.data);
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
                  <FormItems
                    control={form.control}
                    name="parent_id"
                    className="col-span-1"
                    label="Эцэг ангилал (заавал биш)"
                  >
                    {(field) => (
                      <ComboBox
                        pl="Эцэг ангилал"
                        search={parentSearch}
                        props={{
                          ...field,
                          value: field.value ?? "",
                          onChange: (v: string) =>
                            field.onChange(v === "" ? null : v),
                        }}
                        items={parentItems}
                      />
                    )}
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
