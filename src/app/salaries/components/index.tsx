"use client";
import { DataTable } from "@/components/data-table";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  ListDefault,
  SalaryLogValues,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, excel, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import DynamicHeader from "@/components/dynamicHeader";
import { SalaryLogStatus } from "@/lib/enum";
import { ISalaryLog, SalaryLog, User } from "@/models";
import { mnDate, usernameFormatter } from "@/lib/functions";
import { DatePicker } from "@/shared/components/date.picker";
import { showToast } from "@/shared/components/showToast";

const formSchema = z.object({
  date: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ) as unknown as Date,
  salary_log_status: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(SalaryLogStatus).nullable()
    )
    .optional() as unknown as number,
  amount: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  order_count: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  user_id: z.string(),
  user_name: z.string(),
  edit: z.string().nullable().optional(),
});
const defaultValues = {
  date: undefined,
  salary_status: undefined,
  amount: 0,
  order_count: 0,
  user_id: "",
  user_name: "",
  edit: undefined,
};
type SalaryType = z.infer<typeof formSchema>;
export const SalaryPage = ({
  data,
  users,
}: {
  data: ListType<SalaryLog>;
  users: ListType<User>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<SalaryType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [salaries, setSalaries] = useState<ListType<SalaryLog>>(ListDefault);
  const deleteLog = async (index: number) => {
    const id = salaries!.items[index].id;
    const res = await deleteOne(Api.salary_log, id);
    refresh();
    return res.success;
  };
  const edit = async (e: ISalaryLog) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const userMap = useMemo(
    () => new Map(users.items.map((b) => [b.id, b])),
    [users.items]
  );

  const userFormatter = (data: ListType<SalaryLog>) => {
    const items: SalaryLog[] = data.items.map((item) => {
      const user = userMap.get(item.user_id);

      return {
        ...item,
        user_name: user ? usernameFormatter(user) : "",
      };
    });
    setSalaries({ items, count: data.count });
  };

  useEffect(() => {
    userFormatter(data);
  }, [data]);
  const columns = getColumns(edit, deleteLog);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<SalaryLog>(Api.salary_log, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
    }).then((d) => {
      userFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as SalaryType;
    const { edit, ...payload } = body;

    const res = edit
      ? await updateOne<ISalaryLog>(
          Api.salary_log,
          edit ?? "",
          payload as unknown as ISalaryLog
        )
      : await create<ISalaryLog>(Api.salary_log, e as ISalaryLog);
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
  const downloadExcel = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const res = await excel(Api.salary_log, {
      page: page ?? DEFAULT_PG.page,
      limit: -1,
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
        `salary_${mnDate().toISOString().slice(0, 10)}.xlsx`
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
    <div className="">
      <DynamicHeader />

      <div className="admin-container">
        <DataTable
          columns={columns}
          count={salaries?.count}
          data={salaries?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          excel={downloadExcel}
          modalAdd={
            <Modal
              maw="xl"
              name={"Цалин нэмэх"}
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              reset={() => {
                setOpen(false);
                form.reset({});
              }}
              setOpen={(v) => setOpen(v)}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="divide-y">
                  <div className="grid grid-cols-2 gap-3 pt-5">
                    <FormItems
                      label="Статус"
                      control={form.control}
                      name="salary_log_status"
                      className={"col-span-1"}
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={getEnumValues(SalaryLogStatus).map(
                              (item) => {
                                return {
                                  value: item.toString(),
                                  label: SalaryLogValues[item],
                                };
                              }
                            )}
                          />
                        );
                      }}
                    </FormItems>
                    <FormItems
                      label="Нэр"
                      control={form.control}
                      name="user_id"
                      className={"col-span-1"}
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            search={true}
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
                    <FormItems control={form.control} name="date">
                      {(field) => {
                        return (
                          <DatePicker
                            name="Огноо"
                            pl="Огноо сонгох"
                            props={{ ...field }}
                          />
                        );
                      }}
                    </FormItems>
                    <FormItems
                      control={form.control}
                      name="order_count"
                      label="Нийт хийсэн үйлчилгээ"
                    >
                      {(field) => {
                        return (
                          <TextField
                            props={{
                              name: "order_count",
                              onBlur: () => {},
                              onChange: () => {},
                              disabled: true,
                              ref: () => {},
                              value: form.getValues("order_count"),
                            }}
                            type={"number"}
                          />
                        );
                      }}
                    </FormItems>
                  </div>
                </div>
              </FormProvider>
            </Modal>
          }
        />
      </div>
    </div>
  );
};
