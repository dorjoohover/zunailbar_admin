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
  className,
  children,
}: {
  name: Path<T>;
  className?: string;
  control: Control<T, any, T>;
  children: (field: ControllerRenderProps<T>) => ReactNode;
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {children(field)}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
