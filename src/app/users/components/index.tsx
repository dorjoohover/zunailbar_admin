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
import { usernameFormatter } from "@/lib/functions";
import { ROLE } from "@/lib/enum";

const formSchema = z.object({
  mobile: z.string().min(1),
  branch_id: z.string().min(1),
  nickname: z.string().min(1),
  branch_name: z.string().min(1),
  edit: z.string().nullable().optional(),
});
const defaultValues: UserType = {
  mobile: "",
  nickname: "",
  branch_name: "",

  branch_id: "",
  edit: undefined,
};
type UserType = z.infer<typeof formSchema>;
export const UserPage = ({
  data,
  branches,
}: {
  data: ListType<User>;
  branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<UserType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [Users, setUsers] = useState<ListType<User> | null>(null);
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items]
  );

  const UserFormatter = (data: ListType<User>) => {
    const items: User[] = data.items.map((item) => {
      const branch = branchMap.get(item.branch_id);

      return {
        ...item,
        branch_name: branch?.name ?? "",
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
      page,
      limit,
      sort,
      role: ROLE.CLIENT,
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
      ? await updateOne<User>(Api.user, edit ?? "", payload as unknown as User)
      : await create<User>(Api.user, e as User);
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
        title="Хэрэглэгч нэмэх форм"
        w="2xl"
        name={"Хэрэглэгч нэмэх" + Users?.count}
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
            <FormItems label="Салбар" control={form.control} name="branch_id">
              {(field) => {
                return (
                  <ComboBox
                    props={{ ...field }}
                    items={branches.items.map((item) => {
                      return {
                        value: item.id,
                        label: item.name,
                      };
                    })}
                  />
                );
              }}
            </FormItems>

            {[
              {
                key: "min_price",
                type: "money",
                label: "Үнэ",
              },
              {
                key: "max_price",
                type: "money",
                label: "Их үнэ",
              },
              {
                key: "duration",
                type: "number",
                label: "Хугацаа",
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
                    return (
                      <TextField
                        props={{ ...field }}
                        type={item.type}
                        label={""}
                      />
                    );
                  }}
                </FormItems>
              );
            })}
          </div>
        </FormProvider>
      </Modal>
      <DataTable
        columns={columns}
        count={Users?.count}
        data={Users?.items ?? []}
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
