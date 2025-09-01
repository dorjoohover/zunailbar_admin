"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { useModal } from "@/providers/modal-context";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventFormData, eventSchema, Variant } from "@/types/index";
import { useScheduler } from "@/providers/schedular-provider";
import { Branch, IOrder, Service, User } from "@/models";
import { OrderStatus } from "@/lib/enum";
import { FormItems } from "@/shared/components/form.field";
import { ComboBox } from "@/shared/components/combobox";
import { getEnumValues, ListType, OrderStatusValues } from "@/lib/constants";
import { mnDateFormat, numberArray, usernameFormatter } from "@/lib/functions";
import { TextField } from "@/shared/components/text.field";
const defaultValues = {
  branch_id: "",
  user_id: "",
  customer_desc: "",
  details: [],
  order_date: new Date(),
  start_time: 5,
};
export default function AddEventModal({
  // CustomAddEventModal,
  branches,
  customers,
  users,
  services,
  send,
}: {
  branches: Branch[];
  customers: User[];
  send: (order: IOrder) => void;
  users: User[];
  services: Service[];
  // CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
}) {
  const { setClose, data } = useModal();

  const typedData = data as { default: IOrder };

  const { handlers } = useScheduler();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  // Reset the form on initialization
  useEffect(() => {
    if (data?.default) {
      const eventData = data?.default;
      console.log("eventData", eventData);
      form.reset(defaultValues);
    }
  }, [data, form.reset]);

  const onSubmit: SubmitHandler<EventFormData> = (formData) => {
    const newEvent: IOrder = {
      customer_desc: formData.customer_desc,
      customer_id: formData.customer_id,
      user_id: formData.user_id,
      user_desc: formData.user_desc ?? undefined,
      order_status: formData.order_status as OrderStatus | undefined,
      total_amount: formData.total_amount as number | undefined,
      branch_id: formData.branch_id,
      order_date: formData.order_date,
      start_time: formData.start_time,
      end_time: formData.end_time ?? undefined,
      details: formData.details,
    };
    send(newEvent);

    setClose(); // Close the modal after submission
  };

  return (
    <form
      className="flex flex-col gap-4 p-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* {CustomAddEventModal ? (
        <CustomAddEventModal register={register} errors={errors} />
      ) : ( */}
      <FormProvider {...form}>
        <FormItems control={form.control} name="branch_id" label="Салбар">
          {(field) => {
            return (
              <ComboBox
                props={{ ...field }}
                items={branches.map((item) => {
                  return {
                    value: item.id,
                    label: item.name,
                  };
                })}
                className="max-w-96! w-full"
              />
            );
          }}
        </FormItems>
        <FormItems control={form.control} name="customer_id" label="Хэрэглэгч">
          {(field) => {
            return (
              <ComboBox
                props={{ ...field }}
                items={customers.map((item) => {
                  console.log(usernameFormatter(item));
                  return {
                    value: item.id,
                    label: usernameFormatter(item),
                  };
                })}
                className="max-w-96! w-full"
              />
            );
          }}
        </FormItems>
        <FormItems control={form.control} name="user_id" label="Артист">
          {(field) => {
            return (
              <ComboBox
                props={{ ...field }}
                items={users.map((item) => {
                  return {
                    value: item.id,
                    label: usernameFormatter(item),
                  };
                })}
                className="max-w-96! w-full"
              />
            );
          }}
        </FormItems>
        <FormItems
          control={form.control}
          name="user_desc"
          label="Артистын тайлбар"
        >
          {(field) => {
            return <TextField props={{ ...field }} />;
          }}
        </FormItems>
        <FormItems
          control={form.control}
          name="customer_desc"
          label="Хэрэглэгчийн тайлбар"
        >
          {(field) => {
            return <TextField props={{ ...field }} />;
          }}
        </FormItems>
        <FormItems control={form.control} name="order_status" label="Статус">
          {(field) => {
            return (
              <ComboBox
                props={{ ...field }}
                items={getEnumValues(OrderStatus).map((item) => {
                  return {
                    value: item.toString(),
                    label: OrderStatusValues[item],
                  };
                })}
              />
            );
          }}
        </FormItems>
        <FormItems
          control={form.control}
          name="total_amount"
          label="Нийт төлбөр"
        >
          {(field) => {
            return <TextField type="money" props={{ ...field }} />;
          }}
        </FormItems>
        <FormItems control={form.control} name="order_date" label="Огноо">
          {(field) => {
            return <TextField type="date" props={{ ...field }} />;
          }}
        </FormItems>
        <FormItems control={form.control} name="start_time" label="Эхлэх цаг">
          {(field) => {
            return (
              <ComboBox
                props={{ ...field }}
                items={numberArray(15).map((item) => {
                  const value = item + 5;
                  return {
                    value: value.toString(),
                    label: mnDateFormat(value),
                  };
                })}
              />
            );
          }}
        </FormItems>

        <div className="flex justify-end space-x-2 mt-4 pt-2 border-t">
          <Button variant="outline" type="button" onClick={() => setClose()}>
            Cancel
          </Button>
          <Button type="submit">Save Event</Button>
        </div>
      </FormProvider>
      {/* )} */}
    </form>
  );
}
