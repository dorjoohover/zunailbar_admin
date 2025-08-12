import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { ControllerRenderProps, type FieldValues } from "react-hook-form";
import { mobileFormatter, money } from "@/lib/functions";

export const TextField = <T extends FieldValues>({
  props,
  label,
  pl,
  type = "text",
  symbol = "₮",
  className = "pr-10 bg-white h-10",
}: {
  pl?: string;
  symbol?: string;
  type?: string; // "money" бол форматлана
  label?: string;
  className?: string;
  props: ControllerRenderProps<T>;
}) => {
  const id = `${label}_${Math.round(Math.random() * 10)}`;
  const [display, setDisplay] = useState(
    type === "money"
      ? money(String(props.value ?? ""))
      : String(props.value ?? "")
  );

  useEffect(() => {
    if (type === "money") {
      setDisplay(money(String(props.value ?? "0")));
    }
  }, [props.value, type]);

  if (type !== "money") {
    return (
      <div className="relative space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Input
          {...props}
          type={type}
          id={id}
          placeholder={pl}
          className="pr-10 bg-white h-10 hide-number-arrows"
        />
      </div>
    );
  }

  return (
    <div className="relative space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative w-full">
        <Input
          id={id}
          placeholder={pl}
          className={className}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, ""); // зөвхөн тоо
            props.onChange(raw); // form-д тоо хадгална
            setDisplay(raw); // фокус дотор raw тоо харагдана
          }}
          onBlur={() => setDisplay(money(String(props.value ?? "")))} // blur үед money формат
          onFocus={() => setDisplay(String(props.value ?? ""))} // focus үед raw утга
        />
        {type === "money" && (
          <span className="absolute top-[50%] -translate-y-[50%] right-3 flex items-center text-primary pointer-events-none">
            {symbol}
          </span>
        )}
      </div>
    </div>
  );
};
