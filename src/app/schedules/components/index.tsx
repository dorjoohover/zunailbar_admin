"use client";

import { DataTable } from "@/components/data-table";
import {
  Branch,
  Brand,
  Category,
  IProduct,
  IBooking,
  Product,
  User,
  Booking,
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
import { fetcher } from "@/hooks/fetcher";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatTime,
  getDayName,
  getDayNameWithDate,
  numberArray,
} from "@/lib/functions";
import { cn } from "@/lib/utils";
import {
  ScheduleForm,
  ScheduleTable,
} from "@/components/layout/schedule.table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const hourLine = z.string();

const formSchema = z.object({
  branch_id: z.string().min(1),
  dates: z.array(hourLine).length(7), // 7 хоног
  edit: z.string().nullable().optional(),
});
const defaultValues: BookingType = {
  branch_id: "",
  dates: ["", "", "", "", "", "", ""],
  edit: undefined,
};
type BookingType = z.infer<typeof formSchema>;
export const BookingPage = ({
  data,
  branches,
}: {
  data: ListType<Booking>;
  branches: ListType<Branch>;
}) => {
  const [action, setAction] = useState(ACTION.DEFAULT);
  const [open, setOpen] = useState<undefined | boolean>(false);
  const form = useForm<BookingType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const [bookings, setBookings] = useState<ListType<Booking> | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const branchMap = useMemo(
    () => new Map(branches.items.map((b) => [b.id, b])),
    [branches.items]
  );

  const bookingFormatter = (data: ListType<Booking>) => {
    const items: Booking[] = data.items.map((item) => {
      const branch = branchMap.get(item.branch_id);

      return {
        ...item,
        branch_name: branch?.name ?? "",
      };
    });

    setBookings({ items, count: data.count });
    setLastBooking(items[0]);
  };
  useEffect(() => {
    bookingFormatter(data);
  }, [data]);
  const clear = () => {
    form.reset(defaultValues);
    console.log(form.getValues());
  };
  const deleteBooking = async (index: number) => {
    const id = bookings!.items[index].id;
    const res = await deleteOne(Api.booking, id);
    refresh();
    return res.success;
  };
  const edit = async (e: IBooking) => {
    setOpen(true);
    form.reset({ ...e, edit: e.id });
  };
  const columns = getColumns(edit, deleteBooking);

  const refresh = async (pg: PG = DEFAULT_PG) => {
    setAction(ACTION.RUNNING);
    const { page, limit, sort } = pg;
    await fetcher<Booking>(Api.booking, {
      page,
      limit: 7,
      sort,
      //   name: pg.filter,
    }).then((d) => {
      bookingFormatter(d);
      console.log(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    const date = lastBooking
      ? new Date(lastBooking.date.setDate(lastBooking.date.getDate() + 7))
      : new Date();
    console.log(e, date);
    setAction(ACTION.RUNNING);
    const body = e as BookingType;
    const { edit, ...payload } = body;
    const res = edit
      ? await updateOne<Booking>(
          Api.booking,
          edit ?? "",
          payload as unknown as Booking
        )
      : await create<IBooking>(Api.booking, {
          date: date,
          times: body.dates,
          branch_id: body.branch_id,
        });
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
        w="[1000px]"
        name={"Бараа нэмэх" + bookings?.count}
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
          <FormItems control={form.control} name={"dates"} className="">
            {(field) => {
              const value = (field.value as string[]) ?? Array(7).fill("");
              const date = lastBooking ? lastBooking.date : new Date();
              return (
                <ScheduleForm
                  date={date}
                  value={value}
                  setValue={(next) =>
                    form.setValue("dates", next, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                />
              );
            }}
          </FormItems>
        </FormProvider>
      </Modal>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {bookings?.items && (
        <ScheduleTable
          date={bookings.items[0].date}
          value={bookings.items.map((item) => item.times).reverse()}
          edit={null}
        />
      )}
      {/* <DataTable
        columns={columns}
        count={bookings?.count}
        data={bookings?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      /> */}
    </div>
  );
};
