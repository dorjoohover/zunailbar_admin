"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  ListDefault,
  Option,
  EmployeeStatusValue,
} from "@/lib/constants";
import { Api } from "@/utils/api";
import { create, deleteOne } from "@/app/(api)";
import { ComboBox } from "@/shared/components/combobox";
import { fetcher } from "@/hooks/fetcher";
import { Branch, Schedule, User } from "@/models";
import { mobileFormatter, toYMD, usernameFormatter } from "@/lib/functions";
import { EmployeeStatus } from "@/lib/enum";
import DynamicHeader from "@/components/dynamicHeader";
import { FilterType } from "@/app/orders/components";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { showToast } from "@/shared/components/showToast";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";

export const ArtistLeavePage = ({
  data,
  users,
  branches,
}: {
  data: ListType<Schedule>;
  users: ListType<User>;
  branches: ListType<Branch>;
}) => {
  const [artistLeaves, setArtistLeaves] =
    useState<ListType<Schedule>>(ListDefault);
  const userMap = useMemo(
    () => new Map(users.items.map((b) => [b.id, b])),
    [users.items],
  );
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items],
  );
  const [action, setAction] = useState(ACTION.DEFAULT);

  const formatter = (data: ListType<Schedule>) => {
    const items: Schedule[] = data.items.map((item) => {
      const user = userMap.get(item.user_id);
      const branch = branchMap.get(user?.branch_id ?? "");
      return {
        ...item,
        branch_name: branch?.name ?? "",
        user_name: user ? usernameFormatter(user) : "",
      };
    });
    setArtistLeaves({ items, count: data.count });
  };
  useEffect(() => {
    formatter(data);
  }, [data]);

  const [selectedDate, setSelectedDate] = useState<Date[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus>(
    EmployeeStatus.VACATION,
  );
  const [l, setL] = useState(DEFAULT_PG.limit);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    setSelectedDate([]);
    const { page, limit } = pg;
    await fetcher<Schedule>(
      Api.schedule,
      {
        user_id: filter.artist,
        limit: limit ?? l,
        page: page,
      },
      "leave",
    ).then((d) => {
      formatter(d);
    });
    setAction(ACTION.DEFAULT);
  };

  const onSubmit = async (edit = false) => {
    if (!filter.artist) {
      showToast("info", "Артист сонгоно уу");
      return;
    }
    if (!selectedStatus) {
      showToast("info", "Статус сонгоно уу");
      return;
    }
    setAction(ACTION.RUNNING);
    const formatted = selectedDate.map(toYMD);
    const body = {
      user_id: filter.artist,
      dates: formatted,
      leave_status: edit ? null : selectedStatus,
    };
    const res = await create(Api.schedule, body, "leave");
    if (res.success) {
      showToast("info", "Амжилттай");
      refresh();
      setSelectedDate([]);
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };

  const [filter, setFilter] = useState<FilterType>({
    artist: users.items[0]?.id,
  });
  const [isList, setList] = useState(true);
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    refresh();
  }, [filter]);

  const groups: { key: keyof FilterType; label: string; items: Option[] }[] =
    useMemo(
      () => [
        {
          key: "artist",
          label: "Артист",
          items: users.items.map((b) => ({
            value: b.id,
            label: `${usernameFormatter(b)} ${mobileFormatter(b.mobile ?? "")}`,
          })),
        },
      ],
      [users.items],
    );

  const statusList = [EmployeeStatus.VACATION, EmployeeStatus.DEKIRIT] as const;

  const modifiers: Record<string, (date: Date) => boolean> = {
    today: (date: Date) => isSameDay(date, new Date()),
    selected: (date: Date) => selectedDate.some((sd) => isSameDay(sd, date)),
  };
  statusList.forEach((status) => {
    modifiers[status] = (date: Date) =>
      artistLeaves.items.some(
        (al) =>
          al.date &&
          isSameDay(date, al.date) &&
          al.leave_status === status,
      );
  });
  const modifiersStyles = {
    ...statusList.reduce(
      (acc, status) => {
        const { bg, text } = EmployeeStatusValue[status];
        acc[status] = { backgroundColor: bg, color: text };
        return acc;
      },
      {} as Record<string, { backgroundColor: string; color: string }>,
    ),
    selected: { color: "#f1f" },
    today: { borderRadius: "50px", overflow: "hidden" },
  };

  function toggleDate(d: Date) {
    setSelectedDate((prev) => {
      if (prev.some((sd) => isSameDay(sd, d))) {
        return prev.filter((sd) => !isSameDay(sd, d));
      }
      return [...prev, d];
    });
  }

  const deleteArtistLeave = async (index: number) => {
    const item = artistLeaves.items[index];
    if (!item?.date) return false;
    const res = await deleteOne(
      Api.schedule,
      `${item.user_id}/${toYMD(new Date(item.date))}`,
      "leave",
    );
    if (res.success) {
      showToast("info", "Амжилттай устгагдлаа");
      refresh();
    }
    return res.success;
  };

  const updateStatus = async (index: number, status: EmployeeStatus) => {
    const item = artistLeaves.items[index];
    if (!item?.date) return;
    const res = await create(
      Api.schedule,
      {
        user_id: item.user_id,
        dates: [toYMD(new Date(item.date))],
        leave_status: status,
      },
      "leave",
    );
    if (res.success) {
      refresh();
      showToast("success", "Амжилттай шинэчиллээ.");
    } else {
      showToast("error", res.error ?? "");
    }
  };

  const columns = getColumns(updateStatus, deleteArtistLeave);

  return (
    <div className="">
      <DynamicHeader count={artistLeaves?.count} />

      <div className="admin-container">
        <div className="flex w-full items-center justify-between bg-white p-3 rounded-2xl border-light shadow-light">
          {groups.map((item, i) => {
            const { key } = item;
            return (
              <label key={i} className="w-auto">
                <span className="filter-label">{item.label as string}</span>
                <ComboBox
                  pl={item.label}
                  name={item.label}
                  className="min-w-50 max-w-50 w-full text-xs!"
                  value={filter?.[key] ? String(filter[key]) : ""}
                  items={item.items.map((it) => ({
                    value: String(it.value),
                    label: it.label as string,
                  }))}
                  props={{
                    value: filter?.[key] ? String(filter[key]) : "",
                    onChange: (val: string) => changeFilter(key, val),
                    onBlur: () => {},
                    name: key,
                    ref: () => {},
                  }}
                />
              </label>
            );
          })}
          <div className="flex items-center justify-end gap-2 mt-2 max-w-lg w-full">
            <Switch
              checked={isList}
              onCheckedChange={(val) => setList(val)}
              id="compare-switch"
            />
            <label
              htmlFor="compare-switch"
              className="text-sm text-muted-foreground"
            >
              Жагсаалтаар харах
            </label>
          </div>
        </div>

        {!isList && (
          <div className="grid gap-2 grid-cols-12 mt-10 mb-6">
            {statusList.map((status) => {
              const { color, name } = EmployeeStatusValue[status];
              return (
                <div key={status} className="flex gap-2 items-center">
                  <span className={cn(color, "w-5 h-5 rounded-none")}></span>
                  <span>{name}</span>
                </div>
              );
            })}
          </div>
        )}

        {isList ? (
          <DataTable
            columns={columns}
            count={artistLeaves?.count}
            data={artistLeaves?.items ?? []}
            refresh={refresh}
            loading={action == ACTION.RUNNING}
            search={false}
            limit={l}
          />
        ) : (
          <div>
            <Calendar
              className="shadow-lg shadow-primary border border-primary/20 rounded-md bg-transparent "
              classNames={{ day_button: "h-20 w-20" }}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              onDayClick={toggleDate}
            />
            {selectedDate?.length > 0 && (
              <div className="flex justify-between max-w-147 items-center mt-8">
                <label>
                  <span className="filter-label">{"Статус"}</span>
                  <ComboBox
                    pl={"Статус"}
                    name={"Статус"}
                    className="min-w-50 max-w-50 w-full text-xs!"
                    value={selectedStatus?.toString()}
                    items={statusList.map((status) => ({
                      label: EmployeeStatusValue[status].name,
                      value: status,
                    }))}
                    props={{
                      value: selectedStatus?.toString(),
                      onChange: (val: string) => setSelectedStatus(+val),
                      onBlur: () => {},
                      name: "status",
                      ref: () => {},
                    }}
                  />
                </label>
                <div className="flex gap-2">
                  <Button onClick={() => onSubmit(true)} className="bg-red-500">
                    Устгах
                  </Button>
                  <Button onClick={() => onSubmit()}>Хадгалах</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
