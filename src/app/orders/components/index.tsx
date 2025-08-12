"use client";

import { DataTable } from "@/components/data-table";
import {
  Branch,
  Brand,
  Category,
  IOrder,
  IProduct,
  Order,
  Product,
  User,
} from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  ListDefault,
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
import { usernameFormatter } from "@/lib/functions";
import SchedulerViewFilteration from "@/components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "@/providers/schedular-provider";
import SchedulerWrapper from "@/components/schedule/_components/wrapper/schedular-wrapper";

const formSchema = z.object({
  branch_id: z.string().min(1),
  name: z.string().min(1),
  max_price: z
    .preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number()
    )
    .nullable()
    .optional() as unknown as number,
  min_price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  duration: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  edit: z.string().nullable().optional(),
});
const defaultValues: OrderType = {
  branch_id: "",
  name: "",
  max_price: null,
  min_price: 0,
  duration: 0,
  edit: undefined,
};
type OrderType = z.infer<typeof formSchema>;
export const OrderPage = ({
  data,
  branches,
}: {
  data: ListType<Order>;
  branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<OrderType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [orders, setOrders] = useState<ListType<Order>>(ListDefault);
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items]
  );

  const orderFormatter = (data: ListType<Order>) => {
    const items: Order[] = data.items.map((item) => {
      // const branch = branchMap.get(item.branch_id);

      return {
        ...item,
        // branch_name: branch?.name ?? "",
      };
    });

    setOrders({ items, count: data.count });
  };
  useEffect(() => {
    orderFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deleteOrder = async (index: number) => {
    const id = orders!.items[index].id;
    const res = await deleteOne(Api.order, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IOrder) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  // const columns = getColumns(edit, deleteOrder);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Order>(Api.order, {
      page,
      limit,
      sort,
      //   name: pg.filter,
    }).then((d) => {
      orderFormatter(d);
      console.log(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as OrderType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<Order>(
          Api.order,
          edit ?? "",
          payload as unknown as Order
        )
      : await create<Order>(Api.order, e as Order);
    console.log(res);
    if (res.success) {
      refresh();
      setOpen(false);
      clear();
    }
    setAction(ACTION.DEFAULT);
  };

  return (
    <div className="w-full">
      <SchedulerProvider weekStartsOn="monday">
        {JSON.stringify(orders)}
        <SchedulerViewFilteration orders={orders} />
      </SchedulerProvider>
    </div>
  );
};
