import { create, updateOne } from "@/app/(api)";
import { ACTION, CategoryTypeValues, getEnumValues } from "@/lib/constants";
import { CategoryType } from "@/lib/enum";
import { IBrand, ICategory } from "@/models";
import { ComboBox } from "@/shared/components/combobox";
import { FormItems } from "@/shared/components/form.field";
import { Modal } from "@/shared/components/modal";
import { TextField } from "@/shared/components/text.field";
import { Api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
const formSchema = z.object({
  category_name: z.string().min(1).nullable().optional(),
  brand_name: z.string().min(1).nullable().optional(),
  type: z.string().nullable().optional(),
  edit: z.string().nullable().optional(),
});
type ParentType = z.infer<typeof formSchema>;
export const RootModal = ({ refresh }: { refresh: () => void }) => {
  const [open, setOpen] = useState<number>(0);
  const [action, setAction] = useState(ACTION.DEFAULT);
  const form = useForm<ParentType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      edit: undefined,
      type: CategoryType.DEFAULT.toString(),
    },
  });

  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);

    const { edit, ...body } = e as ParentType;
    let res = { success: false };
    if (body.brand_name) {
      res = edit
        ? await updateOne<IBrand>(Api.brand, edit ?? "", {
            name: body.brand_name ?? "",
          })
        : await create<IBrand>(Api.brand, {
            name: body.brand_name ?? "",
          });
    }

    if (body.category_name) {
      res = edit
        ? await updateOne<ICategory>(Api.category, edit ?? "", {
            name: body.category_name ?? "",
            type: +(body.type ?? CategoryType.DEFAULT),
          })
        : await create<ICategory>(Api.category, {
            name: body.category_name ?? "",
            type: +(body.type ?? CategoryType.DEFAULT),
          });
    }
    if (res.success) {
      setOpen(0);
      refresh();
      form.reset({});
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
  };

  return (
    <div className="flex gap-4">
      <Modal
        name="Category"
        title="Category нэмэх форм"
        submit={() => form.handleSubmit(onSubmit, onInvalid)()}
        open={open == 1}
        reset={() => {
          setOpen(0);
          form.reset({});
        }}
        setOpen={(v) => {
          setOpen(v ? 1 : 0);
        }}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          <div className="divide-y">
            <div className="grid grid-cols-2 gap-3 pb-5"></div>
            <div className="grid grid-cols-2 gap-3 pt-5">
              <FormItems
                control={form.control}
                name={"category_name"}
                className={"col-span-1"}
              >
                {(field) => {
                  return (
                    <TextField props={{ ...field }} label={"Category name"} />
                  );
                }}
              </FormItems>
              <FormItems
                label="Төрөл"
                control={form.control}
                name="type"
                className={"col-span-1"}
              >
                {(field) => {
                  return (
                    <ComboBox
                      props={{ ...field }}
                      items={getEnumValues(CategoryType).map((item) => {
                        return {
                          value: item.toString(),
                          label: CategoryTypeValues[item],
                        };
                      })}
                    />
                  );
                }}
              </FormItems>
            </div>
          </div>
        </FormProvider>
      </Modal>
      <Modal
        name="Brand"
        title="Brand нэмэх форм"
        submit={() => form.handleSubmit(onSubmit, onInvalid)()}
        open={open == 2}
        reset={() => {
          setOpen(0);
          form.reset({});
        }}
        setOpen={(v) => {
          setOpen(v ? 2 : 0);
        }}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          <div className="divide-y">
            <div className="grid grid-cols-2 gap-3 pb-5"></div>
            <div className="grid grid-cols-2 gap-3 pt-5">
              {[
                {
                  key: "brand_name",
                  label: "Brand",
                },
              ].map((item, i) => {
                const name = item.key as keyof ParentType;
                const label = item.label as keyof ParentType;
                return (
                  <FormItems
                    control={form.control}
                    name={name}
                    key={i}
                    className={item.key === "name" ? "col-span-2" : ""}
                  >
                    {(field) => {
                      return <TextField props={{ ...field }} label={label} />;
                    }}
                  </FormItems>
                );
              })}
            </div>
          </div>
        </FormProvider>
      </Modal>
    </div>
  );
};
