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
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  isLoading,
  columns,
  emptyIcon,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        {emptyIcon && <div className="mx-auto text-gray-300">{emptyIcon}</div>}
        <p className="mt-4 font-medium text-gray-900">{emptyTitle}</p>
        {emptyDescription && (
          <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, idx) => (
            <tr
              key={idx}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
