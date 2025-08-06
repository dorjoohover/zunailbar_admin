"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell, TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_LIMIT } from "@/lib/constants";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  limit?: number;
  count?: number;
  loading?: boolean;
  refresh: ({
    page,
    limit,
    sort,
  }: {
    page?: number;
    limit?: number;
    sort?: boolean;
  }) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  count = 0,
  limit = DEFAULT_LIMIT,
  refresh,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: limit,
  });
  const onPaginationChange = (updater: any) => {
    setPagination((old) => {
      const newPagination =
        typeof updater === "function" ? updater(old) : updater;
      return newPagination;
    });
  };
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current
      ? refresh({
          page: pagination.pageIndex,
          limit: pagination.pageSize,
        })
      : (mounted.current = true);
  }, [pagination.pageIndex, pagination.pageSize]);
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination: pagination,
    },
    pageCount: count,
    manualPagination: true,
    onPaginationChange,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 ">
        <Input
          placeholder="Хайх..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm bg-white border-slate-200"
        />
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          {table.getSelectedRowModel().rows.length} мөр сонгогдсон.
        </p>

        <div className="space-x-2 flex items-center">
          <div className="flex items-center">
            {/* {" page:"} / {"total: "} */}
            {pagination.pageIndex + 1} / {Math.ceil(count / limit)}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Өмнөх
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white"
            onClick={() => table.nextPage()}
            disabled={
              Math.ceil(count / limit) == pagination.pageIndex + 1 ||
              !table.getCanNextPage()
            }
          >
            Дараах
          </Button>
        </div>
      </div>
    </div>
  );
}
