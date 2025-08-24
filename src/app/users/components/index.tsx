"use client";
import { DataTable } from "@/components/data-table";
import { Branch, IUser, User } from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
  Option,
  UserStatusValue,
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
import { ROLE, UserStatus } from "@/lib/enum";
import DynamicHeader from "@/components/dynamicHeader";
import { objectCompact } from "@/lib/functions";
import { FilterPopover } from "@/components/layout/popover";
import { Checkbox } from "@radix-ui/react-checkbox";
import { PasswordField } from "@/shared/components/password.field";

const formSchema = z.object({
  mobile: z.string().min(1),
  nickname: z.string().min(1),
  password: z.string().min(1),
  edit: z.string().nullable().optional(),
});
const defaultValues: UserType = {
  mobile: "",
  nickname: "",
  password: "",
  edit: undefined,
};
type FilterType = {
  status?: number;
};
type UserType = z.infer<typeof formSchema>;
export const UserPage = ({ data }: { data: ListType<User> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<UserType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [Users, setUsers] = useState<ListType<User> | null>(null);

  const UserFormatter = (data: ListType<User>) => {
    const items: User[] = data.items.map((item) => {
      return {
        ...item,
      };
    });

    setUsers({ items, count: data.count });
  };
  useEffect(() => {
    UserFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deleteUser = async (index: number) => {
    const id = Users!.items[index].id;
    const res = await deleteOne(Api.user, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IUser) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteUser);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<User>(Api.user, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      role: ROLE.CLIENT,
      ...pg,
      //   name: pg.filter,
    }).then((d) => {
      UserFormatter(d);
      console.log(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as UserType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<User>(Api.user, edit ?? "", {
          ...payload,
          birthday: null,
        } as unknown as User)
      : await create<User>(Api.user, {
          ...e,
          role: ROLE.CLIENT,
          birthday: null,
        } as any);
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
  const [filter, setFilter] = useState<FilterType>();
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    refresh(
      objectCompact({
        user_status: filter?.status,

        page: 0,
      })
    );
  }, [filter]);
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
      ],
      []
    );
  return (
    <div className="">
      <DynamicHeader />

      <div className="admin-container">
        <DataTable
          clear={() => setFilter(undefined)}
          filter={
            <div className="inline-flex gap-3 w-full flex-wrap">
              {groups.map((item, i) => {
                const { key } = item;
                return (
                  <FilterPopover
                    key={i}
                    content={item.items.map((it, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={filter?.[key] == it.value}
                          onCheckedChange={() => changeFilter(key, it.value)}
                        />
                        <span>{it.label as string}</span>
                      </label>
                    ))}
                    value={
                      filter?.[key]
                        ? item.items.filter(
                            (item) => item.value == filter[key]
                          )[0].label
                        : undefined
                    }
                    label={item.label}
                  />
                );
              })}
            </div>
          }
          columns={columns}
          count={Users?.count}
          data={Users?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              title="Хэрэглэгч нэмэх форм"
              w="2xl"
              name={"Хэрэглэгч нэмэх"}
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
                <div className="double-col gap-5">
                  {[
                    {
                      key: "nickname",
                      label: "Нэр",
                    },
                    {
                      key: "mobile",
                      label: "Утас",
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
                          return <TextField props={{ ...field }} label={""} />;
                        }}
                      </FormItems>
                    );
                  })}
                  <FormItems
                    control={form.control}
                    name="password"
                    className="col-span-2"
                  >
                    {(field) => {
                      return <PasswordField props={{ ...field }} view={true} />;
                    }}
                  </FormItems>
                </div>
              </FormProvider>
            </Modal>
          }
        />
      </div>
    </div>
  );
};
