import { searchProduct } from "@/app/(api)/product";
import { fetcher } from "@/hooks/fetcher";
import {
  ACTION,
  DEFAULT_PG,
  getEnumValues,
  getValuesUserProductStatus,
  ListType,
  PG,
  RoleValue,
} from "@/lib/constants";
import { ROLE, UserProductStatus } from "@/lib/enum";
import { firstLetterUpper } from "@/lib/functions";
import { Product, UserProduct } from "@/models";
import { ComboBox } from "@/shared/components/combobox";
import { DatePicker } from "@/shared/components/date.picker";
import { FormItems } from "@/shared/components/form.field";
import { Modal } from "@/shared/components/modal";
import { PasswordField } from "@/shared/components/password.field";
import { TextField } from "@/shared/components/text.field";
import { Api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Label } from "recharts";
import z from "zod";

const formSchema = z.object({
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,

  product_id: z.string().min(1),
  status: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(UserProductStatus)
    )
    .optional() as unknown as UserProductStatus,
});
type UserType = z.infer<typeof formSchema>;
export const EmployeeProductModal = ({ id }: { id: string }) => {
  const form = useForm<UserType>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<boolean | undefined>(true);
  const [userProducts, setUserProducts] =
    useState<ListType<UserProduct> | null>(null);
  const [products, setProducts] = useState<ListType<Product> | null>(null);
  const getProducts = async (pg: PG = DEFAULT_PG) => {
    const { page, limit, sort } = pg;
    // await searchProduct()
  };
  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<UserProduct>(Api.user_product, {
      page,
      limit,
      sort,
      user_id: id,
    }).then((d) => {
      setUserProducts(d);
      form.reset(undefined);
    });
    setAction(ACTION.DEFAULT);
  };
  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async <T,>(e: T) => {
    // const res = await create<IUser>(Api.user, e as IUser);
    // if (res.success) {
    //   refresh();
    //   setOpen(false);
    //   form.reset();
    // }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
    // setSuccess(false);
  };

  return (
    <Modal
      submit={() => {
        form.handleSubmit(onSubmit, onInvalid)();
      }}
      name={""}
      title="Ажилтан нэмэх"
      submitTxt="Нэмэх"
      open={!open ? false : open}
      setOpen={setOpen}
      loading={action == ACTION.RUNNING}
    >
      <FormProvider {...form}>
        {/* <FormItems control={form.control} name="product_id">
          {(field) => {
            return (
              <>
                <Label>Бүтээгдэхүүн</Label>
                <ComboBox
                  props={{ ...field }}
                  search="Хайх"
                  items={products.items.map((product) => {
                    return {
                      value: product.id,
                      label: product.name,
                    };
                  })}
                />
              </>
            );
          }}
        </FormItems> */}
        <FormItems control={form.control} name="product_id">
          {(field) => {
            return (
              <>
                <Label>status</Label>
                <ComboBox
                  props={{ ...field }}
                  items={getEnumValues(UserProductStatus).map((product) => {
                    return {
                      value: product.toString(),
                      label: getValuesUserProductStatus[product],
                    };
                  })}
                />
              </>
            );
          }}
        </FormItems>

        <FormItems
          control={form.control}
          name={"quantity"}
          className={"col-span-2"}
        >
          {(field) => {
            return (
              <>
                <TextField
                  type={"number"}
                  props={{ ...field }}
                  label={"quantity"}
                />
              </>
            );
          }}
        </FormItems>
      </FormProvider>
    </Modal>
  );
};
