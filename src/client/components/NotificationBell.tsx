"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Filter, CheckCheck } from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  GENERAL: "Geral",
  EVENT: "Evento",
  STUDY: "Estudo",
  COMMUNITY: "Comunidade",
  TZEDAKA: "Tzedaká",
  FORUM: "Fórum",
  RABBI: "Rabino",
  NEWS: "Notícia",
  PRAYER: "Oração",
};

const typeFilters = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "Não lidas" },
  ...Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const ref = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  const { data: unreadData } = trpc.notification.unreadCount.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );
  const { data, isLoading } = trpc.notification.list.useQuery(
    { page: 1, pageSize: 20 },
    { enabled: open }
  );

  const markReadMutation = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.unreadCount.invalidate();
      utils.notification.list.invalidate();
    },
  });

  const markAllReadMutation = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.unreadCount.invalidate();
      utils.notification.list.invalidate();
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = unreadData?.count ?? 0;

  const filteredNotifications = data?.notifications?.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.isRead;
    return n.type === activeFilter;
  }) ?? [];

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Notificações
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({unreadCount} não lida{unreadCount !== 1 ? "s" : ""})
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <div className="flex gap-1 border-b px-3 py-2 overflow-x-auto">
            {typeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  activeFilter === f.value
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                <Filter className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                Nenhuma notificação{activeFilter !== "all" ? " neste filtro" : ""}
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "cursor-pointer border-b px-4 py-3 transition-colors hover:bg-gray-50",
                    !notification.isRead && "bg-blue-50"
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      markReadMutation.mutate({
                        notificationId: notification.id,
                      });
                    }
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {!notification.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                          {typeLabels[notification.type] ?? notification.type}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
