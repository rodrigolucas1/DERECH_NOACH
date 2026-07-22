"use client";

import React from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[] | undefined;
  isLoading: boolean;
  columns: Column<T>[];
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  keyExtractor?: (item: T) => string;
  loadingRows?: number;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  isLoading,
  columns,
  emptyIcon,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyAction,
  onRowClick,
  actions,
  keyExtractor,
  loadingRows = 5,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                      <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-lg border bg-white shadow-sm p-12 text-center">
        {emptyIcon && <div className="mx-auto text-gray-300">{emptyIcon}</div>}
        <h3 className="mt-4 text-lg font-medium text-gray-900">{emptyTitle}</h3>
        {emptyDescription && (
          <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
        )}
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-right">Ações</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, idx) => (
            <tr
              key={keyExtractor ? keyExtractor(item) : idx}
              className={`transition-colors hover:bg-gray-50 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.render
                    ? col.render(item)
                    : String(item[col.key] ?? "")}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {actions(item)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
