"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TooltipWrapper from "./tooltipWrapper";
import { toast } from "sonner";
import { AppAlertDialog } from "./AlertDialog";
import React, { ReactNode } from "react";
import { showToast } from "../shared/components/showToast";

interface TableActionButtonsProps<T> {
  rowData: T;
  onEdit: (data: T) => void;
  onRemove?: (data: T) => Promise<any>;
  children?: ReactNode; // Дунд хэсэгт нэмэлт JSX оруулах боломж
}

export function TableActionButtons<T>({ rowData, onEdit, onRemove, children }: TableActionButtonsProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <TooltipWrapper tooltip="Засварлах">
        <Button variant="ghost" size="icon" onClick={() => onEdit(rowData)}>
          <Pencil className="w-4 h-4" />
        </Button>
      </TooltipWrapper>

      {/* Энд дунд хэсгийн JSX оруулна */}
      {children}

      {onRemove && (
        <AppAlertDialog
          title="Итгэлтэй байна уу?"
          description="Бүр устгана шүү."
          onConfirm={async () => {
            try {
              const res = await onRemove(rowData);
              showToast("success", `Амжилттай устгалаа! ${res}`);
            } catch (error) {
              showToast("error", "Устгах явцад алдаа гарлаа");
            }
            // const res = await onRemove(rowData);
            // toast.success(`Амжилттай устгалаа! ${res}`, {
            //   duration: 3000, // 3 секунд
            //   position: "bottom-right", // байрлал
            //   style: {
            //     fontWeight: "bold",
            //     borderRadius: "8px",
            //     padding: "12px 16px",
            //   },
            //   icon: "✅",
            // });
          }}
          trigger={
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          }
        />
      )}
    </div>
  );
}
