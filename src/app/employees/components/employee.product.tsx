import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";

import { fetcher } from "@/hooks/fetcher";
import {
  ACTION,
  DEFAULT_PG,
  PG,
  ListType,
  SearchType,
  DEFAULT_LIMIT,
} from "@/lib/constants";
import { UserProductStatus } from "@/lib/enum";
import { IUserProduct, UserProduct } from "@/models";
import { Api } from "@/utils/api";
import { create, search } from "@/app/(api)";
import { Modal } from "@/shared/components/modal";
import { showToast } from "@/shared/components/showToast";

const productItemSchema = z.object({
  quantity: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nullable()
  ) as unknown as number,
  product_id: z.string().min(1, "Бүтээгдэхүүн заавал сонгоно").nullable(),
  status: z
    .preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.nativeEnum(UserProductStatus).nullable()
    )
    .optional() as unknown as number,
});

const formSchema = z.object({
  compare: z.boolean(),
  products: z
    .array(productItemSchema)
    .min(1, "Хамгийн багадаа 1 бүтээгдэхүүн нэмнэ"),
});

type UserProductType = z.infer<typeof formSchema>;

export const EmployeeProductModal = ({
  id,
  clear,
}: {
  id?: string;
  clear: () => void;
}) => {
  const form = useForm<UserProductType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      compare: false,
    },
  });

  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<boolean | undefined>(false);
  const [userProducts, setUserProducts] =
    useState<ListType<UserProduct> | null>(null);
  const [products, setProducts] = useState<SearchType<number>[]>([]);

  const { fields, append, replace } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const compare = form.watch("compare");
  const selectedIds = form.watch("products")?.map((p) => p.product_id);
  const userProductIds = new Set(
    userProducts?.items.map((up) => up.product_id)
  );

  const visibleProducts = products.filter((p) => {
    if (compare && !userProductIds.has(p.id)) return false;
    return true;
  });

  const searchProduct = async (name = "") => {
    const result = await search<number>(Api.product, { id: name });
    setProducts(result.data);
  };

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    const d = await fetcher<UserProduct>(Api.user_product, {
      page,
      limit: -1,
      sort,
      user_id: id,
    });
    setUserProducts(d);
    form.reset(undefined);
    if (d?.items) {
      const items = d.items
        .filter((item) => products.some((p) => p.id === item.product_id))
        .map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          status: item.user_product_status,
        }));
      console.log(items);
      replace(items);
    }
    setAction(ACTION.DEFAULT);
  };

  useEffect(() => {
    if (id !== undefined) {
      setOpen(true);
      searchProduct();
    } else {
      setOpen(false);
    }
  }, [id]);
  useEffect(() => {
    if (products.length > 0) {
      refresh();
    }
  }, [products]);

  const handleProductClickOnce = (productId: string) => {
    const existing = form.getValues("products");
    const alreadyExists = existing?.some((p) => p.product_id === productId);

    if (!alreadyExists) {
      append({
        product_id: productId,
        quantity: 1,
        status: UserProductStatus.Active,
      });
    }
  };

  const handleProductQuantityChange = (productId: string, change: number) => {
    const products = form.getValues("products");
    const index = products.findIndex((p) => p.product_id === productId);

    if (index !== -1) {
      const updated = [...products];
      const currentQty = (updated[index].quantity as number) ?? 0;
      const newQty = currentQty + change;

      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = {
          ...updated[index],
          quantity: newQty,
        };
      }

      form.setValue("products", updated);
    } else {
      if (change > 0) {
        append({
          product_id: productId,
          quantity: change,
          status: UserProductStatus.Active,
        });
      }
    }
  };

  const onConfirm = async () => {
    const data = fields.map((field) => {
      return {
        quantity: field.quantity,
        product_id: field.product_id,
        user_product_status: field.status,
        user_id: id,
      };
    }) as IUserProduct[];
    const res = await create<{ items: IUserProduct[] }>(Api.user_product, {
      items: data,
    });
    if (res.success) {
      form.reset(undefined);
      setUserProducts(null);
      showToast("success", "Бараа олгогдлоо.");
      clear();
    } else {
      showToast("error", res.error ?? "");
    }
  };
  const totalPages = Math.ceil(visibleProducts.length / DEFAULT_LIMIT);
  // const paginationRange = getPaginationRange(page + 1, totalPages);
  return (
    <Modal
      maw="7xl"
      open={open === true}
      setOpen={(v) => {
        setOpen(v);
        clear();
      }}
      name={``}
      title="Ажилчинд бараа олгох"
      submit={onConfirm}
    >
      <FormProvider {...form}>
        <div className="w-full space-y-5">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Бүтээгдэхүүн хайх..."
              onChange={(e) => {
                const value = e.target.value;
                if (value.length >= 2) searchProduct(value);
                else searchProduct("");
              }}
              className="w-full bg-white flex-1"
            />

            <div className="flex items-center gap-2 mt-2">
              <Switch
                checked={compare}
                onCheckedChange={(val) => form.setValue("compare", val)}
                id="compare-switch"
              />
              <label
                htmlFor="compare-switch"
                className="text-sm text-muted-foreground"
              >
                Зөвхөн хэрэглэгчийн авсан бүтээгдэхүүнүүд (
                {visibleProducts.length})
              </label>
              <Switch checked={compare} onCheckedChange={(val) => form.setValue("compare", val)} id="compare-switch" />
            </div>
          </div>

          <div className="bg-white border p-2 rounded-xl space-y-2">
            <div className="grid grid-cols-10 items-center justify-between w-full py-1 font-bold px-4 text-sm">
              <span className="col-span-2">Бренд</span>
              <span className="col-span-4">Төрөл</span>
              <span className="col-span-2">Бараа</span>
              <span className="col-span-2"></span>
            </div>
            <ScrollArea className="h-[55vh] w-full divide-y border border-b-0 rounded pt-0 bg-white">
              {visibleProducts.map((product, index) => {
                const [brand, category, name] = product.value.split("__");
                return (
                  <div key={product.id} className="flex items-center justify-between p-2 pr-6 border-b last:border-none">
                    <div className="grid grid-cols-10 items-center justify-between w-full gap-4">
                      <span className="text-sm text-start font-medium text-gray-700 truncate col-span-2">
                        {brand} brand
                      </span>
                      <span className="text-sm font-medium text-gray-700 truncate col-span-4">
                        {category}
                      </span>
                      <span className="text-sm font-medium text-gray-700 col-span-2">
                        {name}
                      </span>
                      <div className="flex items-center justify-end gap-1 col-span-2">
                        <Button variant="default" className="" size="icon" onClick={() => handleProductQuantityChange(product.id, -1)}>
                          <Minus strokeWidth={3} className="size-3.5" />
                        </Button>

                        <Input
                          type="number"
                          className="w-16 text-center bg-gray-200 no-spinner hide-number-arrows border-none"
                          value={(form.watch("products")?.find((p) => p.product_id === product.id)?.quantity as number) ?? ""}
                          onClick={() => handleProductClickOnce(product.id)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value || "0", 10);
                            const existing = form.getValues("products");
                            const index = existing.findIndex(
                              (p) => p.product_id === product.id
                            );

                            const updated = [...existing];

                            if (val <= 0 && index !== -1) {
                              updated.splice(index, 1);
                            } else if (index !== -1) {
                              updated[index] = {
                                ...updated[index],
                                quantity: val,
                              };
                            } else if (val > 0) {
                              updated.push({
                                product_id: product.id,
                                quantity: val,
                                status: UserProductStatus.Active,
                              });
                            }

                            form.setValue("products", updated);
                          }}
                        />

                        <Button variant="default" className="" size="icon" onClick={() => handleProductQuantityChange(product.id, 1)}>
                          <Plus strokeWidth={3} className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </div>
        </div>
        {/* oor ymand ashiglana aa */}
        {/* <Pagination>
          <PaginationContent>
            {totalPages > 0 && page > 0 && (
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(page - 1)} />
              </PaginationItem>
            )}

            {paginationRange.map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={pageNum === page + 1}
                    onClick={() => setPage(pageNum - 1)} // 0-based рүү хөрвүүлж байна
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {page < totalPages - 1 && (
              <PaginationItem>
                <PaginationNext onClick={() => setPage(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination> */}
      </FormProvider>
    </Modal>
  );
};
