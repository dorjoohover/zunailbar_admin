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
import { formatTime, mnDateFormat, money, numberArray, totalHours, toTimeString, usernameFormatter } from "@/lib/functions";
import { TextField } from "@/shared/components/text.field";
import { Select, SelectItem } from "@/components/ui/select";
import { fi } from "zod/v4/locales";
import { MultiSelect } from "@/shared/components/multiple.select";
import { showToast } from "@/shared/components/showToast";
const defaultValues = {
  branch_id: "",
  user_id: "",
  customer_desc: "",
  details: [],
  order_date: mnDateFormat(new Date()),
  start_time: "",
  edit: undefined,
};
export default function AddEventModal({
  // CustomAddEventModal,
  branches,
  customers,
  users,
  services,
  send,
  values,
  loading = false,
}: {
  branches: Branch[];
  loading?: boolean;
  customers: User[];
  send: (order: IOrder) => void;
  users: User[];
  services: Service[];
  values?: IOrder;
  // CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
}) {
  const { setClose, data } = useModal();

  const typedData = data as { default: IOrder };

  const { handlers } = useScheduler();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultValues,
  });

  // Reset the form on initialization
  useEffect(() => {
    if (data?.default) {
      const eventData = data?.default;
      console.log("eventData", eventData);
      form.reset(defaultValues);
    }
    if (values) {
      form.reset({
        ...values,
        edit: values.id,
      });
    }
  }, [data, form.reset, values]);

  const onSubmit: SubmitHandler<EventFormData> = (formData) => {
    const newEvent: IOrder = {
      customer_desc: formData.customer_desc ?? undefined,
      customer_id: formData.customer_id,
      user_id: formData.user_id,
      user_desc: formData.user_desc ?? undefined,
      order_status: formData.order_status as OrderStatus | undefined,
      total_amount: formData.total_amount as number | undefined,
      order_date: formData.order_date,
      start_time: `${formData.start_time}`,
      details: formData.details,
      edit: formData.edit ?? undefined,
    };

    send(newEvent);

    setClose();
  };
  const onInvalid = async <T,>(e: T) => {
    console.log(e);

    showToast("error", "Мэдээлэл дутуу байна");
  };
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
      <FormProvider {...form}>
        <div className="double-col">
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
                />
              );
            }}
          </FormItems>
          <FormItems control={form.control} name="details" label="Үйлчилгээ">
            {(field) => {
              // field.value нь [{service_id,...}] байдаг → MultiSelect-д массив id болгож дамжуулна
              const selectedIds: string[] = Array.isArray(field.value) ? field.value.map((d: any) => d?.service_id).filter(Boolean) : [];

              return (
           <div>
                 <MultiSelect
                  // RHF field-ийг “id массив” болгосон wrapper-оор өгнө
                  props={
                    {
                      name: field.name,
                      value: selectedIds,
                      onChange: (ids: string[]) => {
                        const nextDetails = ids.map((id) => {
                          const svc = services.find((s) => s.id === id);
                          return {
                            service_id: id,
                            service_name: svc?.name ?? "",
                            duration: svc?.duration ?? null,
                          };
                        });
                        field.onChange(nextDetails);
                      },
                      onBlur: field.onBlur,
                      ref: field.ref,
                    } as any
                  }
                  items={services.map((s) => ({ label: s.name, value: s.id }))}
                />
           </div>
              );
            }}
          </FormItems>
          <FormItems control={form.control} name="customer_id" label="Хэрэглэгч">
            {(field) => {
              return (
                <ComboBox
                  props={{ ...field }}
                  items={customers.map((item) => {
                    return {
                      value: item.id,
                      label: usernameFormatter(item),
                    };
                  })}
                />
              );
            }}
          </FormItems>

          <FormItems control={form.control} name="user_id" label="Артист">
            {(field) => {
              return (
                <ComboBox
                  props={{ ...field }}
                  items={users
                    .filter((user) => {
                      const branch = form.watch("branch_id");
                      return branch ? user.branch_id == branch : user;
                    })
                    .map((item) => {
                      return {
                        value: item.id,
                        label: usernameFormatter(item),
                      };
                    })}
                />
              );
            }}
          </FormItems>
        </div>

        <FormItems control={form.control} name="user_desc" label="Артистын тайлбар">
          {(field) => {
            return <TextField props={{ ...field }} />;
          }}
        </FormItems>
        <FormItems control={form.control} name="customer_desc" label="Хэрэглэгчийн тайлбар">
          {(field) => {
            return <TextField props={{ ...field }} />;
          }}
        </FormItems>
        <div className="double-col">
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
          <FormItems control={form.control} name="total_amount" label="Нийт төлбөр">
            {(field) => {
              return <TextField type="money" props={{ ...field }} />;
            }}
          </FormItems>
          <FormItems control={form.control} name="order_date" label="Огноо">
            {(field) => {
              field.value = mnDateFormat((field.value as Date) ?? new Date());
              return <TextField type="date" props={{ ...field }} />;
            }}
          </FormItems>
          <FormItems control={form.control} name="start_time" label="Эхлэх цаг">
            {(field) => {
              field.value = field.value ? +field.value?.toString().slice(0, 2) : field.value;
              return (
                <ComboBox
                  props={{ ...field }}
                  items={numberArray(totalHours).map((item) => {
                    const value = item + 4;

                    return {
                      value: value.toString(),
                      label: toTimeString(value),
                    };
                  })}
                />
              );
            }}
          </FormItems>
        </div>

        <div className="flex justify-end space-x-2 mt-4 pt-2">
          <Button variant="outline" type="button" onClick={() => setClose()}>
            Буцах
          </Button>
          <Button type="submit" loading={loading}>
            Хадгалах
          </Button>
        </div>
      </FormProvider>
      {/* )} */}
    </form>
  );
}
