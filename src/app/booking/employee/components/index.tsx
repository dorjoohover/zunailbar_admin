"use client";
import { ISchedule, User, Schedule } from "@/models";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListType, ACTION, PG, DEFAULT_PG } from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { fetcher } from "@/hooks/fetcher";
import { usernameFormatter } from "@/lib/functions";
import { ScheduleForm, ScheduleTable } from "@/components/layout/schedule.table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import DynamicHeader from "@/components/dynamicHeader";
import { cn } from "@/lib/utils";

const hourLine = z.string();
const limit = 7;
const formSchema = z.object({
  user_id: z.string().min(1),
  dates: z.array(hourLine).length(7), // 7 хоног
  edit: z.string().nullable().optional(),
});
const defaultValues: ScheduleType = {
  user_id: "",
  dates: ["", "", "", "", "", "", ""],
  edit: undefined,
};
type ScheduleType = z.infer<typeof formSchema>;
export const SchedulePage = ({ data, users }: { data: ListType<Schedule>; users: ListType<User> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<ScheduleType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [schedules, setSchedules] = useState<ListType<Schedule> | null>(null);
  const [lastSchedule, setLastSchedule] = useState<Schedule | null>(null);
  const [page, setPage] = useState(0);
  const [branch, setBranch] = useState(users.items[0]);
  const userMap = useMemo(() => new Map(users.items.map((b) => [b.id, b])), [users.items]);

  const ScheduleFormatter = (data: ListType<Schedule>) => {
    const items: Schedule[] = data.items.map((item) => {
      const user = userMap.get(item.user_id);

      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });

    setSchedules({ items, count: data.count });
    setLastSchedule(items[0]);
  };
  useEffect(() => {
    ScheduleFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deleteSchedule = async (index: number) => {
    const id = schedules!.items[index].id;
    const res = await deleteOne(Api.schedule, id);
    refresh();
    return res.success;
  };
  const edit = async (e: ISchedule) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  // const columns = getColumns(edit, deleteSchedule);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { sort } = pg;
    await fetcher<Schedule>(
      Api.schedule,
      {
        page: page,
        limit,
        sort,
        user_id: branch.id,
        //   name: pg.filter,
      },
      "employee"
    ).then((d) => {
      ScheduleFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    let lastDate = lastSchedule ? new Date(lastSchedule?.date) : new Date();
    if (lastSchedule) lastDate = new Date(lastDate.setDate(lastDate.getDate() + 7));
    const date = lastDate;
    console.log(e, date);
    setAction(ACTION.RUNNING);
    const body = e as ScheduleType;
    const { edit, ...payload } = body;
    const user = users.items.filter((user) => user.id == body.user_id)[0];
    const res = edit
      ? await updateOne<Schedule>(Api.schedule, edit ?? "", payload as unknown as Schedule)
      : await create<ISchedule>(Api.schedule, {
          date: date,
          times: body.dates,
          user_id: body.user_id,
          branch_id: user.branch_id,
        });
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

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current ? refresh() : (mounted.current = true);
  }, [page, branch]);

  return (
    <div className="">
      <DynamicHeader />

      <div className="admin-container space-y-0">
        <Modal
          maw="5xl"
          title="Арчистын хуваарь оруулах форм"
          name={"Арчистын хуваарь оруулах"}
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
            <FormItems control={form.control} name="user_id">
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
            <div className={cn("max-h-[60vh] overflow-y-scroll")}>
              <FormItems control={form.control} name={"dates"} className="">
                {(field) => {
                  const value = (field.value as string[]) ?? Array(7).fill("");
                  let date = new Date();
                  if (lastSchedule) {
                    const lastDate = new Date(lastSchedule.date);
                    date = new Date(lastDate.setDate(lastDate.getDate() + 7));
                  }

                  return (
                    <ScheduleForm
                      date={date}
                      value={value}
                      setValue={(next) =>
                        form.setValue("dates", next, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                    />
                  );
                }}
              </FormItems>
            </div>
          </FormProvider>
        </Modal>
        <ComboBox
          items={users.items.map((b, i) => {
            return {
              label: usernameFormatter(b),
              value: b.id,
            };
          })}
          props={{
            onChange: (v: string) => {
              const selected = users.items.filter((b) => b.id == v)[0];
              setBranch(selected);
            },
            name: "",
            onBlur: () => {},
            ref: () => {},
            value: branch?.id,
          }}
        />
        <Pagination>
          <PaginationContent>
            {page > 0 && (
              <PaginationItem>
                <PaginationNext onClick={() => setPage(page - 1)} />
              </PaginationItem>
            )}

            {schedules && Math.ceil(+schedules.count / limit) - 1 > page && (
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
        {schedules?.items && schedules?.items?.length > 0 ? <ScheduleTable d={schedules.items?.[0]?.date} value={schedules.items.map((item) => item.times).reverse()} edit={null} /> : null}
        {/* <DataTable
        columns={columns}
        count={Schedules?.count}
        data={Schedules?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      /> */}
      </div>
    </div>
  );
};
