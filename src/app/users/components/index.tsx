"use client";
import { DataTable } from "@/components/data-table";
import { Branch, IUser, User } from "@/models";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  Option,
  UserStatusValue,
  zStrOpt,
  PPDT,
  getUserLevelValue,
  zNumOpt,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, search, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { ROLE, UserLevel, UserStatus } from "@/lib/enum";
import DynamicHeader from "@/components/dynamicHeader";
import { objectCompact } from "@/lib/functions";
import { FilterPopover } from "@/components/layout/popover";
import { Checkbox } from "@radix-ui/react-checkbox";
import { PasswordField } from "@/shared/components/password.field";
import { showToast } from "@/shared/components/showToast";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  mobile: z.string().length(8),
  nickname: zStrOpt(),
  password: zStrOpt({
    allowNullable: false,
    label: "Нууц үг",
  }),
  level: zNumOpt(),
  edit: z.string().nullable().optional(),
});

const defaultValues: UserType = {
  mobile: "",
  nickname: "",
  password: "",
  level: UserLevel.BRONZE,
  edit: undefined,
};
type FilterType = {
  status?: number;
  level?: number;
};
type UserType = z.infer<typeof formSchema>;
export const UserPage = ({
  data,
  level,
}: {
  data: ListType<User>;
  level: Record<UserLevel, number>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<UserType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [Users, setUsers] = useState<ListType<User> | null>(data);

  const clear = () => {
    form.reset(defaultValues);
  };
  const deleteUser = async (index: number) => {
    const id = Users!.items[index].id;
    const res = await deleteOne(Api.user, id);
    refresh();
    toast(res, true);
    return res.success;
  };
  const updateStatus = async (index: number, status: UserStatus) => {
    const id = Users!.items[index].id;
    const res = await updateOne(
      Api.user,
      id,
      {
        user_status: status,
      },
      "status"
    );
    refresh();
    toast(res, true);
    return res.success;
  };
  const updateLevel = async (index: number, level: UserLevel) => {
    const id = Users!.items[index].id;
    const res = await updateOne(
      Api.user,
      id,
      {
        level,
      },
      "level"
    );
    refresh();
    toast(res, true);
    return res.success;
  };
  const toast = (result: PPDT, edit?: string | null | undefined | boolean) => {
    if (result.success) {
      refresh();
      setOpen(false);
      showToast(
        "success",
        !edit ? "Мэдээлэл шинэчлэлээ." : "Амжилттай нэмлээ."
      );
      clear();
    } else {
      showToast("error", result?.error ?? "");
    }
  };
  const edit = async (e: IUser) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };

  const columns = getColumns(edit, deleteUser, updateStatus, updateLevel);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort, filter } = pg;
    const user_status = userFilter?.status;
    const level = userFilter?.level;
    await fetcher<User>(Api.user, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      role: ROLE.CLIENT,
      mobile: filter,
      user_status,
      level,
      ...pg,
    }).then((d) => {
      setUsers(d);
    });

    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as UserType;
    const { edit, ...payload } = body;

    const res = edit
      ? await updateOne<User>(
          Api.user,
          edit ?? "",
          {
            ...payload,
            birthday: null,
          } as unknown as User,
          "one"
        )
      : await create<User>(Api.user, {
          ...e,
          role: ROLE.CLIENT,
          birthday: null,
        } as any);

    toast(res, edit);
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    const value = e as any;
    if (value.password != undefined)
      showToast("info", value.password?.message ?? "");
  };
  const [userFilter, setFilter] = useState<FilterType>({
    status: UserStatus.ACTIVE,
  });
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    refresh();
  }, [userFilter]);
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const groups: { key: keyof FilterType; label: string; items: Option[] }[] =
    useMemo(
      () => [
        {
          key: "status",
          label: "Статус",
          items: getEnumValues(UserStatus).map((s) => ({
            value: s,
            label: UserStatusValue[s].name,
          })),
        },
        {
          key: "level",
          label: "Эрэмбэ",
          items: getEnumValues(UserLevel).map((s) => ({
            value: s,
            label: getUserLevelValue[s].name,
          })),
        },
      ],
      []
    );

  const filterClear = () => {
    setFilter({
      status: UserStatus.ACTIVE,
      level: undefined,
    });
  };

  const [levelOpen, setLevelOpen] = useState(false);
  const router = useRouter();
  const [levelValue, setLevelValue] =
    useState<Record<UserLevel, number>>(level);
  const updateOrderLevel = async () => {
    const res = await updateOne(Api.order, "level", level);
    toast(res, false);
    setLevelOpen(false);
    router.refresh();
  };
  return (
    <div className="">
      <DynamicHeader />
      <div className="admin-container">
        <DataTable
          clear={filterClear}
          filterRight={
            <>
              <Button onClick={() => setLevelOpen(true)}>Эрэмбэ</Button>
              <Modal
                open={levelOpen}
                setOpen={(v) => setLevelOpen(v)}
                title="Эрэмбэ"
                submit={updateOrderLevel}
              >
                {Object.entries(levelValue ?? level).map(([k, value], i) => {
                  const key = k as unknown as UserLevel;

                  const lvl = getUserLevelValue[key];
                  if (lvl)
                    return (
                      <div key={i} className="mb-2">
                        <label className="mb-1">{lvl.name}</label>
                        <TextField
                          props={{
                            name: k,
                            value,
                            onChange: (e: string) => {
                              const v = parseInt(e);
                              if (isNaN(v)) return;

                              setLevelValue((prev) => ({
                                ...prev,
                                [k]: v,
                              }));
                            },
                            ref: () => null,
                            onBlur: () => {},
                          }}
                        />
                      </div>
                    );
                })}
              </Modal>
            </>
          }
          filter={
            <>
              {groups.map((item, i) => {
                const { key } = item;
                return (
                  <label key={i}>
                    <span className="filter-label">{item.label as string}</span>
                    <ComboBox
                      pl={item.label}
                      name={item.label}
                      className="max-w-36 text-xs!"
                      value={userFilter?.[key] ? String(userFilter[key]) : ""} //
                      items={item.items.map((it) => ({
                        value: String(it.value),
                        label: it.label as string,
                      }))}
                      props={{
                        value: userFilter?.[key] ? String(userFilter[key]) : "",
                        onChange: (val: string) => changeFilter(key, val),
                        onBlur: () => {},
                        name: key,
                        ref: () => {},
                      }}
                    />
                  </label>
                );
              })}
            </>
          }
          columns={columns}
          count={Users?.count}
          data={Users?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              maw="md"
              name={"Хэрэглэгч нэмэх"}
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(v) => {
                setOpen(v);
                clear();
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="space-y-4">
                  {[
                    {
                      key: "nickname",
                      label: "Нэр",
                    },
                    {
                      pattern: true,
                      key: "mobile",
                      label: "Утас",
                      type: "number",
                    },
                  ].map((item, i) => {
                    const name = item.key as keyof UserType;
                    const label = item.label as keyof UserType;

                    return (
                      <FormItems
                        label={label}
                        control={form.control}
                        name={name}
                        key={i}
                        className={item.key === "name" ? "col-span-2" : ""}
                      >
                        {(field) => {
                          const blockRe: RegExp | undefined = item.pattern
                            ? /[^\p{L}\s\-']/gu
                            : undefined;

                          return <TextField props={{ ...field }} />;
                        }}
                      </FormItems>
                    );
                  })}
                  <div className="double-col">
                    {form.watch("edit") == undefined && (
                      <FormItems control={form.control} name="password">
                        {(field) => {
                          return (
                            <PasswordField props={{ ...field }} view={true} />
                          );
                        }}
                      </FormItems>
                    )}
                    <FormItems
                      control={form.control}
                      name={"level"}
                      label="Эрэмбэ"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={getEnumValues(UserLevel).map((item) => {
                              return {
                                value: item.toString(),
                                label: getUserLevelValue[item].name,
                              };
                            })}
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
