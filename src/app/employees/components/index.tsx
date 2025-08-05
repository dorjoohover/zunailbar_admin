"use client";
import { DataTable } from "@/components/data-table";
import { ACTION, DEFAULT_PG, ListType, PG, RoleValue } from "@/lib/constants";
import { Branch, IUser, User } from "@/models";
import { getColumns } from "./columns";
import { Modal } from "@/shared/components/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/shared/components/combobox";
import { ReactNode, useState } from "react";
import { ROLE } from "@/lib/enum";
import { PasswordField } from "@/shared/components/password.field";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TextField } from "@/shared/components/text.field";
import { firstLetterUpper } from "@/lib/functions";
import { DatePicker } from "@/shared/components/date.picker";
import { create } from "@/app/(api)";
import { Api, API } from "@/utils/api";
import { FormItems } from "@/shared/components/form.field";
import { fetcher } from "@/hooks/fetcher";

const formSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  branch_id: z.string().min(1),
  mobile: z.string().length(8, { message: "8 тэмдэгт байх ёстой" }),
  birthday: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ) as unknown as Date,
  password: z.string().min(6),
  role: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().refine((val) => [ROLE.EMPLOYEE, ROLE.MANAGER].includes(val), {
        message: "Only EMPLOYEE and MANAGER roles are allowed",
      })
    )
    .optional() as unknown as number,
});
type UserType = z.infer<typeof formSchema>;
export const EmployeePage = ({
  data,
  branches,
}: {
  data: ListType<User>;
  branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState(false);
  const form = useForm<UserType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: ROLE.EMPLOYEE,
      password: "string@123",
    },
  });
  const [users, setUsers] = useState<ListType<User>>(data);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const onSubmit = async <T,>(e: T) => {
    const res = await create<IUser>(Api.user, e as IUser);
    if (res.success) {
      refresh();
      setOpen(false);
      form.reset();
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
    // setSuccess(false);
  };

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<User>(Api.user, {
      page,
      limit,
      sort,
      isCost: false,
    }).then((d) => {
      setUsers(d);
      form.reset(undefined);
    });
    setAction(ACTION.DEFAULT);
  };

  const columns = getColumns((e) => {
    setOpen(true);
    setEditingUser(e);
    form.reset(e);
  });

  return (
    <div className="w-full">
      <Modal
        submit={() => {
          form.handleSubmit(onSubmit, onInvalid)();
        }}
        open={open}
        setOpen={setOpen}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          <FormItems control={form.control} name="branch_id">
            {(field) => {
              return (
                <ComboBox
                  props={{ ...field }}
                  items={branches.items.map((branch) => {
                    return {
                      value: branch.id,
                      label: branch.name,
                    };
                  })}
                />
              );
            }}
          </FormItems>
          <FormItems control={form.control} name="role">
            {(field) => {
              return (
                <ComboBox
                  items={[ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.MANAGER].map(
                    (role) => {
                      return {
                        label: RoleValue[role],
                        value: role.toString(),
                      };
                    }
                  )}
                  props={{ ...field }}
                />
              );
            }}
          </FormItems>
          <FormItems control={form.control} name="password">
            {(field) => {
              return <PasswordField props={{ ...field }} view={true} />;
            }}
          </FormItems>
          {["lastname", "firstname", "mobile"].map((i, index) => {
            const item = i as keyof UserType;
            return (
              <FormItems control={form.control} name={item}>
                {(field) => {
                  return (
                    <TextField
                      type={"mobile" == item ? "number" : "text"}
                      props={{ ...field }}
                      label={firstLetterUpper(item)}
                      key={index}
                    />
                  );
                }}
              </FormItems>
            );
          })}
          <FormItems control={form.control} name="birthday">
            {(field) => {
              return <DatePicker props={{ ...field }} />;
            }}
          </FormItems>
        </FormProvider>
      </Modal>

      <DataTable
        columns={columns}
        data={users.items}
        refresh={refresh}
        loading={action === ACTION.RUNNING}
        count={users.count}
      />
    </div>
  );
};
