"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { useScheduler } from "@/providers/schedular-provider";
import { useModal } from "@/providers/modal-context";
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import EventStyled from "../event-component/event-styled";
import { CustomEventModal } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomModal from "@/components/ui/custom-modal";
import {
  mnDate,
  mnDateFormat,
  mnDateFormatTitle,
  totalHours,
} from "@/lib/functions";
import { Branch, IOrder, Service, User } from "@/models";

// Generate hours in 12-hour format
const hours = Array.from({ length: totalHours }, (_, i) => {
  const hour = i + 5;
  return `${hour}:00`;
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Stagger effect between children
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
};

const pageTransitionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    opacity: 0,
    transition: {
      opacity: { duration: 0.2, ease: "easeInOut" },
    },
  }),
};

// Precise time-based event grouping function
const groupEventsByTimePeriod = (events: IOrder[] | undefined) => {
  if (!events || events.length === 0) return [];

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    const start_date = new Date(a.order_date ?? new Date());
    start_date.setHours(a.start_time ?? 5);
    const end_date = new Date(b.order_date ?? new Date());
    start_date.setHours(b.start_time ?? 5);

    return start_date.getTime() - end_date.getTime();
  });
  // const sortedEvents = [...events].sort(
  //   (a, b) => new Date(a.order).getTime() - new Date(b.startDate).getTime()
  // );

  // // Precise time overlap checking function
  // const eventsOverlap = (event1: Event, event2: Event) => {
  //   const start1 = new Date(event1.startDate).getTime();
  //   const end1 = new Date(event1.endDate).getTime();
  //   const start2 = new Date(event2.startDate).getTime();
  //   const end2 = new Date(event2.endDate).getTime();

  //   // Strict time overlap - one event starts before the other ends
  //   return start1 < end2 && start2 < end1;
  // };

  // Use a graph-based approach to find connected components (overlapping event groups)
  const buildOverlapGraph = (events: IOrder[]) => {
    // Create adjacency list
    const graph: Record<string, string[]> = {};

    // Initialize graph
    events.forEach((event) => {
      if (event.id) graph[event.id] = [];
    });

    // Build connections
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        // if (eventsOverlap(events[i], events[j])) {
        //   graph[events[i].id].push(events[j].id);
        //   graph[events[j].id].push(events[i].id);
        // }
      }
    }

    return graph;
  };

  // Find connected components using DFS
  const findConnectedComponents = (
    graph: Record<string, string[]>,
    events: IOrder[]
  ) => {
    const visited: Record<string, boolean> = {};
    const components: IOrder[][] = [];

    // DFS function to traverse the graph
    const dfs = (nodeId: string, component: string[]) => {
      visited[nodeId] = true;
      component.push(nodeId);

      for (const neighbor of graph[nodeId]) {
        if (!visited[neighbor]) {
          dfs(neighbor, component);
        }
      }
    };

    // Find all connected components
    for (const event of events) {
      if (event.id && !visited[event.id]) {
        const component: string[] = [];
        dfs(event.id, component);

        // Map IDs back to events
        const eventGroup = component.map(
          (id) => events.find((e) => e.id === id)!
        );

        components.push(eventGroup);
      }
    }

    return components;
  };

  // Build the overlap graph
  const graph = buildOverlapGraph(sortedEvents);

  // Find connected components (groups of overlapping events)
  const timeGroups = findConnectedComponents(graph, sortedEvents);

  // Sort events within each group by start time
  return timeGroups.map((group) =>
    group.sort((a, b) => {
      const start_date = new Date(a.order_date ?? new Date());
      start_date.setHours(a.start_time ?? 5);
      const end_date = new Date(b.order_date ?? new Date());
      start_date.setHours(b.start_time ?? 5);

      return start_date.getTime() - end_date.getTime();
    })
  );
};

