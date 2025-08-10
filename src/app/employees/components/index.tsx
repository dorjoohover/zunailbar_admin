"use client";
import { DataTable } from "@/components/data-table";
import { ACTION, DEFAULT_PG, ListType, PG, RoleValue } from "@/lib/constants";
import { Branch, IUser, User } from "@/models";
import { getColumns } from "./columns";
import { Modal } from "@/shared/components/modal";
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
import { Pencil, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  profile_img: z.string().nullable().optional(),

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
    } else {
      console.log(res);
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
    alert(e);
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
      role: ROLE.E_M,
      mobile: pg.filter,
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
    console.log(index);
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
  return (
    <div className="w-full relative">
      <Modal
        w="2xl"
        submit={() => {
          form.handleSubmit(onSubmit, onInvalid)();
        }}
        name="Шинээр нэмэх"
        title="Ажилтан форм"
        submitTxt={editingUser ? "Засах" : "Нэмэх"}
        open={!open ? false : open}
        setOpen={(v) => {
          setOpen(v);
          setEditingUser(null);
        }}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          {/* Profile Image */}
          <div className="divide-y">
            <div className="grid grid-cols-2 gap-3 pb-5">
              {/* <FormItems control={form.control} name="file">
              {(field) => {
                return (
                  <>
                  <p className="font-medium text-sm">Профайл зураг</p>
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
                    {field.value && <img src={URL.createObjectURL(field.value as any)} alt="preview" className="size-32 bg-white rounded border aspect-square mt-2 object-cover" />}
                  </>
                );
              }}
            </FormItems> */}
              <FormItems
                control={form.control}
                name="file"
                label="Зураг өөрчлөх"
              >
                {(field) => {
                  const fileUrl = field.value
                    ? URL.createObjectURL(field.value as any)
                    : null;

                  return (
                    <div className="relative w-32 h-32">
                      {fileUrl ? (
                        <>
                          {/* Preview */}
                          <img
                            src={fileUrl}
                            alt="preview"
                            className="w-full h-full object-cover rounded-md border bg-white overflow-hidden"
                          />

                          {/* Change */}
                          <label
                            htmlFor="file-upload"
                            className="absolute top-1 right-7 bg-primary p-1 rounded shadow cursor-pointer hover:bg-slate-600"
                          >
                            <Pencil className="size-3 text-white" />
                          </label>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => field.onChange(null)}
                            className="absolute top-1 right-1 bg-primary p-1 rounded shadow cursor-pointer hover:bg-slate-600"
                          >
                            <X className="size-3 text-white" />
                          </button>
                        </>
                      ) : (
                        // Empty state uploader
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-full bg-white border rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <UploadCloud className="w-6 h-6 text-gray-500" />
                          <span className="mt-1 text-xs text-gray-500">
                            Browse
                          </span>
                        </label>
                      )}

                      {/* Hidden input */}
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }}
                      />
                    </div>
                  );
                }}
              </FormItems>
              {/* odoogiin */}
              {form.getValues("profile_img") && (
                <FormItems
                  control={form.control}
                  name="profile_img"
                  label="Одоогийн зураг"
                >
                  {(field) => {
                    return (
                      <>
                        {field.value && (
                          <div className="relative w-32 h-32">
                            <img
                              src={`/api/file/${field.value}`}
                              alt="preview"
                              className="size-full bg-gray object-cove rounded-md overflow-hidden border"
                            />
                          </div>
                        )}
                      </>
                    );
                  }}
                </FormItems>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 py-5">
              <FormItems control={form.control} name="branch_id" label="Салбар">
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

              <FormItems control={form.control} name="role" label="Үүрэг">
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
            </div>
            <div className="grid grid-cols-2 gap-3 pt-5">
              <FormItems
                control={form.control}
                name="password"
                className="col-span-1"
              >
                {(field) => {
                  return <PasswordField props={{ ...field }} view={true} />;
                }}
              </FormItems>
              {[
                "lastname",
                "firstname",
                "mobile",
                "nickname",
                "experience",
              ].map((i, index) => {
                const item = i as keyof UserType;
                return (
                  <FormItems
                    control={form.control}
                    name={item}
                    key={index}
                    className={"col-span-1"}
                  >
                    {(field) => {
                      return (
                        <>
                          {/* <TextField type={"mobile" == item ? "number" : "text"} props={{ ...field }} label={firstLetterUpper(item)} /> */}
                          <TextField
                            type={item === "mobile" ? "number" : "text"}
                            props={{
                              ...field,
                              ...(item === "mobile"
                                ? { inputMode: "numeric", pattern: "[0-9]*" }
                                : {}),
                            }}
                            className={cn(
                              item === "mobile" ? "hide-number-arrows" : ""
                            )}
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
                  return (
                    <DatePicker
                      name="Төрсөн өдөр"
                      pl="Огноо сонгох"
                      props={{ ...field }}
                    />
                  );
                }}
              </FormItems>
            </div>
          </div>
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
