import { cn } from "@/lib/utils";
import { Check, Info, Trash, X } from "lucide-react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "info";

interface ShowToastOptions {
  duration?: number;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}

const toastConfig = {
  success: {
    method: toast.success,
    defaultIcon: <Check className="size-4" strokeWidth={3} />,
    color: "green-500",
  },
  deleted: {
    method: toast.success,
    defaultIcon: <Trash className="size-4" strokeWidth={3} />,
    color: "red-500",
  },
  error: {
    method: toast.error,
    defaultIcon: <X className="size-4" strokeWidth={3} />,
    color: "red-400",
  },
  info: {
    method: toast,
    defaultIcon: <Info className="size-4" strokeWidth={3} />,
    color: "gray-500",
  },
};

export const showToast = (type: ToastType, message: string, options?: ShowToastOptions) => {
  const config = toastConfig[type] || toastConfig.info;

  config.method(
    <div className={cn("rounded flex items-center gap-2")}>
      <div className={cn(`bg-${config.color} text-white p-1 rounded-full`)} style={{ backgroundColor: config.color }}>
        {options?.icon ?? config.defaultIcon}
      </div>
      {message}
    </div>,
    {
      duration: options?.duration ?? 3000,
      position: options?.position ?? "bottom-right",
      icon: null,
    }
  );
};
