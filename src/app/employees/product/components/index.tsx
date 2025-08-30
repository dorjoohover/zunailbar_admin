"use client";
import { DataTable } from "@/components/data-table";
import { ACTION, DEFAULT_PG, getEnumValues, getValuesUserProductStatus, ListDefault, ListType, Option, PG, RoleValue } from "@/lib/constants";
import { useEffect, useMemo, useState } from "react";
import { ROLE, UserProductStatus } from "@/lib/enum";
import z from "zod";

import { Api } from "@/utils/api";
import { fetcher } from "@/hooks/fetcher";
import { Branch, IUser, Product, User, UserProduct } from "@/models";
import { getColumns } from "./columns";
import ContainerHeader from "@/components/containerHeader";
import DynamicHeader from "@/components/dynamicHeader";
import { create, updateOne } from "@/app/(api)";
import { imageUploader } from "@/app/(api)/base";
import { Input } from "@/components/ui/input";
import { firstLetterUpper, objectCompact, usernameFormatter } from "@/lib/functions";
import { ComboBox } from "@/shared/components/combobox";
import { DatePicker } from "@/shared/components/date.picker";
import { FormItems } from "@/shared/components/form.field";
import { Modal } from "@/shared/components/modal";
import { PasswordField } from "@/shared/components/password.field";
import { TextField } from "@/shared/components/text.field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Label } from "recharts";
import { EmployeeProductModal } from "../../components/employee.product";
import { FilterPopover } from "@/components/layout/popover";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type FilterType = {
  branch?: string;
  user?: string;
  product?: string;
  status?: number;
};
export const EmployeeProductPage = ({ data, products, branches, users }: { data: ListType<UserProduct>; branches: ListType<Branch>; users: ListType<User>; products: ListType<Product> }) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<boolean | undefined>(false);

  const [userProduct, setUserProduct] = useState<ListType<UserProduct>>(data);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  // const onSubmit = async <T,>(e: T) => {
  //   const { file, ...body } = form.getValues();
  //   const formData = new FormData();
  //   let payload = {};
  //   if (file != null) {
  //     formData.append("files", file);
  //     const uploadResult = await imageUploader(formData);
  //     payload = {
  //       ...(body as IUser),
  //       profile_img: uploadResult[0],
  //     };
  //   } else {
  //     payload = {
  //       ...(body as IUser),
  //     };
  //   }
  //   const res = editingUser
  //     ? await updateOne<IUser>(Api.user, editingUser?.id as string, payload)
  //     : await create<IUser>(Api.user, payload);
  //   if (res.success) {
  //     refresh();
  //     setOpen(false);
  //     form.reset();
  //   }
  //   setAction(ACTION.DEFAULT);
  // };
  // const onInvalid = async <T,>(e: T) => {
  //   console.log("error", e);

  //   // setSuccess(false);
  // };

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<UserProduct>(Api.user_product, {
      page: page ?? DEFAULT_PG.page,
      limit: limit ?? DEFAULT_PG.limit,
      sort: sort ?? DEFAULT_PG.sort,
      ...pg,
    }).then((d) => {
      setUserProduct(d);
      // form.reset(undefined);
    });
    setAction(ACTION.DEFAULT);
  };
  const edit = (e: IUser) => {
    setOpen(true);
    setEditingUser(e);
    // form.reset(e);
  };
  const setStatus = async (index: number, status: number) => {
    const res = await updateOne(Api.user, users.items[index].id, {
      user_status: status,
    });
    refresh();
  };

  const columns = getColumns(edit, setStatus);
  const [filter, setFilter] = useState<FilterType>();
  const changeFilter = (key: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    refresh(
      objectCompact({
        branch_id: filter?.branch,
        user_id: filter?.user,
        product_id: filter?.product,
        user_product_status: filter?.status,
        page: 0,
      })
    );
  }, [filter]);
  const groups: { key: keyof FilterType; label: string; items: Option[] }[] = useMemo(
    () => [
      {
        key: "branch",
        label: "Салбар",
        items: branches.items.map((b) => ({ value: b.id, label: b.name })),
      },
      {
        key: "user",
        label: "Артист",
        items: users.items.map((b) => ({
          value: b.id,
          label: usernameFormatter(b),
        })),
      },
      {
        key: "product",
        label: "Бүтээгдэхүүн",
        items: products.items.map((b) => ({ value: b.id, label: b.name })),
      },
      {
        key: "status",
        label: "Статус",
        items: getEnumValues(UserProductStatus).map((s) => ({
          value: s,
          label: getValuesUserProductStatus[s].name,
        })),
      },
    ],
    [branches.items]
  );

  return (
    <div className="relative w-full">
      <DynamicHeader count={data.count} />

      <div className="admin-container">
        <DataTable
          clear={() => setFilter(undefined)}
          filter={
            <>
              {groups.map((item, i) => {
                const { key } = item;
                return (
                  <FilterPopover
                    key={i}
                    content={item.items.map((it, index) => (
                      <label key={index} className="checkbox-label">
                        <Checkbox checked={filter?.[key] == it.value} onCheckedChange={() => changeFilter(key, it.value)} />
                        <span className="">{it.label as string}</span>
                      </label>
                    ))}
                    value={filter?.[key] ? item.items.filter((item) => item.value == filter[key])[0].label : undefined}
                    label={item.label}
                  />
                );
              })}
            </>
          }
          columns={columns}
          data={userProduct.items}
          refresh={refresh}
          loading={action === ACTION.RUNNING}
          count={userProduct.count}
          modalAdd={<></>}
        />
      </div>
    </div>
  );
};
