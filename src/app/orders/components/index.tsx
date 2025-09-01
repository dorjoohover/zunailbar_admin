"use client";
import { Branch, IOrder, Order, Service, User } from "@/models";
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
  customers,
  services,
}: {
  branches: ListType<Branch>;
  services: ListType<Service>;
  users: ListType<User>;
  customers: ListType<User>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
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
        branch_id: user?.branch_id,
        color: user?.color,
        // branch_name: user?.name ?? "",
      };
    });

    setOrders({ items, count: data.count });
  };

  const deleteOrder = async (id: string) => {
    const res = await deleteOne(Api.order, id);
    refresh();
    return res.success;
  };

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const d = mnDate(currentDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const date = `${y}-${m}-${day}`;

    await fetcher<Order>(Api.order, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      date: pg.filter?.date ?? date,
      //   name: pg.filter,
    }).then((d) => {
      orderFormatter(d);
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
          payload as unknown as Order,
          "update"
        )
      : await create<Order>(Api.order, e as Order);
    if (res.success) {
      refresh();
      showToast("success", edit ? "Мэдээлэл шинэчиллээ." : "Амжилттай нэмлээ.");
    } else {
      showToast("error", res.error ?? "Алдаа гарлаа.");
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
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            loading={action == ACTION.RUNNING}
            send={onSubmit}
            excel={downloadExcel}
            orders={orders}
            branches={branches}
            users={users}
            deleteOrder={deleteOrder}
            customers={customers}
            services={services}
            refresh={refresh}
          />
        </SchedulerProvider>
      </div>
    </div>
  );
};
