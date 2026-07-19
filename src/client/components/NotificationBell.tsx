"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
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

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  const { data: unreadData } = trpc.notification.unreadCount.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );
  const { data, isLoading } = trpc.notification.list.useQuery(
    { page: 1, pageSize: 10 },
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
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                Marcar todas como lidas
              </Button>
            )}
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
            ) : !data?.notifications?.length ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              data.notifications.map((notification) => (
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
                        <span className="text-[10px] text-gray-400">
                          {typeLabels[notification.type] ?? notification.type}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString("pt-BR", {
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
