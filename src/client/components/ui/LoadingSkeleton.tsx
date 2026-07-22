"use client";

interface LoadingSkeletonProps {
  rows?: number;
  cols?: number;
  variant?: "table" | "card" | "list" | "stats";
  className?: string;
}

export function LoadingSkeleton({ rows = 5, cols = 4, variant = "table", className }: LoadingSkeletonProps) {
  if (variant === "stats") {
    return (
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className ?? ""}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`space-y-4 ${className ?? ""}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={`space-y-2 ${className ?? ""}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border bg-white shadow-sm ${className ?? ""}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 animate-pulse rounded bg-gray-200" style={{ width: `${60 + Math.random() * 40}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
