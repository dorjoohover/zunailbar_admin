"use client";

import { DataTable } from "@/components/data-table";
import {
  IUserService, User,
  UserService
} from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG
} from "@/lib/constants";
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
import { usernameFormatter } from "@/lib/functions";
import { Service } from "@/models/service.model";

const formSchema = z.object({
  user_id: z.string().min(1),
  service_id: z.string().min(1),

  edit: z.string().nullable().optional(),
});
const defaultValues: UserServiceType = {
  user_id: "",
  service_id: "",
  edit: undefined,
};
type UserServiceType = z.infer<typeof formSchema>;
export const EmployeeUserServicePage = ({
  data,
  services,
  users,
}: {
  data: ListType<UserService>;
  services: ListType<Service>;
  users: ListType<User>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<UserServiceType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [UserServices, setUserServices] =
    useState<ListType<UserService> | null>(null);
  const serviceMap = useMemo(
    () => new Map(services.items.map((b) => [b.id, b])),
    [services.items]
  );
  const userMap = useMemo(
    () => new Map(users.items.map((b) => [b.id, b])),
    [users.items]
  );

  const UserServiceFormatter = (data: ListType<UserService>) => {
    const items: UserService[] = data.items.map((item) => {
      const user = userMap.get(item.user_id);
      const service = serviceMap.get(item.service_id);
      return {
        ...item,
        user_name: item.user_name
          ? item.user_name
          : user
          ? usernameFormatter(user)
          : "",
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
      page,
      limit,
      sort,
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
    const res = edit
      ? await updateOne<UserService>(
          Api.user_service,
          edit ?? "",
          payload as unknown as UserService
        )
      : await create<UserService>(Api.user_service, e as UserService);
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
      <Modal
        name={"Үйлчилгээ нэмэх " + UserServices?.count}
        submit={() => form.handleSubmit(onSubmit, onInvalid)()}
        open={open == true}
        reset={() => {
          setOpen(false);
          clear();
        }}
        title="Нэмэх"
        setOpen={setOpen}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          <div className="grid grid-cols-2 gap-3">
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
          <FormItems control={form.control} name="service_id" label="Үйлчилгээ">
            {(field) => {
              return (
                <ComboBox
                  props={{ ...field }}
                  items={services.items.map((item) => {
                    return {
                      value: item.id,
                      label: item.name ?? "",
                    };
                  })}
                />
              );
            }}
          </FormItems>
          </div>
        </FormProvider>
      </Modal>
      <DataTable
        columns={columns}
        count={UserServices?.count}
        data={UserServices?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
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
