"use client";

import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronDown, ChevronLeft, ChevronRight, Funnel, LoaderCircle, RotateCw, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { useSidebar } from "./ui/sidebar";
import { ScrollAreaViewport } from "@radix-ui/react-scroll-area";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  limit?: number;
  count?: number;
  loading?: boolean;
  refresh: <T>({ page, limit, sort, filter }: { page?: number; limit?: number; sort?: boolean; filter?: T }) => void;
  modalAdd?: React.ReactNode;
  filter?: ReactNode;
  clear?: () => void;
  search?: boolean;
}

export function DataTable<TData, TValue>({ columns, data, count = 0, limit = DEFAULT_LIMIT, refresh, loading = false, modalAdd, clear, filter, search = true }: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: limit,
  });
  const onPaginationChange = (updater: any) => {
    setPagination((old) => {
      const newPagination = typeof updater === "function" ? updater(old) : updater;
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
  const [showFilter, setShowFilter] = useState(true);

  const roles = ["Ажилчин", "Менежер", "asd"];

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => setWidth(window.innerWidth);

    // Set initial width
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { open } = useSidebar();

  useEffect(() => {
    if (open) {
      console.log("✅ Sidebar нээгдлээ!");
      // 👉 энд API дуудна, event илгээнэ, эсвэл custom функц ажиллуулна
    } else {
      console.log("❌ Sidebar хаагдлаа!");
    }
  }, [open]); // open өөрчлөгдөх бүрт ажиллана

  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = React.useState(false);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setAtEnd(el.scrollLeft >= maxScroll - 5);
    };

    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn("space-y-4 w-full transition-all duration-300", open ? "lg:w-[calc(100vw-20rem-3rem)] w-[calc(100vw-2rem)]" : "lg:w-[calc(100vw-8rem)] w-[calc(100vw-2rem)]")}>
      {/* Table action */}
      <div className="w-full pb-4 space-y-4 border-b">
        <div className="flex flex-wrap items-end justify-between gap-y-4">
          <div className="flex flex-wrap items-end gap-2">
            {/* Search input */}
            {search && (
              <div className="relative w-full space-y-2 min-w-40 max-w-40 xl:max-w-auto">
                <h1 className="text-xs font-bold text-gray-500">Хайх</h1>
                <div className="relative w-full">
                  <Search className="size-5 absolute top-[50%] -translate-y-[50%] left-2 text-slate-600" strokeWidth={2.5} />

                  <Input placeholder="Хайх..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="w-full pl-10 text-sm! bg-white" />
                </div>
              </div>
            )}
            {filter != undefined && <>{filter}</>}{" "}
            <Button variant="ghost" onClick={clear} className="text-xs text-red-500 bg-white border">
              <RotateCw className="size-3.5" />
            </Button>
            {/* <Button variant={"outline"} onClick={() => setShowFilter(!showFilter)} className={cn(showFilter ? "bg-primary text-white border-primary" : "hover:bg-gray-100", "border cursor-pointer")}>
              <SlidersHorizontal />
              Шүүлтүүр
              <ChevronDown className={cn(showFilter ? "-rotate-180" : "", "duration-150")} />
            </Button> */}
            {/* Table filter trigger */}
          </div>

          <div className="flex items-center justify-end space-x-2">
            {/* Add modal button */}
            <Button variant={"outline"}>Export</Button>
            {modalAdd && <div> {modalAdd}</div>}
          </div>
        </div>
      </div>
      {/* <h2 className="my-2 space-x-2 font-bold">
        Нийт:
        <span> {count} мөр</span>
      </h2> */}

      <ScrollArea className={cn("h-fit w-full transition-all duration-300")}>
        {/* Table */}
        <ScrollAreaViewport ref={viewportRef}>
          <div className="overflow-hidden border-slate-200">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-x-2">
                        <LoaderCircle className="animate-spin text-slate-700 size-8" />
                        Уншиж байна
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cn()}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Хоосон байна
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollAreaViewport>
        <ScrollBar orientation="horizontal" className="" />
      </ScrollArea>

      {!atEnd && <div className="absolute top-0 right-0 w-12 h-full pointer-events-none bg-gradient-to-l from-red-500/60 to-transparent" />}

      {/* Table pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{table.getSelectedRowModel().rows.length} мөр сонгогдсон.</p>

        <div className="flex items-center space-x-2">
          {/* <div className="flex items-center">{pagination.pageIndex + 1} / {Math.ceil(count / limit)} </div> */}

          <div className="flex items-center space-x-3 h-11">
            <div className="flex items-center h-full px-3 pl-1 bg-white border rounded-lg gap-x-2">
              <Select
                value={(currentPage + 1).toString()}
                onValueChange={(value) => {
                  const page = Number(value);
                  setPagination((old) => ({ ...old, pageIndex: page - 1 }));
                }}
              >
                <SelectTrigger size="sm" className="pl-2 pr-1 bg-gray-100 border-none rounded-sm shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <SelectItem key={page} value={page.toString()}>
                      {page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <span>/</span> */}
              <p>{Math.ceil(count / limit)}</p>
            </div>

            <div className="flex h-full gap-x-1">
              <Button
                variant="outline"
                className="h-full bg-white shadow-none aspect-square"
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
                className="h-full bg-white shadow-none aspect-square"
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
        </div>
      </div>
    </div>
  );
}
