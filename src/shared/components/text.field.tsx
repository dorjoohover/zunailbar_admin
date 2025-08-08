import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { ControllerRenderProps, type FieldValues } from "react-hook-form";
import { mobileFormatter, money } from "@/lib/functions";

export const TextField = <T extends FieldValues>({
  props,
  label = "Name",
  pl,
  type = "text",
  symbol = "₮",
}: {
  pl?: string;
  symbol?: string;
  type?: string; // "money" бол форматлана
  label?: string;
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
      console.log(props.value);
      setDisplay(money(String(props.value ?? "0")));
    }
  }, [props.value, type]);

  if (type !== "money") {
    return (
      <div className="relative space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          {...props}
          type={type}
          id={id}
          placeholder={pl}
          className="pr-10 bg-white h-10"
        />
      </div>
    );
  }

  return (
    <div className="relative space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={pl}
        className="pr-10 bg-white h-10"
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
        <span className="absolute top-7 right-3 flex items-center text-gray-500 pointer-events-none">
          {symbol}
        </span>
      )}
    </div>
  );
};
