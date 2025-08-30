"use client";
import { DataTable } from "@/components/data-table";
import { IUserService, User, UserService } from "@/models";
import { useEffect, useMemo, useState } from "react";
import { ListType, ACTION, PG, DEFAULT_PG, Option } from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { objectCompact, usernameFormatter } from "@/lib/functions";
import { Service } from "@/models/service.model";
import DynamicHeader from "@/components/dynamicHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterPopover } from "@/components/layout/popover";

const formSchema = z.object({
  user_id: z.string().min(1),
  services: z.array(z.string()),

  edit: z.string().nullable().optional(),
});
const defaultValues: UserServiceType = {
  user_id: "",
  services: [],
  edit: undefined,
};
type UserServiceType = z.infer<typeof formSchema>;
type FilterType = {
  service?: string;
  user?: string;
};
export const EmployeeUserServicePage = ({ data, services, users }: { data: ListType<UserService>; services: ListType<Service>; users: ListType<User> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<UserServiceType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [UserServices, setUserServices] = useState<ListType<UserService> | null>(null);
  const serviceMap = useMemo(() => new Map(services.items.map((b) => [b.id, b])), [services.items]);
  const userMap = useMemo(() => new Map(users.items.map((b) => [b.id, b])), [users.items]);

  const UserServiceFormatter = (data: ListType<UserService>) => {
    const items: UserService[] = data.items.map((item) => {
      const user = userMap.get(item.user_id);
      const service = serviceMap.get(item.service_id);
      return {
        ...item,
        user_name: item.user_name ? item.user_name : user ? usernameFormatter(user) : "",
        service_name: service?.name ?? item.service_name ?? "",
      };
    });

    setUserServices({ items, count: data.count });
  };
  useEffect(() => {
    UserServiceFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deleteUserService = async (index: number) => {
    const id = UserServices!.items[index].id;
    const res = await deleteOne(Api.user_service, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IUserService) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteUserService);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<UserService>(Api.user_service, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
      //   name: pg.filter,
    }).then((d) => {
      UserServiceFormatter(d);
      console.log(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as UserServiceType;
    const { edit, ...payload } = body;
    const res = edit ? await updateOne<IUserService>(Api.user_service, edit ?? "", payload as unknown as IUserService) : await create<IUserService>(Api.user_service, e as IUserService);
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
        service_id: filter?.service,
        user_id: filter?.user,
        page: 0,
      })
    );
  }, [filter]);
  const groups: { key: keyof FilterType; label: string; items: Option[] }[] = useMemo(
    () => [
      {
        key: "user",
        label: "Артист",
        items: users.items.map((b) => ({
          value: b.id,
          label: usernameFormatter(b),
        })),
      },
      {
        key: "service",
        label: "Үйлчилгээ",
        items: services.items.map((b) => ({ value: b.id, label: b.name })),
      },
    ],
    [services.items, users.items]
  );
  return (
    <div className="">
      <DynamicHeader count={UserServices?.count} />

      <div className="admin-container">
        <DataTable
          filter={
            <>
              {groups.map((item, i) => {
                const { key } = item;
                return (
                  <FilterPopover
                    key={i}
                    content={item.items.map((it, index) => (
                      <label key={index} className="checkbox-label">
                        <Checkbox checked={filter?.[key] == it.value} onCheckedChange={() => changeFilter(key, it.value)} />
                        <span>{it.label as string}</span>
                      </label>
                    ))}
                    value={filter?.[key] ? item.items.filter((item) => item.value == filter[key])[0].label : undefined}
                    label={item.label}
                  />
                );
              })}
            </>
          }
          search={false}
          clear={() => setFilter(undefined)}
          columns={columns}
          count={UserServices?.count}
          data={UserServices?.items ?? []}
          refresh={refresh}
          loading={action == ACTION.RUNNING}
          modalAdd={
            <Modal
              maw="md"
              name={"Үйлчилгээ нэмэх"}
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
                <div className="grid grid-cols-1 gap-3 space-y-4">
                  <FormItems control={form.control} name="user_id" label="Ажилчин">
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

                  <FormItems control={form.control} name="services" label="Үйлчилгээ">
                    {(field) => (
                      <div className="p-2 mt-2 bg-white border rounded-md">
                        {services.items.map((service) => {
                          const selected = field.value ?? ([] as string[]);
                          const isChecked = selected.includes(service.id);

                          return (
                            <div key={service.id} className="flex items-center gap-2 hover:bg-[#e9ebfa] p-2 border-b last:border-none">
                              <Checkbox
                                id={service.id}
                                checked={isChecked}
                                onCheckedChange={(val) => {
                                  const checked = val === true;
                                  const prev = field.value ?? [];
                                  const next = checked ? Array.from(new Set([...prev, service.id])) : (prev as string[]).filter((id: string) => id !== service.id);
                                  field.onChange(next);
                                }}
                              />
                              <Label htmlFor={service.id} className="py-2 size-full">
                                {service.name}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </FormItems>
                </div>
              </FormProvider>
            </Modal>
          }
        />
      </div>
      {/* <ProductDialog
        editingProduct={editingProduct}
        onChange={onChange}
        save={handleSave}
      /> */}
    </div>
  );
};
