"use client";

import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 ">
        <Input placeholder="Хайх..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm bg-white" />
      </div>

      <div className="overflow-hidden rounded-md border">
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">{table.getSelectedRowModel().rows.length} мөр сонгогдсон.</p>

        <div className="space-x-2">
          <Button variant="outline" size="sm" className="bg-white" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Өмнөх
          </Button>
          <Button variant="outline" size="sm" className="bg-white" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Дараах
          </Button>
        </div>
      </div>
    </div>
  );
}
