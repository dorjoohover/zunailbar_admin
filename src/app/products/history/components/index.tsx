"use client";

import { DataTable } from "@/components/data-table";
import {
  IProductLog,
  Product,
  ProductLog
} from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  getValuesProductLogStatus,
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
import { ProductLogStatus } from "@/lib/enum";
import { DatePicker } from "@/shared/components/date.picker";

const formSchema = z.object({
  product_id: z.string().min(1),

  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  total_amount: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  edit: z.string().nullable().optional(),
  date: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ) as unknown as Date,
  product_log_status: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(ProductLogStatus).nullable()
    )
    .optional() as unknown as number,
});
type LogType = z.infer<typeof formSchema>;
export const ProductHistoryPage = ({
  data,
  products,
}: {
  data: ListType<ProductLog>;
  products: ListType<Product>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<LogType>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  const [transactions, setTransactions] =
    useState<ListType<IProductLog> | null>(null);

  const productMap = useMemo(
    () => new Map(products.items.map((p) => [p.id, p])),
    [products.items]
  );
  const logFormatter = (data: ListType<ProductLog>) => {
    const items: IProductLog[] = data.items.map((item) => {
      const product = productMap.get(item.product_id);

      return {
        ...item,
        product_name: product?.name ?? "",
      };
    });

    setTransactions({ items, count: data.count });
  };
  useEffect(() => {
    logFormatter(data);
  }, [data]);
  const deleteLog = async (index: number) => {
    const id = transactions!.items[index].id;
    const res = await deleteOne(Api.product_log, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IProductLog) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteLog);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<ProductLog>(Api.product_log, {
      page,
      limit,
      sort,
      //   name: pg.filter,
    }).then((d) => {
      console.log(d);
      logFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as LogType;
    const { edit, ...payload } = body;

    const res = edit
      ? await updateOne<IProductLog>(
          Api.product_log,
          edit ?? "",
          payload as IProductLog
        )
      : await create<IProductLog>(Api.product_log, e as IProductLog);
    console.log(res);
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
  const qty = form.watch("quantity") ?? 0;
  const price = form.watch("price") ?? 0;

  useEffect(() => {
    const total = (Number(qty) || 0) * (Number(price) || 0);
    form.setValue("total_amount", total, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [qty, price, form]);
  return (
    <div className="">
      <Modal
        name={"Нэмэх " + transactions?.count}
        submit={() => form.handleSubmit(onSubmit, onInvalid)()}
        open={open == true}
        reset={() => {
          setOpen(false);
          form.reset({});
        }}
        setOpen={setOpen}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          <FormItems control={form.control} name="product_id">
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
          <FormItems control={form.control} name="product_log_status">
            {(field) => {
              return (
                <ComboBox
                  props={{ ...field }}
                  items={getEnumValues(ProductLogStatus).map((item) => {
                    return {
                      value: item.toString(),
                      label: getValuesProductLogStatus[item],
                    };
                  })}
                />
              );
            }}
          </FormItems>
          {[
            {
              key: "quantity",
              type: "number",
              label: "Тоо ширхэг",
            },
            {
              key: "price",
              type: "money",
              label: "Үнэ",
            },
            {
              key: "total_amount",
              type: "money",
              label: "Нийт үнэ",
            },
            // {
            //   key: "total_amount",
            //   type: "money",
            //   label: "Нийт үнэ",
            // },
          ].map((item, i) => {
            const name = item.key as keyof LogType;
            const label = item.label as keyof LogType;
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
                      type={item.type}
                      label={label}
                    />
                  );
                }}
              </FormItems>
            );
          })}
          <FormItems control={form.control} name="date">
            {(field) => {
              return <DatePicker pl="Огноо сонгох" props={{ ...field }} />;
            }}
          </FormItems>
        </FormProvider>
      </Modal>
      <DataTable
        columns={columns}
        count={transactions?.count}
        data={transactions?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      />
      {action}
    </div>
  );
};
