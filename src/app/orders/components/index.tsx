"use client";

import { DataTable } from "@/components/data-table";
import { Branch, Brand, Category, IProduct, Product, User } from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
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
import { IService, Service } from "@/models/service.model";

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
const defaultValues: ServiceType = {
  branch_id: "",
  name: "",
  max_price: null,
  min_price: 0,
  duration: 0,
  edit: undefined,
};
type ServiceType = z.infer<typeof formSchema>;
export const OrderPage = ({
  data,
  branches,
}: {
  data: ListType<Service>;
  branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<ServiceType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [services, setServices] = useState<ListType<Service> | null>(null);
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items]
  );

  const serviceFormatter = (data: ListType<Service>) => {
    const items: Service[] = data.items.map((item) => {
      const branch = branchMap.get(item.branch_id);

      return {
        ...item,
        branch_name: branch?.name ?? "",
      };
    });

    setServices({ items, count: data.count });
  };
  useEffect(() => {
    serviceFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deleteService = async (index: number) => {
    const id = services!.items[index].id;
    const res = await deleteOne(Api.service, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IService) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteService);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Service>(Api.service, {
      page,
      limit,
      sort,
      //   name: pg.filter,
    }).then((d) => {
      serviceFormatter(d);
      console.log(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as ServiceType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<Service>(Api.service, edit ?? "", payload as Service)
      : await create<Service>(Api.service, e as Service);
    console.log(res);
    if (res.success) {
      refresh();
      setOpen(false);
      clear();
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
  };
  const connect = () => (window.location.href = "/api/google/auth");

  const createCalendar = async () => {
    const now = new Date();
    // Монголын цаг: +08:00
    const startISO = new Date(now.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace("Z", "+08:00");
    const endISO = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      .toISOString()
      .replace("Z", "+08:00");

    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: "Test booking – Salon",
        description: "Demo from Next.js",
        startISO,
        endISO,
        colorId: "7", // Google-ийн өнгө ID
        meta: { source: "next-demo", appointmentId: "demo123" },
      }),
    });
    alert(res.ok ? "Event created!" : await res.text());
  };
  return (
    <div className="">
      <h1>Google Calendar – Demo</h1>
      <p>1) Connect → 2) Create Event</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={connect}>Connect Google Calendar</button>
        <button onClick={createCalendar}>Create Test Event</button>
      </div>
      {/* <Modal
        name={"Бараа нэмэх" + services?.count}
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
          <FormItems control={form.control} name="branch_id">
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

          {[
            {
              key: "min_price",
              type: "money",
              label: "Үнэ",
            },
            {
              key: "max_price",
              type: "money",
              label: "Их үнэ",
            },
            {
              key: "duration",
              type: "number",
              label: "Хугацаа",
            },
          ].map((item, i) => {
            const name = item.key as keyof ServiceType;
            const label = item.label as keyof ServiceType;
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
        </FormProvider>
      </Modal>
      <DataTable
        columns={columns}
        count={services?.count}
        data={services?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      /> */}
    </div>
  );
};
