import { ColumnDef } from "@tanstack/react-table";
import { mnDateFormat, mobileFormatter, money } from "@/lib/functions";
import { IOrder, IOrderDetail } from "@/models";
import { OrderStatus } from "@/lib/enum";
import { OrderStatusValues } from "@/lib/constants";

export function getColumns(): ColumnDef<IOrder>[] {
  return [
    {
      id: "select",
      header: () => <span>№</span>,
      cell: ({ row }) => <span>{row.index + 1}</span>,
    },
    {
      accessorKey: "details",
      header: () => <span>Гарчиг</span>,
      cell: ({ row }) => (
        <div className="mb-1 max-w-[260px] whitespace-normal break-words text-xs font-semibold">
          {(row.getValue("details") as IOrderDetail[])
            .map((e) => e.service_name)
            .join(", ") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "artist",
      header: () => <span>Артист</span>,
      cell: ({ row }) => {
        const details = (row.original.details ?? []) as Array<
          IOrderDetail & { nickname?: string | null }
        >;
        const artists = Array.from(
          new Set(details.map((detail) => detail.nickname).filter(Boolean)),
        );

        return <span>{artists.join(", ") || "-"}</span>;
      },
    },
    {
      accessorKey: "customer",
      header: () => <span>Утасны дугаар</span>,
      cell: ({ row }) => (
        <span>{mobileFormatter((row.getValue("customer") as any)?.mobile ?? "")}</span>
      ),
    },
    {
      accessorKey: "order_date",
      header: () => <span>Захиалгын огноо</span>,
    },
    {
      accessorKey: "start_time",
      header: () => <span>Эхлэх цаг</span>,
      cell: ({ row }) => <span>{(row.getValue("start_time") as string).slice(0, 5)}</span>,
    },
    {
      accessorKey: "end_time",
      header: () => <span>Дуусах цаг</span>,
      cell: ({ row }) => <span>{(row.getValue("end_time") as string).slice(0, 5)}</span>,
    },
    {
      accessorKey: "order_status",
      header: () => <span>Төлөв</span>,
      cell: ({ row }) => (
        <span>
          {OrderStatusValues[row.getValue("order_status") as OrderStatus]}
        </span>
      ),
    },
    {
      accessorKey: "total_amount",
      header: () => <span>Нийт төлбөр</span>,
      cell: ({ row }) => {
        const total = Number(row.getValue("total_amount") ?? 0);
        return <span>{money(total.toString())}₮</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: () => <span>Үүсгэсэн огноо</span>,
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string | Date | undefined;
        if (!createdAt) return <span>-</span>;
        return <span>{mnDateFormat(new Date(createdAt))}</span>;
      },
    },
  ];
}
