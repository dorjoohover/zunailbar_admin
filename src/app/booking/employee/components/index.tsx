"use client";
import { ISchedule, User, Schedule } from "@/models";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  ScheduleEdit,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { fetcher } from "@/hooks/fetcher";
import { numberArray, usernameFormatter } from "@/lib/functions";
import {
  ScheduleForm,
  ScheduleTable,
} from "@/components/layout/schedule.table";
import DynamicHeader from "@/components/dynamicHeader";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { showToast } from "@/shared/components/showToast";

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
export const SchedulePage = ({
  data,
  users,
}: {
  data: ListType<Schedule>;
  users: ListType<User>;
}) => {
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
  const userMap = useMemo(
    () => new Map(users.items.map((b) => [b.id, b])),
    [users.items]
  );

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
    let lastDate = lastSchedule ? lastSchedule?.index : 0;
    // if (lastSchedule)
    //   lastDate = new Date(lastDate.setDate(lastDate.getDate() + 7));
    const date = lastDate;
    setAction(ACTION.RUNNING);
    const body = e as ScheduleType;
    const { edit, ...payload } = body;
    const user = users.items.filter((user) => user.id == body.user_id)[0];

    const res = await create<ISchedule>(Api.schedule, {
      index: date,
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
  const [editSchedule, setEdit] = useState<ScheduleEdit[]>([]);
  const update = async () => {
    setAction(ACTION.RUNNING);
    let date = schedules?.items[0].index;
    if (date == null) return;
    date++;
    const dates = numberArray(7).map((date) => {
      const index = editSchedule.findIndex((e) => e.day == date);
      if (index != -1) {
        const time = editSchedule[index].times.join("|");
        return time;
      } else {
        return "";
      }
    });

    const res = await create<Schedule>(Api.schedule, {
      date: date,
      times: dates,
      branch_id: branch.branch_id,
      user_id: branch.id,
    } as any);
    if (res.success) {
      refresh();
      showToast("success", "Амжилттай шинэчиллээ.");
      setOpen(false);
      clear();
      setEdit([]);
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };
  const setUpdate = (time: number, day: number) => {
    setEdit((prev0: ScheduleEdit[]) => {
      const prev = Array.isArray(prev0) ? prev0 : [];
      const newTime = time + 7;

      // тухайн өдрийн индекс
      const idx = prev.findIndex((d) => d.day == day);

      // 1) Байхгүй бол шинээр нэмнэ
      if (idx === -1) {
        return [...prev, { day: day, times: [newTime] }];
      }

      // 2) Байсан бол times дээр toggle
      const days = prev[idx];
      const exists = days.times.includes(newTime);
      const newTimes = exists
        ? days.times.filter((t) => t !== newTime) // байсан бол устгана
        : [...days.times, newTime].sort((a, b) => a - b); // байгаагүй бол нэмээд эрэмбэлнэ

      // 3) Хэрэв times хоосон бол тухайн өдрийг массивээс устгана
      if (newTimes.length === 0) {
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      }

      // 4) Өдрийг шинэчилж буцаана
      const updated: ScheduleEdit = {
        ...days,
        times: newTimes,
      };
      return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
    });
  };
  const times = useMemo(() => {
    const days = 7;

    if (!schedules?.items) return [];

    // үргэлж 7 урттай times массив буцаана
    return Array.from({ length: days }, (_, i) => {
      const dayIndex = 6 - i; // 6,5,4,3,2,1,0
      const found = schedules.items.find((item) => item.index === dayIndex);
      return found ? found.times : "";
    }).reverse();
  }, [schedules?.items]);
  return (
    <div className="">
      <DynamicHeader />

      <div className="admin-container space-y-2">
        <div className="flex w-full items-center justify-between bg-white p-3 rounded-2xl border-light shadow-light">
          <ComboBox
            className="max-w-xs"
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

          <Modal
            maw="5xl"
            title="Арчистын хуваарь оруулах форм"
            name={"Арчистын хуваарь оруулах"}
            submit={() => form.handleSubmit(onSubmit, onInvalid)()}
            open={open == true}
            setOpen={(v) => {
              setOpen(v);
              clear();
            }}
            loading={action == ACTION.RUNNING}
          >
            <FormProvider {...form}>
              <FormItems
                control={form.control}
                name="user_id"
                className="block"
              >
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
              <FormItems control={form.control} name={"dates"}>
                {(field) => {
                  const value = (field.value as string[]) ?? Array(7).fill("");
                  let date = lastSchedule?.index ?? 0;
                  return (
                    <div className={cn("max-h-[60vh] overflow-y-scroll")}>
                      <ScheduleForm
                        artist={true}
                        date={date}
                        value={value}
                        setValue={(next) =>
                          form.setValue("dates", next, {
                            shouldDirty: true,
                            shouldTouch: true,
                          })
                        }
                      />
                    </div>
                  );
                }}
              </FormItems>
            </FormProvider>
          </Modal>
          {editSchedule.length > 0 && (
            <Button variant={"purple"} onClick={update}>
              Засах
            </Button>
          )}
        </div>
        {schedules?.items && schedules?.items?.length > 0 ? (
          <ScheduleTable
            artist={true}
            d={schedules.items?.[0]?.index ?? 0}
            value={times}
            edit={editSchedule}
            setEdit={setUpdate}
          />
        ) : null}
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
