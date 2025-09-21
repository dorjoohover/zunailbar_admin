"use client";
import { DataTable } from "@/components/data-table";
import React, { useState } from "react";
import { ListType, ACTION, zStrOpt, zNumOpt, VALUES } from "@/lib/constants";
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
import { getColumns } from "./columns";
import { Feature, IFeature, IFeatures } from "@/models/home.model";
import { firstLetterUpper } from "@/lib/functions";
import { showToast } from "@/shared/components/showToast";

const featureschema = z.object({
  title: zStrOpt,
  description: zStrOpt,
  icon: zNumOpt,
  edit: zStrOpt,
});

const makeEmptyFeature = (i: number) => ({
  title: "",
  description: "",
  icon: null,
  edit: null,
});

const formSchema = z.object({
  features: z
    .array(featureschema)
    .length(4)
    .default(Array.from({ length: 4 }, (_, i) => makeEmptyFeature(i))),
  edit: z.string().nullable().optional(),
});
export type RootType = z.infer<typeof formSchema>;
export type HomeType = z.infer<typeof featureschema>;
type FormInput = z.input<typeof formSchema>; // optional тал
type FormOutput = z.output<typeof formSchema>;
export const FeaturePage = ({ data }: { data: ListType<Feature> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<number>(0);
  const form = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(formSchema),
  });
  const [features, setFeatures] = useState<ListType<Feature>>(data);
  const deleteRoot = async (index: number, isHome: boolean) => {
    const id = features.items[index].id;
    const res = isHome
      ? await deleteOne(Api.home, id, "home")
      : await deleteOne(Api.home, id, "feature");
    refresh();
    return res.success;
  };
  const edit = async (e: IFeature, index: number) => {
    setOpen(index);
    form.reset({ ...e, edit: e.id });
  };

  const columns = getColumns(edit, deleteRoot);

  const refresh = async () => {
    setAction(ACTION.RUNNING);
    await fetcher<Feature>(Api.home, {}, "web/feature").then((d) => {
      setFeatures(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as RootType;
    const { edit, ...payload } = body;
    let res;
    if (body.features) {
      res = edit
        ? await updateOne<IFeature>(
            Api.home,
            edit as string,
            body.features[0] as IFeature,
            "home"
          )
        : await create<IFeatures>(
            Api.home,
            {
              items: body.features as IFeature[],
            },
            "home"
          );
    }

    if (res?.success) {
      refresh();
      setOpen(0);
      form.reset({});
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    const error =
      Object.keys(e as any)
        .map((er, i) => {
          const value = VALUES[er];
          return i == 0 ? firstLetterUpper(value) : value;
        })
        .join(", ") + " оруулна уу!";
    showToast("info", error);
  };

  return (
    <div className="">
      <DynamicHeader />

      <div className="admin-container">
        <DataTable
          columns={columns}
          count={features.count}
          data={features.items}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <div className="flex justify-end space-x-4">
              <Modal
                name="Feature"
                title="Feature форм"
                submit={() => form.handleSubmit(onSubmit, onInvalid)()}
                open={open == 2}
                reset={() => {
                  setOpen(0);
                  form.reset({});
                }}
                setOpen={(v) => {
                  if (!v) {
                    setOpen(0);
                  }
                }}
                loading={action == ACTION.RUNNING}
              >
                <FormProvider {...form}>
                  <div className="divide-y">
                    <div className="grid grid-cols-2 gap-3 pt-5">
                      {/* Жишээ: features массивыг 4 мөрөөр засах (schema-д тааруулж) */}
                      {Array.from({ length: 4 }).map((_, i) => {
                        return (
                          <React.Fragment key={i}>
                            <FormItems
                              control={form.control}
                              name={`features.${i}.title`}
                            >
                              {(field) => (
                                <TextField label="Нэр" props={field} />
                              )}
                            </FormItems>
                            <FormItems
                              control={form.control}
                              name={`features.${i}.description`}
                            >
                              {(field) => (
                                <TextField label="Тайлбар" props={field} />
                              )}
                            </FormItems>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </FormProvider>
              </Modal>
            </div>
          }
        />
      </div>
    </div>
  );
};
