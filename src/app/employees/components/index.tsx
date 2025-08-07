"use client";
import { DataTable } from "@/components/data-table";
import { ACTION, DEFAULT_PG, ListType, PG, RoleValue } from "@/lib/constants";
import { Branch, IUser, User } from "@/models";
import { getColumns } from "./columns";
import { Modal } from "@/shared/components/modal";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/shared/components/combobox";
import { useState } from "react";
import { ROLE } from "@/lib/enum";
import { PasswordField } from "@/shared/components/password.field";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TextField } from "@/shared/components/text.field";
import { firstLetterUpper } from "@/lib/functions";
import { DatePicker } from "@/shared/components/date.picker";
import { create, updateOne } from "@/app/(api)";
import { Api } from "@/utils/api";
import { FormItems } from "@/shared/components/form.field";
import { fetcher } from "@/hooks/fetcher";
import { EmployeeProductModal } from "./employee.product";

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
  const [open, setOpen] = useState<boolean | undefined>(false);
  const form = useForm<UserType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: ROLE.EMPLOYEE,
      password: "string",
    },
  });
  const [users, setUsers] = useState<ListType<User>>(data);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [userProduct, setUserProduct] = useState<string | undefined>(undefined);
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
      role: 35,
    }).then((d) => {
      setUsers(d);
      form.reset(undefined);
    });
    setAction(ACTION.DEFAULT);
  };
  const edit = (e: IUser) => {
    setOpen(true);
    setEditingUser(e);
    form.reset(e);
  };
  const setStatus = async (index: number, status: number) => {
    console.log(users.items[index].id);
    const res = await updateOne(Api.user, users.items[index].id, {
      user_status: status,
    });
    console.log(res);
    refresh();
  };
  const giveProduct = (index: number) => {
    setUserProduct(users.items[index].id);
  };
  const columns = getColumns(edit, setStatus, giveProduct);
  // zasah button
  return (
    <div className="w-full relative">
      <Modal
        submit={() => {
          form.handleSubmit(onSubmit, onInvalid)();
        }}
        name="Шинээр нэмэх"
        title="Ажилтан нэмэх"
        submitTxt="Нэмэх"
        open={!open ? false : open}
        setOpen={setOpen}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          <FormItems control={form.control} name="branch_id">
            {(field) => {
              return (
                <>
                  <Label>Салбар</Label>
                  <ComboBox
                    props={{ ...field }}
                    items={branches.items.map((branch) => {
                      return {
                        value: branch.id,
                        label: branch.name,
                      };
                    })}
                  />
                </>
              );
            }}
          </FormItems>
          <FormItems control={form.control} name="role">
            {(field) => {
              return (
                <>
                  <Label>Role</Label>
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
                </>
              );
            }}
          </FormItems>
          <FormItems
            control={form.control}
            name="password"
            className="col-span-2"
          >
            {(field) => {
              return <PasswordField props={{ ...field }} view={true} />;
            }}
          </FormItems>
          {["lastname", "firstname", "mobile"].map((i, index) => {
            const item = i as keyof UserType;
            return (
              <FormItems
                control={form.control}
                name={item}
                key={index}
                className={item == "mobile" ? "col-span-1" : "col-span-2"}
              >
                {(field) => {
                  return (
                    <>
                      <TextField
                        type={"mobile" == item ? "number" : "text"}
                        props={{ ...field }}
                        label={firstLetterUpper(item)}
                      />
                    </>
                  );
                }}
              </FormItems>
            );
          })}
          <FormItems control={form.control} name="birthday">
            {(field) => {
              return <DatePicker pl="Огноо сонгох" props={{ ...field }} />;
            }}
          </FormItems>
        </FormProvider>
      </Modal>
      <EmployeeProductModal
        id={userProduct}
        clear={() => setUserProduct(undefined)}
      />
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