export default function DailyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  stopDayEventSummary,
  events,
  classNames,
  users,
  customers,
  branches,
  services,
  refresh,
}: {
  prevButton?: React.ReactNode;
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
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<IOrder>;
  events: IOrder[];
  users: User[];
  customers: User[];
  branches: Branch[];
  services: Service[];
  CustomEventModal?: CustomEventModal;
  stopDayEventSummary?: boolean;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}) {
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [detailedHour, setDetailedHour] = useState<string | null>(null);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [direction, setDirection] = useState<number>(0);
  const { setOpen } = useModal();
  const { getters, handlers } = useScheduler();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!hoursColumnRef.current) return;
      const rect = hoursColumnRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const hourHeight = Math.ceil(rect.height / totalHours);
      const hour = Math.max(0, Math.min(23, Math.floor(y / hourHeight))) + 5;
      const hour12 = hour;
      setDetailedHour(`${hour12}:00`);

      const position = Math.max(0, Math.min(rect.height, Math.round(y)));
      setTimelinePosition(position);
    },
    []
  );

  const getFormattedDayTitle = useCallback(
    () => mnDateFormatTitle(mnDateFormat(currentDate)),
    [currentDate]
  );

  const dayEvents = getters.getEventsForDay(
    currentDate?.getDate() || 0,
    currentDate
  );

  // Calculate time groups once for all events
  const timeGroups = groupEventsByTimePeriod(dayEvents);

  function handleAddEvent(event?: IOrder) {
    // Create the modal content with the provided event data or defaults
    const orderDate = event?.order_date || new Date();

    // Open the modal with the content

    setOpen(
      <CustomModal title="Захиалга нэмэх">
        <AddEventModal
          branches={branches}
          customers={customers}
          services={services}
          users={users}
          CustomAddEventModal={
            CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />
      </CustomModal>,
      async () => {
        return {
          ...event,
          orderDate,
        };
      }
    );
  }

  function handleAddEventDay(detailedHour: string) {
    if (!detailedHour) {
      console.error("Detailed hour not provided.");
      return;
    }

    // Parse the 12-hour format time
    const [timePart, ampm] = detailedHour.split(" ");
    const [hourStr, minuteStr] = timePart.split(":");
    let hours = parseInt(hourStr);
    const minutes = parseInt(minuteStr);

    // Convert to 24-hour format for Date object
    if (ampm === "PM" && hours < 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    const chosenDay = currentDate.getDate();

    // Ensure day is valid
    if (chosenDay < 1 || chosenDay > 31) {
      console.error("Invalid day selected:", chosenDay);
      return;
    }

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      chosenDay,
      hours,
      minutes
    );

    handleAddEvent({
      order_date: date,
      start_time: hours,
      end_time: hours + 1, // 1-hour duration
      branch_id: "",
      user_id: "",
    });
  }

  const handleNextDay = useCallback(() => {
    setDirection(1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  }, [currentDate]);

  const handlePrevDay = useCallback(() => {
    setDirection(-1);
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
  }, [currentDate]);
  useEffect(() => {
    const d = mnDate(currentDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const date = `${y}-${m}-${day}`;
    refresh<{ date: string }>({
      filter: {
        date,
      },
    });
  }, [currentDate]);

  return (
    <div className="">
      <div className="flex justify-between gap-3 flex-wrap mb-5">
        <h1 className="text-3xl font-semibold mb-4">
          {/* title */}
          {getFormattedDayTitle()}
        </h1>

        <div className="flex ml-auto  gap-3">
          {prevButton ? (
            <div onClick={handlePrevDay}>{prevButton}</div>
          ) : (
            <Button
              variant={"outline"}
              className={classNames?.prev}
              onClick={handlePrevDay}
            >
              <ArrowLeft />
              Prev
            </Button>
          )}
          {nextButton ? (
            <div onClick={handleNextDay}>{nextButton}</div>
          ) : (
            <Button
              variant={"outline"}
              className={classNames?.next}
              onClick={handleNextDay}
            >
              Next
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentDate.toISOString()}
          custom={direction}
          variants={pageTransitionVariants as any}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="flex flex-col gap-4"
        >
          {!stopDayEventSummary && (
            <div className="all-day-events">
              <AnimatePresence initial={false}>
                {dayEvents && dayEvents?.length
                  ? dayEvents?.map((event, eventIndex) => {
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="mb-2"
                        >
                          <EventStyled
                            event={{
                              ...event,
                              CustomEventComponent,
                              minmized: false,
                            }}
                            CustomEventModal={CustomEventModal}
                          />
                        </motion.div>
                      );
                    })
                  : "No events for today"}
              </AnimatePresence>
            </div>
          )}

          <div className="relative rounded-md bg-default-50 hover:bg-default-100 transition duration-400">
            <motion.div
              className="relative rounded-xl flex ease-in-out"
              ref={hoursColumnRef}
              variants={containerVariants}
              initial="hidden" // Ensure initial state is hidden
              animate="visible" // Trigger animation to visible state
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setDetailedHour(null)}
            >
              <div className="flex  flex-col">
                {hours.map((hour, index) => (
                  <motion.div
                    key={`hour-${index}`}
                    variants={itemVariants}
                    className="cursor-pointer   transition duration-300  p-4 h-[64px] text-left text-sm text-muted-foreground border-default-200"
                  >
                    {hour}
                  </motion.div>
                ))}
              </div>
              <div className="flex relative flex-grow flex-col ">
                {Array.from({ length: totalHours }).map((_, index) => (
                  <div
                    onClick={() => {
                      handleAddEventDay(detailedHour as string);
                    }}
                    key={`hour-${index}`}
                    className="cursor-pointer w-full relative border-b  hover:bg-default-200/50  transition duration-300  p-4 h-[64px] text-left text-sm text-muted-foreground border-default-200"
                  >
                    <div className="absolute bg-accent flex items-center justify-center text-xs opacity-0 transition left-0 top-0 duration-250 hover:opacity-100 w-full h-full">
                      Захиалга нэмэх
                    </div>
                  </div>
                ))}
                <AnimatePresence initial={false}>
                  {events && events?.length
                    ? events.map((event, eventIndex) => {
                        // Find which time group this event belongs to
                        let eventsInSamePeriod = 10;
                        let periodIndex = 0;

                        for (let i = 0; i < timeGroups.length; i++) {
                          const groupIndex = timeGroups[i].findIndex(
                            (e) => e.id === event.id
                          );
                          if (groupIndex !== -1) {
                            eventsInSamePeriod = timeGroups[i].length;
                            periodIndex = groupIndex;
                            break;
                          }
                        }
                        const {
                          height,
                          left,
                          maxWidth,
                          minWidth,
                          top,
                          zIndex,
                        } = handlers.handleEventStyling(event, events, {
                          eventsInSamePeriod,
                          periodIndex,
                          adjustForPeriod: true,
                        });

                        return (
                          <motion.div
                            key={event.id}
                            style={{
                              minHeight: height,
                              top: top,
                              left: left,
                              maxWidth: maxWidth,
                              minWidth: minWidth,
                              padding: "0 2px",
                              boxSizing: "border-box",
                            }}
                            className="flex transition-all duration-1000 flex-grow flex-col z-50 absolute"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EventStyled
                              event={{
                                ...event,
                                CustomEventComponent,
                                minmized: true,
                              }}
                              CustomEventModal={CustomEventModal}
                            />
                          </motion.div>
                        );
                      })
                    : ""}
                </AnimatePresence>
              </div>
            </motion.div>

            {detailedHour && (
              <div
                className="absolute left-[50px] w-[calc(100%-53px)] h-[2px] bg-primary/40 rounded-full pointer-events-none"
                style={{ top: `${timelinePosition}px` }}
              >
                <Badge
                  variant="outline"
                  className="absolute -translate-y-1/2 bg-white z-50 left-[-20px] text-xs"
                >
                  {detailedHour}
                </Badge>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
