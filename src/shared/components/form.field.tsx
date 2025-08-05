import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ReactNode } from "react";
import {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";

export const FormItems = <T extends FieldValues>({
  control,
  name,
  children,
}: {
  name: Path<T>;
  control: Control<T, any, T>;
  children: (field: ControllerRenderProps<T>) => ReactNode;
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {children(field)}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
