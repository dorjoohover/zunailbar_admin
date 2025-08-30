"use client";
import { Branch, IOrder, Order, User } from "@/models";
import { useEffect, useMemo, useState } from "react";
import { ListType, ACTION, PG, DEFAULT_PG, ListDefault } from "@/lib/constants";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, excel, updateOne } from "@/app/(api)";
import { fetcher } from "@/hooks/fetcher";
import SchedulerViewFilteration from "@/components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "@/providers/schedular-provider";
import DynamicHeader from "@/components/dynamicHeader";
import { mnDate, usernameFormatter } from "@/lib/functions";
import { showToast } from "@/shared/components/showToast";

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
  branches,
  users,
}: {
  branches: ListType<Branch>;
  users: ListType<User>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<OrderType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [selectedBranch, setSelectedBranch] = useState(branches.items[0]);
  const [orders, setOrders] = useState<ListType<Order>>(ListDefault);
  const userMap = useMemo(
    () => new Map(users.items.map((b) => [b.id, b])),
    [users.items]
  );

  const orderFormatter = (data: ListType<Order>) => {
    const items: Order[] = data.items.map((item) => {
      const user = userMap.get(item.user_id);

      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
        color: user?.color,
        // branch_name: user?.name ?? "",
      };
    });

    setOrders({ items, count: data.count });
  };

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

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    console.log({
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      date: pg.filter?.date,
      //   name: pg.filter,
    });
    await fetcher<Order>(Api.order, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      date: pg.filter?.date,
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

  const downloadExcel = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const res = await excel(Api.order, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? -1,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
    });
    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "application/xlsx" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `order_${mnDate().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      showToast("error", res.message);
    }
    console.log(res);
    setAction(ACTION.DEFAULT);
  };

  return (
    <div className="relative">
      <DynamicHeader count={orders?.count} />
      <div className="admin-container relative">
        <SchedulerProvider weekStartsOn="monday">
          <SchedulerViewFilteration
            excel={downloadExcel}
            orders={orders}
            refresh={refresh}
          />
        </SchedulerProvider>
      </div>
    </div>
  );
};
