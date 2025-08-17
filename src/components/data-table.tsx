"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { DEFAULT_LIMIT } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Funnel,
  LoaderCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Calendar } from "./ui/calendar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  limit?: number;
  count?: number;
  loading?: boolean;
  refresh: <T>({
    page,
    limit,
    sort,
    filter,
  }: {
    page?: number;
    limit?: number;
    sort?: boolean;
    filter?: T;
  }) => void;
  modalAdd?: React.ReactNode;
  filter?: ReactNode;
  clear?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  count = 0,
  limit = DEFAULT_LIMIT,
  refresh,
  loading = false,
  modalAdd,
  clear,
  filter,
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
          filter: globalFilter,
        })
      : (mounted.current = true);
  }, [pagination.pageIndex, pagination.pageSize]);
  useEffect(() => {
    mounted.current
      ? globalFilter.length > 1 || globalFilter.length == 0
        ? refresh({
            page: pagination.pageIndex,
            limit: pagination.pageSize,
            filter: globalFilter,
          })
        : null
      : (mounted.current = true);
  }, [globalFilter]);
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

  // const totalPages = Math.ceil(count / limit);
  // const currentPage = pagination.pageIndex;

  // if (totalPages <= 1) {
  //   return null; // эсвэл <></>, pagination байхгүй
  // }

  // function getPaginationRange() {
  //   const start = Math.max(1, currentPage + 1 - 2);
  //   const end = Math.min(totalPages, currentPage + 1 + 2);
  //   let pages = [];
  //   for (let i = start; i <= end; i++) {
  //     pages.push(i);
  //   }
  //   return pages;
  // }

  const totalPages = Math.ceil(count / limit);
  const currentPage = pagination.pageIndex;

  function getPaginationRange() {
    const start = Math.max(1, currentPage + 1 - 2);
    const end = Math.min(totalPages, currentPage + 1 + 2);
    let pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  const [showFilter, setShowFilter] = useState(false);

  const roles = ["Ажилчин", "Менежер", "asd"];

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="w-full space-y-4">
      {/* Table action */}
      <div className="border-b space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative min-w-sm">
              <div className="flex items-center">
                <Search
                  className="size-5 absolute top-[50%] -translate-y-[50%] left-2 text-slate-600"
                  strokeWidth={2.5}
                />
              </div>
              <Input
                placeholder="Хайх..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full bg-white ring-1 ring-primary pl-10"
              />
            </div>

            {/* Table filter trigger */}
            <Button
              onClick={() => setShowFilter(!showFilter)}
              className={cn(
                showFilter
                  ? "bg-primary text-white"
                  : " bg-white text-dark hover:bg-gray-100",
                "ring-1 ring-primary cursor-pointer"
              )}
            >
              <Funnel />
            </Button>
          </div>

          {/* Add modal button */}
          {modalAdd && <div> {modalAdd}</div>}
        </div>

        {/* Filter show */}
        {!showFilter && filter != undefined && (
          <div className="flex items-end justify-between gap-2 p-3 border rounded-md bg-white">
            {filter}

            <Button variant="outline" onClick={clear}>
              Цэвэрлэх
            </Button>
          </div>
        )}
      </div>
      <h2 className="space-x-2 my-2 font-bold">
        Нийт:
        <span> {count} мөр</span>
      </h2>

      {/* Table */}
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-x-2">
                    <LoaderCircle className="animate-spin text-slate-700 size-8" />
                    Уншиж байна
                  </div>
                </TableCell>
              </TableRow>
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
                  Хоосон байна
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getSelectedRowModel().rows.length} мөр сонгогдсон.
        </p>

        <div className="space-x-2 flex items-center">
          <div className="flex items-center">
            {/* {pagination.pageIndex + 1} / {Math.ceil(count / limit)} */}
          </div>

          <div className="flex items-center space-x-3 h-11">
            <div className="flex bg-white border px-3 h-full pl-1 rounded-lg items-center gap-x-1">
              <Select
                value={(currentPage + 1).toString()}
                onValueChange={(value) => {
                  const page = Number(value);
                  setPagination((old) => ({ ...old, pageIndex: page - 1 }));
                }}
              >
                <SelectTrigger size="sm" className="bg-gray-100 pl-2 pr-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <SelectItem key={page} value={page.toString()}>
                        {page}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <span>/</span>
              <p>{Math.ceil(count / limit)}</p>
            </div>

            <div className="flex h-full gap-x-1">
              <Button
                variant="outline"
                className="bg-white aspect-square shadow-none h-full"
                onClick={() =>
                  setPagination((old) => ({
                    ...old,
                    pageIndex: Math.max(old.pageIndex - 1, 0),
                  }))
                }
                disabled={currentPage === 0}
              >
                <ChevronLeft className="size-6" />
              </Button>

              <Button
                variant="outline"
                className="bg-white aspect-square shadow-none h-full"
                onClick={() =>
                  setPagination((old) => ({
                    ...old,
                    pageIndex: Math.min(old.pageIndex + 1, totalPages - 1),
                  }))
                }
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="size-6" />
              </Button>
            </div>
          </div>
          {/* <Button variant="outline" size="sm" className="bg-white" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Өмнөх
          </Button>
          <Button variant="outline" size="sm" className="bg-white" onClick={() => table.nextPage()} disabled={Math.ceil(count / limit) == pagination.pageIndex + 1 || !table.getCanNextPage()}>
            Дараах
          </Button> */}

          {/* <Button variant="outline" className="bg-white" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Өмнөх
          </Button>
          {getPaginationRange().map((page) => (
            <Button
              variant="outline"
              key={page}
              onClick={() => {
              }}
              className={`px-3 py-1 border rounded hover:bg-gray-200 ${page === currentPage + 1 ? "bg-blue-500 text-white" : ""}`}
            >
              {page}
            </Button>
          ))}
          <Button variant="outline" onClick={() => table.nextPage()} disabled={Math.ceil(count / limit) == pagination.pageIndex + 1 || !table.getCanNextPage()} className="bg-white">
            Дараах
          </Button> */}
        </div>
      </div>
    </div>
  );
}
