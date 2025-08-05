"use client";

import ContainerHeader from "@/components/containerHeader";
import { DataTable } from "@/components/data-table";
import { Branch, Category, IProduct, Product } from "@/models";
import { getColumns } from "./columns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductDialog } from "./dialog";
import { ListType, ACTION, PG, DEFAULT_PG } from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z, { keyof } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { API, Api } from "@/utils/api";
import { create, find } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import useSWR from "swr";
import { fetcher } from "@/hooks/fetcher";
const initialProduct: IProduct = {
  id: "1",
  brand_id: "1",
  category_id: "man",
  name: "Ягаан будаг",
  ref: "asd",
  quantity: 12,
  price: 15000,
  color: "Pink",
  size: "50ml",
  created_at: new Date("2025-07-20"),
};

const initialProducts: IProduct[] = Array.from({ length: 40 }, (_, i) => ({
  ...initialProduct,
  id: (i + 1).toString(),
  name: `Ягаан будаг ${i + 1}`,
}));

const formSchema = z.object({
  branch_id: z.string().min(1),
  category_id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  color: z.string(),
  size: z.string(),
});
type ProductType = z.infer<typeof formSchema>;
export const ProductPage = ({
  data,
  categories,
  branches,
}: {
  data: ListType<Product>;
  categories: ListType<Category>;
  branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState(false);
  const form = useForm<ProductType>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [products, setProducts] = useState<ListType<Product>>(data);

  const handleSave = () => {
    if (!editingProduct || !editingProduct.id) return;
    setProducts((prev) => ({
      ...prev,
      items: prev.items.map((p) =>
        p.id === editingProduct.id ? (editingProduct as Product) : p
      ),
    }));
    setEditingProduct(null);

    toast("Амжилттай хадгаллаа!", {});
  };
  useEffect(() => {
    if (editingProduct != null) {
      setOpen(true);
      form.reset(editingProduct);
    }
  }, [editingProduct]);
  const columns = getColumns((e) => {
    setEditingProduct(e);
  });
  const onChange = (
    key: string | null,
    value: string | null | number | undefined
  ) => {
    key == null
      ? setEditingProduct(null)
      : setEditingProduct((prev) => {
          if (key === "id" && typeof value !== "string") return prev; // skip if invalid
          return {
            ...prev,
            [key]: value,
          };
        });
  };
  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Product>(Api.product, {
      page,
      limit,
      sort,
      isCost: false,
    }).then((d) => {
      setProducts(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const res = await create<IProduct>(Api.product, e as IProduct);
    if (res.success) {
      refresh();
      setOpen(false);
      form.reset({});
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
  };

  return (
    <div className="admin-container">
      <ContainerHeader title="Барааны жагсаалт" />
      {JSON.stringify(form.getValues())}
      {JSON.stringify(open)}
      <Modal
        submit={() => form.handleSubmit(onSubmit, onInvalid)()}
        open={open}
        reset={() => {
          form.reset({});
          console.log("asdf");
          setOpen(false);
          form.reset({});
        }}
        setOpen={setOpen}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          <FormItems control={form.control} name="category_id">
            {(field) => {
              return (
                <ComboBox
                  props={{ ...field }}
                  items={categories.items.map((item) => {
                    return {
                      value: item.id,
                      label: item.name,
                    };
                  })}
                />
              );
            }}
          </FormItems>
          <FormItems control={form.control} name="branch_id">
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
              key: "name",
            },
            {
              key: "quantity",
              type: "number",
            },
            {
              key: "price",
              type: "number",
            },
            {
              key: "color",
            },
            {
              key: "size",
            },
          ].map((item, i) => {
            const name = item.key as keyof ProductType;
            return (
              <FormItems control={form.control} name={name} key={i}>
                {(field) => {
                  return (
                    <TextField
                      props={{ ...field }}
                      type={item.type}
                      label={name}
                    />
                  );
                }}
              </FormItems>
            );
          })}
        </FormProvider>
      </Modal>
      <DataTable
        columns={columns}
        count={products.count}
        data={products.items}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      />
      {action}
      <ProductDialog
        editingProduct={editingProduct}
        onChange={onChange}
        save={handleSave}
      />
    </div>
  );
};
