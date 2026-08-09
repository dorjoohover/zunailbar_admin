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
import { Branch, Booking } from "@/models";
import { toYMD } from "@/lib/functions";
import { EmployeeStatus } from "@/lib/enum";
import DynamicHeader from "@/components/dynamicHeader";
import { FilterType } from "@/app/orders/components";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { showToast } from "@/shared/components/showToast";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./column";

export const BranchLeavePage = ({
  data,
  branches,
}: {
  data: ListType<Booking>;
  branches: ListType<Branch>;
}) => {
  const [branchLeaves, setBranchLeaves] =
    useState<ListType<Booking>>(ListDefault);
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items],
  );
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [l, setL] = useState(DEFAULT_PG.limit);

  const formatter = (data: ListType<Booking>) => {
    const items: Booking[] = data.items.map((item) => {
      const branch = branchMap.get(item.branch_id);
      return {
        ...item,
        branch_name: item.branch_name ?? branch?.name ?? "",
      };
    });
    setBranchLeaves({ items, count: data.count });
  };
  useEffect(() => {
    formatter(data);
  }, [data]);

  const [selectedDate, setSelectedDate] = useState<Date[]>([]);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    setSelectedDate([]);
    const { page, limit } = pg;
    await fetcher<Booking>(
      Api.booking,
      {
        branch_id: filter.branch,
        page: page ?? DEFAULT_PG.page,
        limit: limit ?? l,
      },
      "leave",
    ).then((d) => {
      formatter(d);
    });
    setAction(ACTION.DEFAULT);
  };

  const onSubmit = async (clear = false) => {
    if (!filter.branch) {
      showToast("info", "Салбар сонгоно уу");
      return;
    }
    setAction(ACTION.RUNNING);
    const formatted = selectedDate.map(toYMD);
    const body = {
      branch_id: filter.branch,
      dates: formatted,
      is_leave: !clear,
    };
    const res = await create(Api.booking, body, "leave");
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
    branch: branches.items[0]?.id,
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
          key: "branch",
          label: "Салбар",
          items: branches.items.map((b) => ({
            value: b.id,
            label: b.name ?? "-",
          })),
        },
      ],
      [branches.items],
    );

  const modifiers: Record<string, (date: Date) => boolean> = {
    today: (date: Date) => isSameDay(date, new Date()),
    selected: (date: Date) => selectedDate.some((sd) => isSameDay(sd, date)),
  };
  modifiers[EmployeeStatus.VACATION] = (date: Date) =>
    branchLeaves.items.some((bl) => bl.date && isSameDay(date, bl.date));

  const modifiersStyles = {
    [EmployeeStatus.VACATION]: {
      backgroundColor: EmployeeStatusValue[EmployeeStatus.VACATION].bg,
      color: EmployeeStatusValue[EmployeeStatus.VACATION].text,
    },
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

  const deleteBranchLeave = async (index: number) => {
    const item = branchLeaves.items[index];
    if (!item?.date) return false;
    const res = await deleteOne(
      Api.booking,
      `${item.branch_id}/${toYMD(new Date(item.date))}`,
      "leave",
    );
    if (res.success) {
      showToast("info", "Амжилттай устгагдлаа");
      refresh();
    }
    return res.success;
  };

  const edit = (_body: Booking) => {};
  const columns = getColumns(edit, deleteBranchLeave);

  return (
    <div className="">
      <DynamicHeader count={branchLeaves?.count} />

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
            <div className="flex gap-2 items-center">
              <span
                className="w-5 h-5 rounded-none"
                style={{
                  backgroundColor: EmployeeStatusValue[EmployeeStatus.VACATION].bg,
                }}
              ></span>
              <span>Хаалттай</span>
            </div>
          </div>
        )}

        {isList ? (
          <DataTable
            columns={columns}
            count={branchLeaves?.count}
            data={branchLeaves?.items ?? []}
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
                <label></label>
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
