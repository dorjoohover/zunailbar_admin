import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/models/product.model";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AppAlertDialog } from "@/components/AlertDialog";
import { toast } from "sonner";
import {
  mnDateFormat,
  mobileFormatter,
  money,
  parseDate,
} from "@/lib/functions";
import { IOrderDetail, IProductTransaction, OrderLog } from "@/models";
import { OrderStatus, ProductTransactionStatus, STATUS } from "@/lib/enum";
import { IOrder } from "@/models";
import { TableActionButtons } from "@/components/tableActionButtons";
import { OrderStatusValues, StatusValues } from "@/lib/constants";

const formatOrderLogChangedAt = (value: string | Date) => {
  if (typeof value === "string") {
    const match = value
      .trim()
      .match(
        /^(\d{4})[-/.](\d{2})[-/.](\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/,
      );

    if (match) {
      const [, year, month, day, hour = "00", minute = "00", second = "00"] =
        match;
      return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    const hour = String(value.getUTCHours()).padStart(2, "0");
    const minute = String(value.getUTCMinutes()).padStart(2, "0");
    const second = String(value.getUTCSeconds()).padStart(2, "0");
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
  }

  return parseDate(value, true);
};

const displayText = (value?: string | null) => {
  const text = `${value ?? ""}`.trim();
  return text.toLowerCase() === "null" ? "" : text;
};

export function getColumns(
  view: (id: OrderLog) => void,
): ColumnDef<OrderLog>[] {
  return [
    {
      id: "select",
      header: ({ table }) => <span>№</span>,
      cell: ({ row }) => <span className="">{row.index + 1}</span>,
    },

    {
      accessorKey: "changed_user",
      header: ({ table }) => <span>Өөрчлөлт оруулсан</span>,

      cell: ({ row }) => (
        <div>
          <span> {row.getValue("changed_user") as string}</span>
        </div>
      ),
    },
    {
      accessorKey: "branch_name",
      header: ({ table }) => <span>Салбар</span>,
      cell: ({ row }) => (
        <div>
          <span>{displayText(row.getValue("branch_name") as string)}</span>
        </div>
      ),
    },
    {
      accessorKey: "artist_names",
      header: ({ table }) => <span>Артист</span>,
      cell: ({ row }) => (
        <div>
          <span>{displayText(row.getValue("artist_names") as string)}</span>
        </div>
      ),
    },
    {
      accessorKey: "customer_mobile",
      header: ({ table }) => <span>Хэрэглэгчийн дугаар</span>,

      cell: ({ row }) => (
        <div>
          <span> {mobileFormatter(row.getValue("customer_mobile") as string)}</span>
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: ({ table }) => <span>Хэрэглэгчийн нэр</span>,
      cell: ({ row }) => (
        <div>
          <span>{displayText(row.getValue("customer_name") as string)}</span>
        </div>
      ),
    },
    {
      accessorKey: "changed_at",
      header: ({ table }) => <span>Огноо</span>,

      cell: ({ row }) => (
        <div>
          <span>
            {formatOrderLogChangedAt(row.getValue("changed_at") as string | Date)}
          </span>
        </div>
      ),
    },

    {
      accessorKey: "old_order_status",
      header: ({ table }) => <span>Хуучин төлөв</span>,
      cell: ({ row }) => (
        <div>
          <span>
            {OrderStatusValues[row.getValue("old_order_status") as OrderStatus]}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "new_order_status",
      header: ({ table }) => <span>Шинэ төлөв</span>,
      cell: ({ row }) => (
        <div>
          <span>
            {OrderStatusValues[row.getValue("new_order_status") as OrderStatus]}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "old_status",
      header: ({ table }) => <span>Хуучин төлөв</span>,
      cell: ({ row }) => (
        <div>
          <span>{StatusValues[row.getValue("old_status") as STATUS]}</span>
        </div>
      ),
    },
    {
      accessorKey: "new_status",
      header: ({ table }) => <span>Шинэ төлөв</span>,
      cell: ({ row }) => (
        <div>
          <span>{StatusValues[row.getValue("new_status") as STATUS]}</span>
        </div>
      ),
    },

    {
      id: "actions",
      header: "Үйлдэл",
      cell: ({ row }) => (
        <TableActionButtons
          rowData={row.original}
          onEdit={(data) => view(data)}
          edit_text="Харах"
        ></TableActionButtons>
      ),
    },
  ];
}
