import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { ControllerRenderProps, type FieldValues } from "react-hook-form";

export const PasswordField = <T extends FieldValues>({
  props,
  view = true,
  label = "Password",
}: {
  view?: boolean;
  label?: string;
  props: ControllerRenderProps<T>;
}) => {
  const [isView, setIsView] = useState(view);
  return (
    <div className="relative space-y-1">
      <Label htmlFor="password">{label}</Label>

      <Input
        {...props}
        id="password"
        type={isView ? "text" : "password"}
        placeholder="••••••••"
        className="pr-10"
      />

      {/* Toggle Icon */}
      <div className="absolute right-3 top-[25px] cursor-pointer text-gray-500">
        {isView ? (
          <Eye onClick={() => setIsView(false)} />
        ) : (
          <EyeOff onClick={() => setIsView(true)} />
        )}
      </div>
    </div>
  );
};
