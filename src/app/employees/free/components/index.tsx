"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useMemo, useState } from "react";
import { ListType, ACTION, PG, DEFAULT_PG, ListDefault } from "@/lib/constants";
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
import { ISchedule, Schedule, User } from "@/models";
import { usernameFormatter } from "@/lib/functions";
import { ScheduleStatus } from "@/lib/enum";

const formSchema = z.object({
  branch_id: z.string().min(1),
  name: z.string().min(1),
  max_price: z
    .preprocess((val) => (typeof val === "string" ? parseFloat(val) : val), z.number())
    .nullable()
    .optional() as unknown as number,
  min_price: z.preprocess((val) => (typeof val === "string" ? parseFloat(val) : val), z.number()) as unknown as number,
  duration: z.preprocess((val) => (typeof val === "string" ? parseFloat(val) : val), z.number()) as unknown as number,
  edit: z.string().nullable().optional(),
});
const defaultValues: PendingScheduleType = {
  branch_id: "",
  name: "",
  max_price: null,
  min_price: 0,
  duration: 0,
  edit: undefined,
};
type PendingScheduleType = z.infer<typeof formSchema>;
export const PendingSchedulePage = ({ data, users }: { data: ListType<Schedule>; users: ListType<User> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<PendingScheduleType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [pendingSchedules, PendingSchedules] = useState<ListType<Schedule>>(ListDefault);
  const userMap = useMemo(() => new Map(users.items.map((b) => [b.id, b])), [users.items]);

  const pendingScheduleFormatter = (data: ListType<Schedule>) => {
    const items: Schedule[] = data.items.map((item) => {
      const user = userMap.get(item.user_id);

      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });

    PendingSchedules({ items, count: data.count });
  };
  useEffect(() => {
    pendingScheduleFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deletePendingSchedule = async (index: number) => {
    const id = pendingSchedules!.items[index].id;
    const res = await deleteOne(Api.schedule, id);
    refresh();
    return res.success;
  };
  const edit = async (e: Schedule) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deletePendingSchedule);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Schedule>(Api.schedule, {
      page,
      limit,
      sort,
      schedule_status: ScheduleStatus.Pending,
      //   name: pg.filter,
    }).then((d) => {
      pendingScheduleFormatter(d);
      console.log(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as PendingScheduleType;
    const { edit, ...payload } = body;
    const res = edit ? await updateOne<Schedule>(Api.schedule, edit ?? "", e as Schedule) : await create<Schedule>(Api.schedule, e as Schedule);
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

  return (
    <div className="">
      <DataTable
        columns={columns}
        count={pendingSchedules?.count}
        data={pendingSchedules?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
        modalAdd={
          <Modal
            title="Чөлөө авах хүсэлт форм"
            name={"Нэмэх"}
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
              <FormItems label="Нэр" control={form.control} name="branch_id">
                {(field) => {
                  return (
                    <ComboBox
                      props={{ ...field }}
                      items={users.items.map((item) => {
                        return {
                          value: item.id,
                          label: usernameFormatter(item),
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
                const name = item.key as keyof PendingScheduleType;
                const label = item.label as keyof PendingScheduleType;
                return (
                  <FormItems control={form.control} name={name} key={i} className={item.key === "name" ? "col-span-2" : ""}>
                    {(field) => {
                      return <TextField props={{ ...field }} type={item.type} label={label} />;
                    }}
                  </FormItems>
                );
              })}
            </FormProvider>
          </Modal>
        }
      />
      {action}
      {/* <ProductDialog
        editingProduct={editingProduct}
        onChange={onChange}
        save={handleSave}
      /> */}
    </div>
  );
};
