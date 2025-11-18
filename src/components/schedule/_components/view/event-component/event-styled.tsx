"use client";

import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-context";
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import { CustomEventModal } from "@/types";
import {
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  Trash2,
  Clock,
} from "lucide-react";
import { useScheduler } from "@/providers/schedular-provider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";
import { getUserColor } from "@/lib/colors";
import {
  getUserLevelValue,
  ListType,
  OrderStatusValues,
  SearchType,
} from "@/lib/constants";
import { OrderStatus, UserLevel } from "@/lib/enum";
import { Branch, IOrder, Order, Service, User } from "@/models";
import { showToast } from "@/shared/components/showToast";
import { Api } from "@/utils/api";
import AppDialog from "@/shared/components/appDialog";
import { mnDateStr, mobileFormatter } from "@/lib/functions";

// Function to format date
const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Function to format time only
const formatTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Color variants based on event type
const FAMILIES = [
  "blue",
  "red",
  "green",
  "yellow",
  "purple",
  "pink",
  "indigo",
  "teal",
  "cyan",
  "sky",
  "rose",
  "orange",
  "amber",
  "lime",
  "emerald",
  "violet",
  "fuchsia",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
];

// Нэмэлт сүүдэр сетүүд (1 өнгөнд 3 хувилбар = 60+ item)
const SHADE_SETS = [
  { bg: 50, border: 200, text: 800 },
  { bg: 100, border: 200, text: 800 },
  { bg: 200, border: 300, text: 900 },
];

export const PALETTE = FAMILIES.flatMap((c) =>
  SHADE_SETS.map((s) => ({
    bg: `bg-${c}-${s.bg}`,
    border: `border-${c}-${s.border}`,
    text: `text-${c}-${s.text}`,
  }))
);

interface EventStyledProps extends IOrder {
  minmized?: boolean;
  CustomEventComponent?: React.FC<IOrder>;
}

