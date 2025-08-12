"use client";

import { useEffect, useState } from "react";
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
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import { useModal } from "@/providers/modal-context";
import { ClassNames, CustomComponents, Views } from "@/types/index";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";
import { ListType } from "@/lib/constants";
import { IOrder, Order } from "@/models";

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, type: "spring", stiffness: 250 },
};

export default function SchedulerViewFilteration({
  views = {
    views: ["day", "week", "month"],
    mobileViews: ["day"],
  },
  stopDayEventSummary = false,
  CustomComponents,
  classNames,
  orders,
}: {
  orders: ListType<Order>;
  views?: Views;
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
}) {
  const { setOpen } = useModal();
  const [activeView, setActiveView] = useState<string>("day");
  const [clientSide, setClientSide] = useState(false);

  console.log("activeView", activeView);

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
        "Add Event";

      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
        </div>
      );
    };

    // Open the modal with the content
    setOpen(
      <CustomModal title="Add Event">
        <AddEventModal
          CustomAddEventModal={
            CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />{" "}
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

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <div className="dayly-weekly-monthly-selection relative w-full">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className={cn("w-full", classNames?.tabs)}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid grid-cols-3">
                {viewsSelector?.includes("day") && (
                  <TabsTrigger value="day">
                    {CustomComponents?.customTabs?.CustomDayTab ? (
                      CustomComponents.customTabs.CustomDayTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon size={15} />
                        <span>Day</span>
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
                        <span>Week</span>
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
                        <span>Month</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Add Event Button */}
              {CustomComponents?.customButtons?.CustomAddEventButton ? (
                <div onClick={() => handleAddEvent()}>
                  {CustomComponents?.customButtons.CustomAddEventButton}
                </div>
              ) : (
                <Button
                  onClick={() => handleAddEvent()}
                  className={classNames?.buttons?.addEvent}
                  variant="default"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              )}
            </div>

            {viewsSelector?.includes("day") && (
              <TabsContent value="day">
                <AnimatePresence mode="wait">
                  <motion.div {...(animationConfig as any)}>
                    <DailyView
                      events={orders.items.map(
                        ({ order_date, start_time, end_time, id }) => {
                          const date = new Date(order_date);

                          // Үндсэн өдөр/сар/жил
                          const year = date.getFullYear();
                          const month = date.getMonth(); // getMonth() нь 0-ээс эхэлдэг тул -1 хэрэггүй
                          const day = date.getDate();

                          const createDateTime = (hour: number) =>
                            new Date(year, month, day, Number(hour) || 0);

                          return {
                            id,
                            title: id,
                            startDate: createDateTime(+start_time),
                            endDate: createDateTime(+end_time),
                          };
                        }
                      )}
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

            {viewsSelector?.includes("week") && (
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
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
