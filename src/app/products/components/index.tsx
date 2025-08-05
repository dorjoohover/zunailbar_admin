"use client";

import ContainerHeader from "@/components/containerHeader";
import { DataTable } from "@/components/data-table";
import { Category, IProduct, Product } from "@/models";
import { getColumns } from "./columns";
import { useState } from "react";
import { toast } from "sonner";
import { ProductDialog } from "./dialog";
import { ListType } from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
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
  quantity: z.number(),
  price: z.number(),
  color: z.string(),
  size: z.string(),
});
type ProductType = z.infer<typeof formSchema>;
export const ProductPage = ({
  data,
  categories,
}: {
  data: ListType<Product>;
  categories: ListType<Category>;
}) => {
  const { count, items } = data;

  const [success, setSuccess] = useState(false);
  const form = useForm<ProductType>({
    resolver: zodResolver(formSchema),
  });
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [products, setProducts] = useState<IProduct[]>(items);
  const handleSave = () => {
    if (!editingProduct || !editingProduct.id) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );
    setEditingProduct(null);

    toast("Амжилттай хадгаллаа!", {});
  };

  const columns = getColumns(setEditingProduct);
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
  const onSubmit = async <T,>(e: T) => {
    await create<IProduct>(Api.product, e as IProduct).then((d) =>
      console.log(d)
    );
    setSuccess(true);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
    setSuccess(false);
  };

  return (
    <div className="admin-container">
      <ContainerHeader title="Барааны жагсаалт" />
      <Modal
        submit={async () => {
          await form.handleSubmit(onSubmit, onInvalid)();
          return success;
        }}
      >
        <FormProvider {...form}>
          <FormItems control={form.control} name="branch_id">
            {(field) => {
              return (
                <ComboBox
                  props={{ ...field }}
                  items={categories.items.map((category) => {
                    return {
                      value: category.id,
                      label: category.name,
                    };
                  })}
                />
              );
            }}
          </FormItems>
        </FormProvider>
      </Modal>
      <DataTable columns={columns} data={products} />
      <ProductDialog
        editingProduct={editingProduct}
        onChange={onChange}
        save={handleSave}
      />
    </div>
  );
};
