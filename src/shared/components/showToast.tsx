import { cn } from "@/lib/utils";
import { Check, Info, Trash, X } from "lucide-react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "info";

interface ShowToastOptions {
  duration?: number;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  title?: string;
}

const toastConfig = {
  success: {
    method: toast.success,
    defaultTitle: "Амжилттай",
    defaultIcon: <Check className="size-4" strokeWidth={3} />,
    color: "#4ad460",
  },
  deleted: {
    method: toast.success,
    defaultTitle: "Устгалаа",
    defaultIcon: <Trash className="size-4" strokeWidth={3} />,
    color: "#fb4a24",
  },
  error: {
    method: toast.error,
    defaultTitle: "Алдаа гарлаа",
    defaultIcon: <X className="size-4" strokeWidth={3} />,
    color: "#fb4a24",
  },
  info: {
    method: toast.info,
    defaultTitle: "Анхааруулга",
    defaultIcon: <Info className="size-4" strokeWidth={3} />,
    color: "#fbbc28",
  },
};

export const showToast = (type: ToastType, message: string, options?: ShowToastOptions) => {
  const config = toastConfig[type] || toastConfig.info;

  config.method(
    <div className={cn("flex gap-4")}>
      {/* Title */}
      <div className="flex items-center">
        <div className={cn("p-1 rounded-full text-white")} style={{ backgroundColor: config.color }}>
          {options?.icon ?? config.defaultIcon}
        </div>
      </div>

      {/* Message + Icon */}
      <div className={cn("space-y-1")}>
        <div className="font-semibold">{options?.title ?? config.defaultTitle}</div>

        <span className="text-slate-600">{message}</span>
      </div>
    </div>,
    {
      duration: options?.duration ?? 3000,
      position: options?.position ?? "bottom-right",
      icon: null,
    }
  );
};
