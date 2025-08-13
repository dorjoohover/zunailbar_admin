"use client";
import { DataTable } from "@/components/data-table";
import { ACTION, DEFAULT_PG, ListType, PG, RoleValue } from "@/lib/constants";
import { useState } from "react";
import { ROLE } from "@/lib/enum";
import z from "zod";

import { Api } from "@/utils/api";
import { fetcher } from "@/hooks/fetcher";
import { UserProduct } from "@/models";
import { getColumns } from "./columns";
import ContainerHeader from "@/components/containerHeader";
import DynamicHeader from "@/components/dynamicHeader";

const formSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  branch_id: z.string().min(1),
  mobile: z.string().length(8, { message: "8 тэмдэгт байх ёстой" }),
  birthday: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()) as unknown as Date,
  password: z.string().min(6),
  experience: z.preprocess((val) => (typeof val === "string" ? parseFloat(val) : val), z.number()) as unknown as number,
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
export const EmployeeProductPage = ({
  data,
}: //   branches,
{
  data: ListType<UserProduct>;
  //   branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  //   const [open, setOpen] = useState<boolean | undefined>(false);
  //   const form = useForm<UserType>({
  //     resolver: zodResolver(formSchema),
  //     defaultValues: {
  //       role: ROLE.EMPLOYEE,
  //       password: "string",
  //     },
  //   });
  const [userProduct, setUserProduct] = useState<ListType<UserProduct>>(data);
  //   const [editingUser, setEditingUser] = useState<IUser | null>(null);
  //   const onSubmit = async <T,>(e: T) => {
  //     const { file, ...body } = form.getValues();
  //     const formData = new FormData();
  //     let payload = {};
  //     if (file != null) {
  //       formData.append("files", file);
  //       const uploadResult = await imageUploader(formData);
  //       payload = {
  //         ...(body as IUser),
  //         profile_img: uploadResult[0],
  //       };
  //     } else {
  //       payload = {
  //         ...(body as IUser),
  //       };
  //     }
  //     const res = editingUser
  //       ? await updateOne<IUser>(Api.user, editingUser?.id as string, payload)
  //       : await create<IUser>(Api.user, payload);
  //     if (res.success) {
  //       refresh();
  //       setOpen(false);
  //       form.reset();
  //     }
  //     setAction(ACTION.DEFAULT);
  //   };
  //   const onInvalid = async <T,>(e: T) => {
  //     console.log("error", e);

  //     // setSuccess(false);
  //   };

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<UserProduct>(Api.user_product, {
      page,
      limit,
      sort,
    }).then((d) => {
      setUserProduct(d);
      // form.reset(undefined);
    });
    setAction(ACTION.DEFAULT);
  };
  //   const edit = (e: IUser) => {
  //     setOpen(true);
  //     setEditingUser(e);
  //     form.reset(e);
  //   };
  //   const setStatus = async (index: number, status: number) => {
  //     const res = await updateOne(Api.user, users.items[index].id, {
  //       user_status: status,
  //     });
  //     refresh();
  //   };
  //   const giveProduct = (index: number) => {
  //     setUserProduct(users.items[index].id);
  //   };
  const columns = getColumns();
  //   const columns = getColumns(edit, setStatus, giveProduct);
  return (
    <div className="w-full relative">
      <DynamicHeader count={data.count} />

      {data.count}
      <div className="admin-container">
        <DataTable
          columns={columns}
          data={userProduct.items}
          refresh={refresh}
          loading={action === ACTION.RUNNING}
          count={userProduct.count}
          modalAdd={
            <>
              {/* <Modal
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
      /> */}
            </>
          }
        />
      </div>
    </div>
  );
};
