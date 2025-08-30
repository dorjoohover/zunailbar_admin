"use client";

import { DataTable } from "@/components/data-table";
import { Branch, IDiscount, Discount, Service } from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  ListDefault,
  getEnumValues,
  getValueDiscount,
} from "@/lib/constants";
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
import { getColumns } from "./columns";
import { mnDate, usernameFormatter } from "@/lib/functions";
import { DISCOUNT } from "@/lib/enum";
import ContainerHeader from "@/components/containerHeader";
import DynamicHeader from "@/components/dynamicHeader";

const formSchema = z.object({
  branch_id: z.string().min(1),
  name: z.string().min(1),
  service_id: z.string().min(1),
  start_date: z.preprocess(
    (val) => (typeof val === "string" ? mnDate(new Date(val)) : val),
    z.date()
  ) as unknown as Date,
  end_date: z.preprocess(
    (val) => (typeof val === "string" ? mnDate(new Date(val)) : val),
    z.date()
  ) as unknown as Date,
  value: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  type: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(DISCOUNT).nullable()
    )
    .optional() as unknown as number,
  edit: z.string().nullable().optional(),
});
const defaultValues: DiscountType = {
  branch_id: "",
  service_id: "",
  name: "",
  start_date: mnDate(),
  end_date: mnDate(),
  value: undefined,
  type: DISCOUNT.Price,
  edit: undefined,
};
type DiscountType = z.infer<typeof formSchema>;
export const DiscountPage = ({
  data,
  services,
  branches,
}: {
  data: ListType<Discount>;
  services: ListType<Service>;
  branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<DiscountType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [discounts, setDiscounts] = useState<ListType<Discount>>(ListDefault);
  const serviceMap = useMemo(
    () => new Map(services.items.map((b) => [b.id, b])),
    [services.items]
  );
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items]
  );

  const discountFormatter = (data: ListType<Discount>) => {
    const items: Discount[] = data.items.map((item) => {
      const service = serviceMap.get(item.service_id);
      const branch = branchMap.get(item.branch_id);

      return {
        ...item,
        service_name: service?.name ?? "",
        branch_name: branch?.name ?? "",
      };
    });

    setDiscounts({ items, count: data.count });
  };
  useEffect(() => {
    discountFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deleteDiscount = async (index: number) => {
    const id = discounts!.items[index].id;
    const res = await deleteOne(Api.discount, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IDiscount) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteDiscount);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Discount>(Api.discount, {
      page,
      limit,
      sort,
      //   name: pg.filter,
    }).then((d) => {
      discountFormatter(d);
      console.log(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as DiscountType;
    const { edit } = body;
    const res = edit
      ? await updateOne<Discount>(Api.discount, edit ?? "", e as Discount)
      : await create<Discount>(Api.discount, e as Discount);
    console.log(res);
    if (res.success) {
      refresh();
      setOpen(false);
      clear();
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    alert(e);
    console.log("error", e);
  };

  return (
    <div className="">
      <DynamicHeader count={discounts?.count} />

      <div className="admin-container">
        <DataTable
          columns={columns}
          count={discounts?.count}
          data={discounts?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              maw="xl"
              name="Урамшуулал нэмэх"
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              reset={() => {
                setOpen(false);
                clear();
              }}
              setOpen={setOpen}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="double-col">
                  <FormItems
                    label="Үйлчилгээ"
                    control={form.control}
                    name="service_id"
                  >
                    {(field) => {
                      return (
                        <ComboBox
                          props={{ ...field }}
                          items={services.items.map((item) => {
                            return {
                              value: item.id,
                              label: item.name ?? "",
                            };
                          })}
                        />
                      );
                    }}
                  </FormItems>
                  <FormItems
                    label="Салбар"
                    control={form.control}
                    name="branch_id"
                  >
                    {(field) => {
                      return (
                        <ComboBox
                          props={{ ...field }}
                          items={branches.items.map((item) => {
                            return {
                              value: item.id,
                              label: item.name ?? "",
                            };
                          })}
                        />
                      );
                    }}
                  </FormItems>
                  <FormItems label="Төлөв" control={form.control} name="type">
                    {(field) => {
                      return (
                        <ComboBox
                          props={{ ...field }}
                          items={getEnumValues(DISCOUNT).map((item) => {
                            return {
                              value: item.toString(),
                              label: getValueDiscount[item],
                            };
                          })}
                        />
                      );
                    }}
                  </FormItems>
                  {[
                    {
                      key: "value",
                      type: "number",
                      label: "Дүн",
                    },

                    {
                      key: "name",
                      label: "Урамшууллын нэр",
                      type: "text",
                    },
                  ].map((item, i) => {
                    const name = item.key as keyof DiscountType;
                    const label = item.label as keyof DiscountType;
                    return (
                      <FormItems
                        label={label}
                        control={form.control}
                        name={name}
                        key={i}
                        className={item.key && "name"}
                      >
                        {(field) => {
                          return (
                            <TextField props={{ ...field }} type={item.type} />
                          );
                        }}
                      </FormItems>
                    );
                  })}

                  <FormItems
                    label={"Эхлэх огноо"}
                    control={form.control}
                    name={"start_date"}
                    className={"name"}
                  >
                    {(field) => {
                      return (
                        <TextField
                          props={{ ...field }}
                          max={form.watch("end_date") as string}
                          type={"date"}
                        />
                      );
                    }}
                  </FormItems>
                  <FormItems
                    label={"Дуусах огноо"}
                    control={form.control}
                    name={"end_date"}
                    className={"name"}
                  >
                    {(field) => {
                      return (
                        <TextField
                          min={form.watch("start_date") as string}
                          props={{ ...field }}
                          type={"date"}
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
