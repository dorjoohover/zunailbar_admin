"use client";
import { DataTable } from "@/components/data-table";
import { IUser, User } from "@/models";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  CUSTOMER_USER_LEVELS,
  EMPLOYEE_USER_LEVELS,
  getEnumValues,
  Option,
  UserStatusValue,
  zStrOpt,
  PPDT,
  zNumOpt,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, excel, findOne, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { ROLE, UserLevel, UserStatus } from "@/lib/enum";
import DynamicHeader from "@/components/dynamicHeader";
import { PasswordField } from "@/shared/components/password.field";
import { showToast } from "@/shared/components/showToast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  getLevelName,
  LevelConfig,
  normalizeLevelConfig,
} from "@/lib/level-config";

const formSchema = z
  .object({
    mobile: z.string().length(8),
    nickname: zStrOpt({}),
    password: z.string().nullable().optional(),
    level: zNumOpt(),
    edit: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.edit && !data.password?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Нууц үг оруулна уу",
      });
    }
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
  level: LevelConfig;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<UserType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [Users, setUsers] = useState<ListType<User> | null>(data);
  const visitCountRequestRef = useRef(0);

  const withVisitCounts = async (list: ListType<User>) => {
    if (!list?.items?.length) {
      return list;
    }

    const items = await Promise.all(
      list.items.map(async (item) => {
        try {
          const res = await findOne(Api.order, item.id, "customer_count");
          return {
            ...item,
            order_count: Number(res?.payload?.count ?? 0),
          };
        } catch (error) {
          return {
            ...item,
            order_count: 0,
          };
        }
      })
    );

    return {
      ...list,
      items,
    };
  };

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
    form.reset({ ...e, password: "", edit: e.id });
  };

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const requestId = ++visitCountRequestRef.current;
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
    }).then(async (d) => {
      const enriched = await withVisitCounts(d);
      if (requestId === visitCountRequestRef.current) {
        setUsers(enriched);
      }
    });

    setAction(ACTION.DEFAULT);
  };
  const downloadExcel = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { sort, filter } = pg;
    const res = await excel(Api.user, {
      page: 0,
      limit: -1,
      sort: sort ?? DEFAULT_PG.sort,
      role: ROLE.CLIENT,
      mobile: filter,
      user_status: userFilter?.status,
      level: userFilter?.level,
    });

    if (res.success && res.data) {
      const blob = new Blob([res.data], { type: "application/xlsx" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      showToast("error", res.message);
    }
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as UserType;
    const { edit, ...payload } = body;
    const password = payload.password?.trim();
    if (password) {
      payload.password = password;
    } else {
      delete payload.password;
    }

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
          ...payload,
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
  useEffect(() => {
    const requestId = ++visitCountRequestRef.current;

    const hydrateInitialUsers = async () => {
      const enriched = await withVisitCounts(data);
      if (requestId === visitCountRequestRef.current) {
        setUsers(enriched);
      }
    };

    void hydrateInitialUsers();
  }, [data]);
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };
  const [levelOpen, setLevelOpen] = useState(false);
  const router = useRouter();
  const normalizedLevel = useMemo(() => normalizeLevelConfig(level), [level]);
  const [levelValue, setLevelValue] = useState<LevelConfig>(normalizedLevel);

  useEffect(() => {
    setLevelValue(normalizedLevel);
  }, [normalizedLevel]);

  const updateOrderLevel = async () => {
    const res = await updateOne(Api.order, "level", levelValue);
    toast(res, false);
    setLevelOpen(false);
    router.refresh();
  };

  const columns = getColumns(
    edit,
    deleteUser,
    updateStatus,
    updateLevel,
    levelValue
  );

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
          label: "Хэрэглэгчийн түвшин",
          items: CUSTOMER_USER_LEVELS.map((s) => ({
            value: s,
            label: getLevelName(levelValue, "customer", s),
          })),
        },
      ],
      [levelValue]
    );

  const filterClear = () => {
    setFilter({
      status: UserStatus.ACTIVE,
      level: undefined,
    });
  };

  return (
    <div className="">
      <DynamicHeader />
      <div className="admin-container">
        <DataTable
          clear={filterClear}
          excel={downloadExcel}
          filterRight={
            <>
              <Button onClick={() => setLevelOpen(true)}>
                Түвшний тохиргоо
              </Button>
              <Modal
                open={levelOpen}
                setOpen={(v) => setLevelOpen(v)}
                title="Түвшний тохиргоо"
                submit={updateOrderLevel}
              >
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Хэрэглэгчийн түвшний нэр, босго болон артистын түвшний
                    нэрийг тус тусад нь эндээс солино.
                  </p>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Хэрэглэгчийн түвшин</h3>
                    {CUSTOMER_USER_LEVELS.map((key) => {
                      const value = levelValue.customer[key] ?? {
                        name: getLevelName(levelValue, "customer", key),
                        threshold: 0,
                      };

                      return (
                        <div key={key} className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm">Нэр</label>
                            <TextField
                              props={{
                                name: `${key}_name`,
                                value: value.name,
                                onChange: (name: string) =>
                                  setLevelValue((prev) => ({
                                    ...prev,
                                    customer: {
                                      ...prev.customer,
                                      [key]: {
                                        ...(prev.customer[key] ?? value),
                                        name,
                                      },
                                    },
                                  })),
                                ref: () => null,
                                onBlur: () => {},
                              }}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm">
                              Босго
                            </label>
                            <TextField
                              props={{
                                name: `${key}_threshold`,
                                value: value.threshold ?? 0,
                                onChange: (e: string) => {
                                  const threshold = parseInt(e, 10);
                                  if (isNaN(threshold)) return;

                                  setLevelValue((prev) => ({
                                    ...prev,
                                    customer: {
                                      ...prev.customer,
                                      [key]: {
                                        ...(prev.customer[key] ?? value),
                                        threshold,
                                      },
                                    },
                                  }));
                                },
                                ref: () => null,
                                onBlur: () => {},
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Артистын түвшин</h3>
                    {EMPLOYEE_USER_LEVELS.map((key) => {
                      const value = levelValue.employee[key] ?? {
                        name: getLevelName(levelValue, "employee", key),
                      };

                      return (
                        <div key={key}>
                          <label className="mb-1 block text-sm">Нэр</label>
                          <TextField
                            props={{
                              name: `${key}_employee_name`,
                              value: value.name,
                              onChange: (name: string) =>
                                setLevelValue((prev) => ({
                                  ...prev,
                                  employee: {
                                    ...prev.employee,
                                    [key]: {
                                      ...(prev.employee[key] ?? value),
                                      name,
                                    },
                                  },
                                })),
                              ref: () => null,
                              onBlur: () => {},
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                    <FormItems control={form.control} name="password">
                      {(field) => {
                        return (
                          <PasswordField
                            props={{ ...field }}
                            view={true}
                            label={
                              form.watch("edit")
                                ? "Шинэ нууц үг (заавал биш)"
                                : "Нууц үг"
                            }
                          />
                        );
                      }}
                    </FormItems>
                    <FormItems
                      control={form.control}
                      name={"level"}
                      label="Хэрэглэгчийн түвшин"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={CUSTOMER_USER_LEVELS.map((item) => {
                              return {
                                value: item.toString(),
                                label: getLevelName(
                                  levelValue,
                                  "customer",
                                  item
                                ),
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
