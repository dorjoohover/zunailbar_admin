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
import { imageUploader } from "@/app/(api)/base";
import { Input } from "@/components/ui/input";

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
  experience: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  nickname: z.string().min(1),
  profile_img: z.string().nullable(),

  role: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().refine((val) => [ROLE.EMPLOYEE, ROLE.MANAGER].includes(val), {
        message: "Only EMPLOYEE and MANAGER roles are allowed",
      })
    )
    .optional() as unknown as number,
  file: z
    .any()
    // .refine((f) => f.size > 0, { message: "Файл заавал оруулна" })
    .nullable(),
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
    const { file, ...body } = form.getValues();
    const formData = new FormData();
    let payload = {};
    if (file != null) {
      formData.append("files", file);
      const uploadResult = await imageUploader(formData);
      payload = {
        ...(body as IUser),
        profile_img: uploadResult[0],
      };
    } else {
      payload = {
        ...(body as IUser),
      };
    }
    const res = editingUser
      ? await updateOne<IUser>(Api.user, editingUser?.id as string, payload)
      : await create<IUser>(Api.user, payload);
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
    const res = await updateOne(Api.user, users.items[index].id, {
      user_status: status,
    });
    refresh();
  };
  const giveProduct = (index: number) => {
    setUserProduct(users.items[index].id);
  };
  const columns = getColumns(edit, setStatus, giveProduct);
  return (
    <div className="w-full relative">
      <Modal
        submit={() => {
          form.handleSubmit(onSubmit, onInvalid)();
        }}
        name="Шинээр нэмэх"
        title="Ажилтан нэмэх"
        submitTxt={editingUser ? "Засах" : "Нэмэх"}
        open={!open ? false : open}
        setOpen={(v) => {
          setOpen(v);
          setEditingUser(null);
        }}
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
          <FormItems control={form.control} name="file">
            {(field) => {
              return (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        field.onChange(file);
                      }
                    }}
                  />
                  {field.value && (
                    <img
                      src={URL.createObjectURL(field.value as any)}
                      alt="preview"
                      className="w-32 h-32 mt-2 object-cover"
                    />
                  )}
                </>
              );
            }}
          </FormItems>
          {/* odoogiin */}
          <FormItems control={form.control} name="profile_img">
            {(field) => {
              return (
                <>
                  {field.value && (
                    <img
                      src={`/api/file/${field.value}`}
                      alt="preview"
                      className="w-32 h-32 mt-2 object-cover"
                    />
                  )}
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
          {["lastname", "firstname", "mobile", "nickname", "experience"].map(
            (i, index) => {
              const item = i as keyof UserType;
              return (
                <FormItems
                  control={form.control}
                  name={item}
                  key={index}
                  className={
                    item == "mobile" || item == "experience"
                      ? "col-span-1"
                      : "col-span-2"
                  }
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
            }
          )}
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
