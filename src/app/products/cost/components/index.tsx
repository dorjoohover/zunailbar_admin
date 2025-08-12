"use client";

import { DataTable } from "@/components/data-table";
import { Branch, Brand, Category, Cost, ICost, Product } from "@/models";
import { getColumns } from "./columns";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  ListDefault,
  getEnumValues,
  getValuesCostStatus,
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
import { CategoryType, CostStatus } from "@/lib/enum";
import { mnDate } from "@/lib/functions";

const formSchema = z.object({
  category_id: z.string().nullable().optional(),
  branch_id: z.string().min(1),
  product_id: z.string().min(1),
  date: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ) as unknown as Date,
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  cost_status: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(CostStatus).nullable()
    )
    .optional() as unknown as number,
  edit: z.string().nullable().optional(),
});
const defaultValues = {
  category_id: undefined,
  branch_id: "",
  product_id: "",
  date: mnDate(),
  price: 0,
  edit: undefined,
  cost_status: CostStatus.Paid,
};
type CostType = z.infer<typeof formSchema>;
export const CostPage = ({
  data,
  products,
  branches,
}: {
  data: ListType<Cost>;
  products: ListType<Product>;
  branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<CostType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [costs, setCosts] = useState<ListType<Cost>>(ListDefault);
  const productMap = useMemo(
    () => new Map(products.items.map((b) => [b.id, b])),
    [products.items]
  );
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items]
  );

  const costFormatter = (data: ListType<Cost>) => {
    const items: Cost[] = data.items.map((item) => {
      const product = productMap.get(item.product_id);
      const branch = branchMap.get(item.branch_id);

      return {
        ...item,
        branch_name: branch?.name ?? "",
        product_name: product?.name ?? "",
      };
    });

    setCosts({ items, count: data.count });
  };
  useEffect(() => {
    costFormatter(data);
  }, [data]);
  const deleteProduct = async (index: number) => {
    const id = costs?.items?.[index]?.id ?? "";
    const res = await deleteOne(Api.product, id);
    refresh();
    return res.success;
  };
  const edit = async (e: ICost) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteProduct);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Cost>(Api.cost, {
      page,
      limit,
      sort,
      name: pg.filter,
    }).then((d) => {
      costFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as CostType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<ICost>(Api.cost, edit ?? "", payload as ICost)
      : await create<ICost>(Api.cost, e as ICost);
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
      <div className="flex gap-4">
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
              <div className="grid gap-3 pb-5">
                <FormItems
                  control={form.control}
                  name="product_id"
                  label="Зардал"
                >
                  {(field) => {
                    return (
                      <ComboBox
                        props={{ ...field }}
                        items={products.items.map((item) => {
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
              <div className="grid grid-cols-2 gap-3 pb-5">
                <FormItems
                  control={form.control}
                  name="branch_id"
                  label="Салбар"
                >
                  {(field) => {
                    return (
                      <ComboBox
                        props={{ ...field }}
                        items={branches.items.map((item) => {
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
                  label="Төлөв"
                  control={form.control}
                  name="cost_status"
                >
                  {(field) => {
                    return (
                      <ComboBox
                        props={{ ...field }}
                        items={getEnumValues(CostStatus).map((item) => {
                          return {
                            value: item.toString(),
                            label: getValuesCostStatus[item],
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
                    key: "price",
                    label: "Үнэ",
                    type: "money",
                  },
                  {
                    key: "date",
                    label: "Огноо",
                    type: "date",
                  },
                ].map((item, i) => {
                  const name = item.key as keyof CostType;
                  const label = item.label as keyof CostType;
                  return (
                    <FormItems
                      control={form.control}
                      name={name}
                      key={i}
                      className={item.key === "name" ? "col-span-2" : ""}
                    >
                      {(field) => {
                        return (
                          <TextField
                            props={{ ...field }}
                            label={label}
                            type={item.type}
                          />
                        );
                      }}
                    </FormItems>
                  );
                })}
              </div>
            </div>
          </FormProvider>
        </Modal>
      </div>
      <DataTable
        columns={columns}
        count={costs?.count}
        data={costs?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      />
    </div>
  );
};
