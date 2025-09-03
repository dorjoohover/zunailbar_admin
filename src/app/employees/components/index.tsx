"use client";
import { DataTable } from "@/components/data-table";
import {
  ACTION,
  DEFAULT_PG,
  getEnumValues,
  ListType,
  Option,
  PG,
  RoleValue,
  UserStatusValue,
} from "@/lib/constants";
import { Branch, IUser, User } from "@/models";
import { getColumns } from "./columns";
import { Modal } from "@/shared/components/modal";
import { ComboBox } from "@/shared/components/combobox";
import { useEffect, useMemo, useState } from "react";
import { EmployeeStatus, ROLE, UserStatus } from "@/lib/enum";
import { PasswordField } from "@/shared/components/password.field";
import z from "zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TextField } from "@/shared/components/text.field";
import { firstLetterUpper, numberArray, objectCompact } from "@/lib/functions";
import { DatePicker } from "@/shared/components/date.picker";
import { create, updateOne } from "@/app/(api)";
import { Api } from "@/utils/api";
import { FormItems } from "@/shared/components/form.field";
import { fetcher } from "@/hooks/fetcher";
import { EmployeeProductModal } from "./employee.product";
import { imageUploader } from "@/app/(api)/base";
import { Pencil, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import DynamicHeader from "@/components/dynamicHeader";
import { FilterPopover } from "@/components/layout/popover";
import { Checkbox } from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import { showToast } from "@/shared/components/showToast";
import { ACCEPT_ATTR, validateImageFile } from "@/lib/image.validator";
import { COLOR_HEX } from "@/lib/colors";

const formSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  branch_id: z.string().min(1),
  mobile: z.string().length(8, { message: "8 тэмдэгт байх ёстой" }),
  birthday: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ) as unknown as Date,
  experience: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  password: z.string().nullable().optional(),
  nickname: z.string().min(1),
  profile_img: z.string().nullable().optional(),
  color: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
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
interface FilterType {
  role?: number;
  branch?: string;
  status?: number;
}
const defaultValues = {
  role: ROLE.EMPLOYEE,
  password: "string",
};
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
    defaultValues,
  });
  const [users, setUsers] = useState<ListType<User>>(data);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [userProduct, setUserProduct] = useState<string | undefined>(undefined);
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const { file, password, ...body } = form.getValues();
    if (editingUser == null && password == null) {
      toast("Нууц үг оруулна уу", {});
      return;
    }
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
      : await create<IUser>(Api.user, {
          ...payload,
          password: password ?? undefined,
        });

    if (res.success) {
      refresh();
      setOpen(false);
      showToast(
        "success",
        editingUser?.id != undefined ? "Мэдээлэл засагдсан!" : "Ажилтан нэмэгдлээ!"
      );
      form.reset(defaultValues);
    } else {
      showToast("error", res.error ?? "");
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
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      isCost: false,
      role: ROLE.E_M,
      mobile: pg.filter,
      ...pg,
    }).then((d) => {
      setUsers(d);
      form.reset(defaultValues);
    });
    setAction(ACTION.DEFAULT);
  };
  const edit = (e: IUser) => {
    setOpen(true);
    setEditingUser(e);
    form.reset(e);
  };
  const setStatus = async (index: number, status: number) => {
    await updateOne(Api.user, users.items[index].id, {
      user_status: status,
    });
    refresh();
  };
  const giveProduct = (index: number) => {
    setUserProduct(users.items[index].id);
  };
  const columns = getColumns(edit, setStatus, giveProduct);

  const [filter, setFilter] = useState<FilterType>();
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    refresh(
      objectCompact({
        branch_id: filter?.branch,
        role: filter?.role,
        user_status: filter?.status,
        page: 0,
      })
    );
  }, [filter]);
  const groups: { key: keyof FilterType; label: string; items: Option[] }[] =
    useMemo(
      () => [
        {
          key: "role",
          label: "ROLE",
          items: [
            { value: ROLE.EMPLOYEE, label: "Ажилтан" },
            { value: ROLE.MANAGER, label: "Manager" },
          ],
        },
        {
          key: "branch",
          label: "Салбар",
          items: branches.items.map((b) => ({ value: b.id, label: b.name })),
        },
        {
          key: "status",
          label: "Статус",
          items: getEnumValues(UserStatus).map((s) => ({
            value: s,
            label: UserStatusValue[s].name,
          })),
        },
      ],
      [branches.items]
    );
  return (
    <div className="relative w-full">
      <DynamicHeader />

      <div className="admin-container">
        <EmployeeProductModal
          id={userProduct}
          clear={() => setUserProduct(undefined)}
        />
        <DataTable
          clear={() => setFilter(undefined)}
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
                      search={true}
                      value={filter?.[key] ? String(filter[key]) : ""} //
                      items={item.items.map((it) => ({
                        value: String(it.value),
                        label: it.label as string,
                      }))}
                      props={{
                        value: filter?.[key] ? String(filter[key]) : "",
                        onChange: (val: string) => changeFilter(key, val),
                        onBlur: () => {},
                        name: key,
                        ref: () => {},
                      }}
                    />
                  </label>
                  // <FilterPopover
                  //   key={i}
                  //   label={item.label}
                  //   content={item.items.map((it, index) => (
                  //     <label key={index} className="checkbox-label">
                  //       <Checkbox checked={filter?.[key] == it.value} onCheckedChange={() => changeFilter(key, it.value)} />
                  //       <span>{it.label as string}</span>
                  //     </label>

                  //   ))}
                  //   value={filter?.[key] ? item.items.filter((item) => item.value == filter[key])[0].label : undefined}
                  // />
                );
              })}
            </>
          }
          columns={columns}
          data={users.items}
          refresh={refresh}
          loading={action === ACTION.RUNNING}
          count={users.count}
          modalAdd={
            <Modal
              maw="2xl"
              submit={() => {
                form.handleSubmit(onSubmit, onInvalid)();
              }}
              name="Ажилтан нэмэх"
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
                  <div className="grid grid-cols-2 pb-5">
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
                                  className="object-cover w-full h-full overflow-hidden bg-white border rounded-md"
                                />

                                {/* Change */}
                                <label
                                  htmlFor="file-upload"
                                  className="absolute p-1 rounded cursor-pointer top-1 right-7 bg-primary hover:bg-slate-600"
                                >
                                  <Pencil className="text-white size-3" />
                                </label>

                                {/* Remove */}
                                <button
                                  type="button"
                                  onClick={() => field.onChange(null)}
                                  className="absolute p-1 rounded cursor-pointer top-1 right-1 bg-primary hover:bg-slate-600"
                                >
                                  <X className="text-white size-3" />
                                </button>
                              </>
                            ) : (
                              // Empty state uploader
                              <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-full h-full transition-colors bg-white border rounded-md cursor-pointer hover:bg-gray-50"
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
                              className="hidden"
                              accept={ACCEPT_ATTR}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const res = validateImageFile(file);
                                if (!res.ok) {
                                  showToast("error", res.message);
                                  e.currentTarget.value = ""; // буруу бол reset
                                  return;
                                }
                                field.onChange(file);
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
                                <div className="relative w-32 h-32 bg-white">
                                  <img
                                    src={`/api/file/${field.value}`}
                                    alt="preview"
                                    className="object-cover overflow-hidden border rounded-md size-full bg-gray"
                                  />
                                </div>
                              )}
                            </>
                          );
                        }}
                      </FormItems>
                    )}
                  </div>
                  <div className="py-5 double-col">
                    <FormItems
                      control={form.control}
                      name="branch_id"
                      label="Салбар"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            search={true}
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

                    <FormItems
                      control={form.control}
                      name="role"
                      label="Эрхийн түвшин"
                    >
                      {(field) => {
                        return (
                          <ComboBox
                            items={[
                              ROLE.ADMIN,
                              ROLE.EMPLOYEE,
                              ROLE.MANAGER,
                            ].map((role) => {
                              return {
                                label: RoleValue[role],
                                value: role.toString(),
                              };
                            })}
                            props={{
                              ...field,
                            }}
                          />
                        );
                      }}
                    </FormItems>
                  </div>
                  <div className="pt-5 double-col">
                    {!editingUser && (
                      <FormItems
                        label="Нууц үг"
                        control={form.control}
                        name="password"
                        className="col-span-1"
                      >
                        {(field) => {
                          return (
                            <PasswordField
                              label=""
                              props={{ ...field }}
                              view={true}
                            />
                          );
                        }}
                      </FormItems>
                    )}
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
                          label={firstLetterUpper(item)}
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
                                      ? {
                                          inputMode: "numeric",
                                          pattern: "[0-9]*",
                                        }
                                      : {}),
                                  }}
                                  className={cn(
                                    item === "mobile"
                                      ? "hide-number-arrows"
                                      : ""
                                  )}
                                />
                              </>
                            );
                          }}
                        </FormItems>
                      );
                    })}
                    <FormItems
                      label="Төрсөн өдөр"
                      control={form.control}
                      name="birthday"
                    >
                      {(field) => {
                        return (
                          <DatePicker
                            name=""
                            pl="Огноо сонгох"
                            props={{ ...field }}
                          />
                        );
                      }}
                    </FormItems>
                    <FormItems label="Өнгө" control={form.control} name="color">
                      {(field) => {
                        return (
                          <ComboBox
                            props={{ ...field }}
                            items={Object.entries(COLOR_HEX).map(
                              ([key, value], index) => {
                                return {
                                  color: key,
                                  value: index.toString(),
                                  label: key,
                                };
                              }
                            )}
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
