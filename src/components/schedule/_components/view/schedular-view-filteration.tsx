"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  CalendarDaysIcon,
  Calendar,
} from "lucide-react";

import AddEventModal from "../../_modals/add-event-modal";
import DailyView from "./day/daily-view";
import { useModal } from "@/providers/modal-context";
import { ClassNames, CustomComponents, Views } from "@/types/index";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";
import { ListType, SearchType } from "@/lib/constants";
import { Branch, IOrder, Order, Service, User } from "@/models";
import { Api } from "@/utils/api";

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, type: "spring" },
};

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
  deleteOrder,
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
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
  send: (order: IOrder) => void;
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
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <div className="daily-weekly-monthly-selection relative w-full">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className={cn("w-full", classNames?.tabs)}
          >
            <div className="flex justify-between items-center mb-4">
              {/* <TabsList className="grid grid-cols-3 rounded-full overflow-hidden">
                {viewsSelector?.includes("day") && (
                  <TabsTrigger value="day">
                    {CustomComponents?.customTabs?.CustomDayTab ? (
                      CustomComponents.customTabs.CustomDayTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon size={15} />
                        <span>Өдөр</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes("week") && (
                  <TabsTrigger value="week">
                    {CustomComponents?.customTabs?.CustomWeekTab ? (
                      CustomComponents.customTabs.CustomWeekTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calendar />
                        <span>7 хоног</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes("month") && (
                  <TabsTrigger value="month">
                    {CustomComponents?.customTabs?.CustomMonthTab ? (
                      CustomComponents.customTabs.CustomMonthTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calendar />
                        <span>Сар</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}
              </TabsList> */}
              {excel && (
                <Button variant={"outline"} onClick={downloadExcel}>
                  Export
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

            {/* {viewsSelector?.includes("week") && (
              <TabsContent value="week">
                <AnimatePresence mode="wait">
                  <motion.div {...(animationConfig as any)}>
                    <WeeklyView
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

            {viewsSelector?.includes("month") && (
              <TabsContent value="month">
                <AnimatePresence mode="wait">
                  <motion.div {...(animationConfig as any)}>
                    <MonthView
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
            )} */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
