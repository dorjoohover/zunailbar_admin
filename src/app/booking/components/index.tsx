"use client";
import { Branch, IBooking, Booking } from "@/models";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListType, ACTION, PG, DEFAULT_PG } from "@/lib/constants";
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
import DynamicHeader from "@/components/dynamicHeader";
import { cn } from "@/lib/utils";

const hourLine = z.string();
const limit = 7;
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
  const [page, setPage] = useState(0);
  const [branch, setBranch] = useState(branches.items[0]);
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
    const { sort } = pg;
    await fetcher<Booking>(
      Api.booking,
      {
        page: page,
        limit,
        sort,
        branch_id: branch.id,
        //   name: pg.filter,
      },
      "employee"
    ).then((d) => {
      bookingFormatter(d);
    });
    setAction(ACTION.DEFAULT);
  };
  const onSubmit = async <T,>(e: T) => {
    let lastDate = lastBooking ? new Date(lastBooking?.date) : new Date();
    if (lastBooking)
      lastDate = new Date(lastDate.setDate(lastDate.getDate() + 7));
    const date = lastDate;
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

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current ? refresh() : (mounted.current = true);
  }, [page, branch]);

  return (
    <div className="">
      <DynamicHeader count={bookings?.count} />

      <div className="admin-container space-y-0">
        <Modal
          maw="3xl"
          title="Цагийн хуваарь оруулах форм"
          name={"Цагийн хуваарь нэмэх"}
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
            <div className={cn("max-h-[60vh] overflow-y-scroll")}>
              <FormItems control={form.control} name={"dates"} className="">
                {(field) => {
                  const value = (field.value as string[]) ?? Array(7).fill("");
                  let date = new Date();
                  if (lastBooking) {
                    const lastDate = new Date(lastBooking.date);
                    date = new Date(lastDate.setDate(lastDate.getDate() + 7));
                  }

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
            </div>
          </FormProvider>
        </Modal>
        <ComboBox
          items={branches.items.map((b, i) => {
            return {
              label: b.name,
              value: b.id,
            };
          })}
          props={{
            onChange: (v: string) => {
              const selected = branches.items.filter((b) => b.id == v)[0];
              setBranch(selected);
            },
            name: "",
            onBlur: () => {},
            ref: () => {},
            value: branch?.id,
          }}
        />
        <Pagination>
          <PaginationContent>
            {page > 0 && (
              <PaginationItem>
                <PaginationNext onClick={() => setPage(page - 1)} />
              </PaginationItem>
            )}

            {bookings && Math.ceil(+bookings.count / limit) - 1 > page && (
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
        {bookings?.items && bookings?.items?.length > 0 ? (
          <ScheduleTable
            d={bookings.items?.[0]?.date}
            value={bookings.items.map((item) => item.times).reverse()}
            edit={null}
          />
        ) : null}
        {/* <DataTable
        columns={columns}
        count={bookings?.count}
        data={bookings?.items ?? []}
        refresh={refresh}
        loading={action == ACTION.RUNNING}
      /> */}
      </div>
    </div>
  );
};
