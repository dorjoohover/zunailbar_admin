"use client";
import { DataTable } from "@/components/data-table";
import { Category, ICategory } from "@/models";
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
import { getColumns } from "./columns";
import DynamicHeader from "@/components/dynamicHeader";
import { firstLetterUpper } from "@/lib/functions";
import { showToast } from "@/shared/components/showToast";

const formSchema = z.object({
  name: ZValidator.name,
  parent_id: z.string().nullable().optional(),

  edit: z.string().nullable().optional(),
});
const defaultValues: CategoryType = {
  name: "",
  parent_id: null,
  edit: undefined,
};
type CategoryType = z.infer<typeof formSchema>;
export const CategoryPage = ({
  data,
  parents,
}: {
  data: ListType<Category>;
  parents: SearchType<Category>[];
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<CategoryType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [categories, setCategories] = useState<ListType<Category>>(data);
  const [parentOptions, setParentOptions] =
    useState<SearchType<Category>[]>(parents);

  const deleteLog = async (index: number) => {
    const id = categories!.items[index].id;
    const res = await deleteOne(Api.category, id);
    refresh();
    return res.success;
  };
  const edit = async (e: ICategory) => {
    setOpen(true);
    form.reset({
      name: e.name,
      parent_id: e.parent_id ?? null,
      edit: e.id,
    });
  };
  const columns = getColumns(edit, deleteLog);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort, filter: searchValue } = pg;
    await fetcher<Category>(Api.category, {
      page,
      limit,
      sort,
      ...(searchValue && { name: searchValue }),
    }).then((d) => {
      setCategories(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as CategoryType;
    const { edit, parent_id, ...rest } = body;
    const payload = {
      ...rest,
      parent_id: parent_id ?? null,
    };

    const res = edit
      ? await updateOne<ICategory>(
          Api.category,
          edit ?? "",
          payload as unknown as ICategory,
        )
      : await create<ICategory>(Api.category, payload as ICategory);
    if (res.success) {
      refresh();
      setOpen(false);
      form.reset(defaultValues);
      // parent list-ийг шинэчлэх (шинэ top-level нэмэгдсэн байж болох)
      const p = await search<Category>(Api.category, {
        limit: 50,
        top_level: true,
      } as any);
      setParentOptions(p.data);
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
  // Засаж буй ангиллыг өөрийгөө сонгох боломжгүй болгох
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
    const res = await search<Category>(Api.category, {
      limit: 50,
      id: v.length > 1 ? v : "",
      top_level: true,
    } as any);
    setParentOptions(res.data);
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
              maw="md"
              name={form.watch("edit") ? "Ангилал засах" : "Ангилал нэмэх"}
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(v) => {
                setOpen(v);
                form.reset(defaultValues);
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="divide-y">
                  <div className="space-y-4">
                    <FormItems
                      control={form.control}
                      name={"name"}
                      className={"col-span-1"}
                      label="Ангилал"
                    >
                      {(field) => {
                        return <TextField props={{ ...field }} />;
                      }}
                    </FormItems>
                    <FormItems
                      control={form.control}
                      name={"parent_id"}
                      className={"col-span-1"}
                      label="Эцэг ангилал (заавал биш)"
                    >
                      {(field) => {
                        return (
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
                        );
                      }}
                    </FormItems>
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