export default function EventStyled({
  event,
  onDelete,
  CustomEventModal,
  values,
  send,
  index = 1,
}: {
  values: {
    branch: SearchType<Branch>[];
    customer: SearchType<User>[];
    user: SearchType<User>[];
    service: ListType<Service>;
  };
  index?: number;
  send: (order: IOrder) => void;
  event: EventStyledProps;
  CustomEventModal?: CustomEventModal;
  onDelete: (id: string) => void;
}) {
  const { setOpen } = useModal();
  const { handlers } = useScheduler();

  // Determine if delete button should be shown
  // Hide it for minimized events to save space, show on hover instead
  const shouldShowDeleteButton = !event?.minmized;

  // Handler function
  function handleEditEvent(event: IOrder) {
    console.log(event);
    // Open the modal with the content
    setOpen(
      <CustomModal title="Захиалга засах">
        <AddEventModal
          send={send}
          items={values}
          values={{ ...event, edit: event.id }}
        />
      </CustomModal>,
      async () => {
        return {
          ...event,
        };
      }
    );
  }

  // Get background color class based on variant
  const getBackgroundColor = (color: number | undefined) => {
    const userColor = getUserColor(color ? color : 0);
    return userColor;
  };
  const artists = (() => {
    const uniqueArtists = [
      ...new Map(
        event.details
          ?.filter((e) => e.user_id) // зөвхөн user_id байгаа мөрүүд
          .map((e) => [e.user_id, e.user]) // user_id -> user
      ).values(),
    ];

    return uniqueArtists;
  })();
  const color = event?.details?.[0]?.user?.color;
  const secondColor = event?.details?.[1]?.user?.color;
  return (
    <div
      key={event?.id}
      className={cn(
        `w-full z-${
          50 * index
        } relative cursor-pointer border group rounded-lg flex flex-col flex-grow hover:shadow-md transition-shadow duration-200 bg-white`,
        event?.minmized ? "border-white" : "border-default-400/60"
      )}
    >
      {/* Delete button - shown by default for non-minimized, or on hover for minimized */}

      <AppDialog
        trigger={
          <Button
            variant="destructive"
            size="icon"
            className={cn(
              "absolute z-[100] right-1 top-[-8px] h-6 w-6 p-0 shadow-md hover:bg-destructive/90 transition-all duration-200",
              event?.minmized
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-100"
            )}
          >
            <Trash2 size={14} className="text-destructive-foreground" />
          </Button>
        }
        title="Захиалгыг устгах уу?"
        description="Энэ үйлдлийг хийсний дараа захиалга бүрмөсөн устах бөгөөд буцаах боломжгүй гэдгийг анхаарна уу!"
        onConfirm={() => {
          // handlers.handleDeleteEvent(event?.id);
          onDelete(event?.id!);
          showToast("deleted", "Захиалга устгагдлаа!");
        }}
      />

      {event.CustomEventComponent ? (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            // handleEditEvent({
            //   id: event?.id,
            //   title: event?.title,
            //   startDate: event?.startDate,
            //   endDate: event?.endDate,
            //   description: event?.description,
            //   color: event?.color,
            // });
          }}
        >
          <event.CustomEventComponent {...event} />
        </div>
      ) : (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              branch_id: event.branch_id,
              customer_id: event.customer_id,
              user_id: event.user_id,
              description: event.description,
              order_status: event.order_status,
              total_amount: event.total_amount ?? 0,
              order_date: event.order_date,
              start_time: event.start_time,
              end_time: event.end_time,
              details: event.details,
              paid_amount: event.paid_amount,
              pre_amount: event.pre_amount,
              duration: event.duration,
              is_pre_amount_paid: event.is_pre_amount_paid,
            });
          }}
          className={cn(
            "w-full p-2 text-gray-500 rounded-lg border-t-4 border-l border-r border-b max-w-[350px]",

            event?.minmized ? "flex-grow overflow-hidden" : "min-h-fit"
          )}
          style={{
            borderColor: secondColor
              ? getBackgroundColor(secondColor)
              : getBackgroundColor(color),
            borderTopColor: getBackgroundColor(color),
          }}
        >
          <div className="flex flex-col h-full " style={{}}>
            <div className="font-semibold text-xs truncate mb-1 ">
              {event?.details?.map((e, i) => {
                return (
                  <div key={i} className="flex gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-3 rounded-full h-3"
                        style={{
                          backgroundColor: getBackgroundColor(e.user.color),
                        }}
                      ></div>
                      <p>{e.user.nickname}</p>
                    </div>
                    {"/"}
                    <div className="flex gap-1">
                      <p>{e.service_name ?? "-"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="font-semibold text-xs truncate">
              Хэрэглэгчийн дугаар:{" "}
              <b>{mobileFormatter(event?.customer?.mobile ?? "")}</b> Эрэмбэ:{" "}
              <b
                className={`text-[${
                  getUserLevelValue[
                    (event.customer?.level as UserLevel) ?? UserLevel.BRONZE
                  ].textColor
                }]`}
              >
                {
                  getUserLevelValue[
                    (event.customer?.level as UserLevel) ?? UserLevel.BRONZE
                  ].name
                }
              </b>
            </div>
            {event.description && (
              <div className="my-2 text-xs max-w-[350px]">
                <b>Tip massage:</b> {event?.description}{" "}
              </div>
            )}
            {event?.minmized && (
              <div className="flex flex-col">
                <div className="text-[10px] flex justify-between">
                  <div className="flex text-xs items-center gap-1">
                    <Clock size={12} />{" "}
                    <span> {event?.start_time?.slice(0, 5)} - </span>
                    <span> {event?.end_time?.slice(0, 5)} </span>
                  </div>
                  <span className="opacity-80">
                    {event?.order_status &&
                      OrderStatusValues[event?.order_status as OrderStatus]}
                  </span>
                </div>
              </div>
            )}
            {!event?.minmized && event?.description && (
              <div className="my-2 text-sm">{event?.description} </div>
            )}

            {!event?.minmized && (
              <div className="text-xs space-y-1 mt-2">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {event.start_time}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="mr-1 h-3 w-3" />
                  {event?.end_time}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
