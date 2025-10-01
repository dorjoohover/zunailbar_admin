"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  CalendarDaysIcon,
  Calendar,
  FileText,
} from "lucide-react";

import AddEventModal from "../../_modals/add-event-modal";
import DailyView from "./day/daily-view";
import { useModal } from "@/providers/modal-context";
import { ClassNames, CustomComponents, Views } from "@/types/index";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";
import {
  ACTION,
  getEnumValues,
  ListType,
  OrderStatusValues,
  SearchType,
} from "@/lib/constants";
import { Branch, IOrder, Order, Service, User } from "@/models";
import { Api } from "@/utils/api";
import { DatePicker } from "@/shared/components/date.picker";
import { mnDate } from "@/lib/functions";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/modal";
import { create } from "@/app/(api)";
import { OrderStatus, ROLE } from "@/lib/enum";
import { showToast } from "@/shared/components/showToast";
import { FormItems } from "@/shared/components/form.field";
import { TextField } from "@/shared/components/text.field";
import { PasswordField } from "@/shared/components/password.field";
import { ComboBox } from "@/shared/components/combobox";

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, type: "spring" },
};
const formSchema = z.object({
  mobile: z.string().length(8),
  nickname: z
    .string()
    .min(1)
    .regex(/^[\p{L}\s\-']+$/u, "Зөвхөн үсэг, зай, -, '"),
  password: z.string().nullable().optional(),
});

const defaultValues: UserType = {
  mobile: "",
  nickname: "",
  password: "",
};
type UserType = z.infer<typeof formSchema>;

export default function SchedulerViewFilteration({
  views = {
    views: ["day", "week", "month"],
    mobileViews: ["day"],
  },
  loading,
  stopDayEventSummary = false,
  CustomComponents,
  classNames,
  orders,
  excel,
  refresh,
  values,
  send,
  currentDate,
  setCurrentDate,
  setStatus,
  status,
  deleteOrder,
  action,
  columns,
}: {
  loading: boolean;
  deleteOrder: (id: string) => void;
  orders: ListType<Order>;
  values: {
    branch: SearchType<Branch>[];
    customer: SearchType<User>[];
    user: SearchType<User>[];
    service: SearchType<Service>[];
  };
  views?: Views;
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  setStatus: Dispatch<SetStateAction<OrderStatus | null>>;
  status: OrderStatus | null;
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
  send: (order: IOrder) => void;
  action: ACTION;
  columns: ColumnDef<IOrder>[];
  refresh: <T>({
    page,
    limit,
    sort,
    filter,
  }: {
    page?: number;
    limit?: number;
    sort?: boolean;
    filter?: T;
  }) => void;
  excel?: <T>({
    page,
    limit,
    sort,
    filter,
  }: {
    page?: number;
    limit?: number;
    sort?: boolean;
    filter?: T;
  }) => void;
}) {
  const { setOpen } = useModal();
  const [activeView, setActiveView] = useState<string>("day");
  const [clientSide, setClientSide] = useState(false);
  const form = useForm<UserType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  useEffect(() => {
    setClientSide(true);
  }, []);

  const [isMobile, setIsMobile] = useState(
    clientSide ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    if (!clientSide) return;
    setIsMobile(window.innerWidth <= 768);
    function handleResize() {
      if (window && window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }

    window && window.addEventListener("resize", handleResize);

    return () => window && window.removeEventListener("resize", handleResize);
  }, [clientSide]);

  function handleAddEvent(selectedDay?: number) {
    // Create the modal content with proper data
    const startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      selectedDay ?? new Date().getDate(),
      0,
      0,
      0,
      0
    );

    const endDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      selectedDay ?? new Date().getDate(),
      23,
      59,
      59,
      999
    );

    // Create a wrapper component to handle data passing
    const ModalWrapper = () => {
      const title =
        CustomComponents?.CustomEventModal?.CustomAddEventModal?.title ||
        "Захиалга нэмэх";

      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
        </div>
      );
    };

    // Open the modal with the content
    setOpen(
      <CustomModal title="Захиалга нэмэх">
        <AddEventModal
          items={values}
          send={send}
          loading={loading}
          // CustomAddEventModal={
          //   CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm
          // }
        />
      </CustomModal>
    );
  }

  const viewsSelector = isMobile ? views?.mobileViews : views?.views;

  // Set initial active view
  useEffect(() => {
    if (viewsSelector?.length) {
      setActiveView(viewsSelector[0]);
    }
  }, []);
  const downloadExcel = () => {
    if (excel) {
      excel({});
    }
  };
  const [acitons, setAction] = useState(ACTION.DEFAULT);
  const [open, setIsOPen] = useState<undefined | boolean>(false);
  const onSubmit = async <T,>(e: T) => {
    setAction(ACTION.RUNNING);
    const body = e as UserType;
    const { ...payload } = body;

    const res = await create<User>(Api.user, {
      ...e,
      role: ROLE.CLIENT,
      birthday: null,
    } as any);

    if (res.success) {
      refresh({});
      setIsOPen(false);
      showToast("success", "Амжилттай нэмлээ.");
      form.reset(defaultValues);
    } else {
      showToast("error", res.error ?? "");
    }
    setAction(ACTION.DEFAULT);
  };
  const onInvalid = async <T,>(e: T) => {
    const value = e as any;
    if (value.password != undefined)
      showToast("info", value.password?.message ?? "");
  };
  const [isList, setList] = useState(false);
  useEffect(() => {
    const d = mnDate(currentDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const date = `${y}-${m}-${day}`;
    refresh<{ date: string; status: number | null }>({
      filter: {
        date: date,
        status,
      },
    });
  }, [currentDate, status]);
  return (
    <div className="flex w-full flex-col">
      <div className="daily-weekly-monthly-selection relative w-full">
        <div className="flex items-center justify-between space-x-2 mb-0">
          <div className="flex gap-2">
            <DatePicker
              name=""
              pl="Огноо сонгох"
              props={{
                name: "",
                onBlur: () => {},
                onChange: (e) => {
                  setCurrentDate(e);
                },
                ref: () => null,
                value: currentDate,
              }}
            />

            <div className="w-full maw-[300px]">
              <ComboBox
                props={{
                  name: "Төлөв",
                  onBlur: () => {},
                  onChange: (e) => setStatus(e),
                  ref: () => null,
                  value: status,
                }}
                items={getEnumValues(OrderStatus).map((item) => {
                  return {
                    value: item.toString(),
                    label: OrderStatusValues[item],
                  };
                })}
              />
            </div>

            <Modal
              maw="md"
              name={"Хэрэглэгч нэмэх"}
              submit={() => form.handleSubmit(onSubmit, onInvalid)()}
              open={open == true}
              setOpen={(v) => {
                setIsOPen(v);
                form.reset(defaultValues);
              }}
              loading={action == ACTION.RUNNING}
            >
              <FormProvider {...form}>
                <div className="space-y-4">
                  {[
                    {
                      key: "nickname",
                      label: "Нэр",
                      pattern: true,
                    },
                    {
                      key: "mobile",
                      label: "Утас",
                    },
                  ].map((item, i) => {
                    const name = item.key as keyof UserType;
                    const label = item.label as keyof UserType;

                    return (
                      <FormItems
                        label={label}
                        control={form.control}
                        name={name}
                        key={i}
                        className={item.key === "name" ? "col-span-2" : ""}
                      >
                        {(field) => {
                          const blockRe: RegExp | undefined = item.pattern
                            ? /[^\p{L}\s\-']/gu
                            : undefined;
                          const onChange: React.ChangeEventHandler<
                            HTMLInputElement
                          > = (e) => {
                            if (blockRe) {
                              const raw = e.target.value ?? "";
                              const cleaned = raw.replace(blockRe, "");
                              console.log(cleaned);
                              // RHF-д value-гаар нь дамжуулна
                              (field.onChange as (v: string) => void)(cleaned);
                            } else {
                              field.onChange(e); // хэвийн дамжуул
                            }
                          };
                          return (
                            <TextField
                              props={{ ...field, onChange }}
                              label={""}
                            />
                          );
                        }}
                      </FormItems>
                    );
                  })}
                  <FormItems
                    control={form.control}
                    name="password"
                    className="col-span-2"
                  >
                    {(field) => {
                      return <PasswordField props={{ ...field }} view={true} />;
                    }}
                  </FormItems>
                </div>
              </FormProvider>
            </Modal>

            {excel && (
              <Button
                variant={"ghost"}
                onClick={downloadExcel}
                className="bg-green-500 text-white hover:bg-green-500/80 gap-1 hover:text-white"
              >
                <FileText />
                Excel
              </Button>
            )}
            {/* Add Event Button */}
            {CustomComponents?.customButtons?.CustomAddEventButton ? (
              <div onClick={() => handleAddEvent()}>
                {CustomComponents?.customButtons.CustomAddEventButton}
              </div>
            ) : (
              <Button
                onClick={() => handleAddEvent()}
                className={classNames?.buttons?.addEvent}
                variant="purple"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Хуваарь нэмэх
              </Button>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 mt-2 max-w-lg w-full">
            <Switch
              checked={isList}
              onCheckedChange={(val) => setList(val)}
              id="compare-switch"
            />
            <label
              htmlFor="compare-switch"
              className="text-sm text-muted-foreground"
            >
              Жагсаалтаар харах
            </label>
          </div>
        </div>
        <div className="divide-x-gray"></div>
        {isList ? (
          <DataTable
            // clear={() => setFilter(undefined)}

            columns={columns}
            count={orders?.count}
            data={orders?.items ?? []}
            refresh={refresh}
            loading={action == ACTION.RUNNING}
          />
        ) : (
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className={cn("w-full gap-0", classNames?.tabs)}
          >
            {viewsSelector?.includes("day") && (
              <TabsContent value="day">
                <AnimatePresence mode="wait">
                  <motion.div {...(animationConfig as any)}>
                    <DailyView
                      deleteOrder={deleteOrder}
                      loading={loading}
                      currentDate={currentDate}
                      setCurrentDate={setCurrentDate}
                      values={values}
                      refresh={refresh}
                      events={orders.items}
                      send={send}
                      stopDayEventSummary={stopDayEventSummary}
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}
