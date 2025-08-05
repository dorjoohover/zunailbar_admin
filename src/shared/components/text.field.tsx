import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { ControllerRenderProps, type FieldValues } from "react-hook-form";

export const TextField = <T extends FieldValues>({
  props,
  label = "Name",
  pl,
  type = "text",
}: {
  pl?: string;
  type?: string;
  label?: string;
  props: ControllerRenderProps<T>;
}) => {
  const id = `${label}_${Math.round(Math.random() * 10)}`;
  return (
    <div className="relative space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        {...props}
        type={type}
        id={id}
        placeholder={pl}
        className="pr-10"
      />
    </div>
  );
};
