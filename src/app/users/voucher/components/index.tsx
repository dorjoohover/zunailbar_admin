"use client";

import { DataTable } from "@/components/data-table";
import {
  Branch,
  Brand,
  Category,
  IProduct,
  IVoucher,
  Product,
  Service,
  User,
  Voucher,
} from "@/models";
import { useEffect, useMemo, useState } from "react";
import {
  ListType,
  ACTION,
  PG,
  DEFAULT_PG,
  getEnumValues,
} from "@/lib/constants";
import { Modal } from "@/shared/components/modal";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Api } from "@/utils/api";
import { create, deleteOne, updateOne } from "@/app/(api)";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { TextField } from "@/shared/components/text.field";
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { usernameFormatter } from "@/lib/functions";

const formSchema = z.object({
  branch_id: z.string().min(1),
  name: z.string().min(1),
  max_price: z
    .preprocess(
      (val) => (typeof val === "string" ? parseFloat(val) : val),
      z.number()
    )
    .nullable()
    .optional() as unknown as number,
  min_price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  duration: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number()
  ) as unknown as number,
  edit: z.string().nullable().optional(),
});
const defaultValues: VoucherType = {
  branch_id: "",
  name: "",
  max_price: null,
  min_price: 0,
  duration: 0,
  edit: undefined,
};
type VoucherType = z.infer<typeof formSchema>;
export const VoucherPage = ({
  data,
  services,
}: {
  data: ListType<Voucher>;
  services: ListType<Service>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<VoucherType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [vouchers, setVouchers] = useState<ListType<Voucher> | null>(null);
  const serviceMap = useMemo(
    () => new Map(services.items.map((b) => [b.id, b])),
    [services.items]
  );

  const voucherFormatter = (data: ListType<Voucher>) => {
    const items: Voucher[] = data.items.map((item) => {
      const service = serviceMap.get(item.service_id);

      return {
        ...item,
        service_name: service?.name ?? "",
      };
    });

    setVouchers({ items, count: data.count });
  };
  useEffect(() => {
    voucherFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deleteVoucher = async (index: number) => {
    const id = vouchers!.items[index].id;
    const res = await deleteOne(Api.voucher, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IVoucher) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteVoucher);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Voucher>(Api.voucher, {
      page,
      limit,
      sort,
      //   name: pg.filter,
    }).then((d) => {
      voucherFormatter(d);
      console.log(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as VoucherType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<Voucher>(
          Api.voucher,
          edit ?? "",
          payload as unknown as Voucher
        )
      : await create<Voucher>(Api.voucher, e as Voucher);
    console.log(res);
    if (res.success) {
      refresh();
      setOpen(false);
      clear();
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    console.log("error", e);
  };

  return (
    <div className="">
      <Modal
        name={"Хөнгөлөлт" + vouchers?.count}
        submit={() => form.handleSubmit(onSubmit, onInvalid)()}
        open={open == true}
        reset={() => {
          setOpen(false);
          clear();
        }}
        setOpen={setOpen}
        loading={action == ACTION.RUNNING}
      >
        <FormProvider {...form}>
          <FormItems control={form.control} name="branch_id">
            {(field) => {
              return (
                <ComboBox
                  props={{ ...field }}
                  items={services.items.map((item) => {
                    return {
                      value: item.id ?? "",
                      label: item.name ?? "",
                    };
                  })}
                />
              );
            }}
          </FormItems>

          {[
            {
              key: "min_price",
              type: "money",
              label: "Үнэ",
            },
            {
              key: "max_price",
              type: "money",
              label: "Их үнэ",
            },
            {
              key: "duration",
              type: "number",
              label: "Хугацаа",
            },
          ].map((item, i) => {
            const name = item.key as keyof VoucherType;
            const label = item.label as keyof VoucherType;
            return (
              <FormItems
                control={form.control}
                name={name}
                key={i}
                className={item.key === "name" ? "col-span-2" : ""}
              >
                {(field) => {
                  return (
                    <TextField
                      props={{ ...field }}
                      type={item.type}
                      label={label}
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
        count={vouchers?.count}
        data={vouchers?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      />
      {action}
      {/* <ProductDialog
        editingProduct={editingProduct}
        onChange={onChange}
        save={handleSave}
      /> */}
    </div>
  );
};
