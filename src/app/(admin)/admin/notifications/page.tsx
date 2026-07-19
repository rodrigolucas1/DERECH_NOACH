"use client";

import { useState } from "react";
import {
  Bell,
  Send,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";

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

export default function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    type: "GENERAL" as string,
    title: "",
    message: "",
    link: "",
  });

  const utils = trpc.useUtils();

  const { data: notifications, isLoading } =
    trpc.notification.listAll.useQuery();

  const { data: members } = trpc.admin.listUsers.useQuery();

  const createMutation = trpc.notification.create.useMutation({
    onSuccess: () => {
      utils.notification.listAll.invalidate();
      setForm({ userId: "", type: "GENERAL", title: "", message: "", link: "" });
      setShowForm(false);
    },
  });

  const pageSize = 20;
  const paginatedNotifications = notifications?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const totalPages = notifications
    ? Math.ceil(notifications.length / pageSize)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-sm text-gray-500">
            Gerencie e envie notificações para os usuários
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Send className="mr-2 h-4 w-4" />
            {showForm ? "Cancelar" : "Nova Notificação"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Enviar Notificação
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (form.userId && form.title && form.message) {
                createMutation.mutate({
                  userId: form.userId,
                  type: form.type as any,
                  title: form.title,
                  message: form.message,
                  link: form.link || undefined,
                });
              }
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Usuário *
                </label>
                <select
                  required
                  value={form.userId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, userId: e.target.value }))
                  }
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-700"
                >
                  <option value="">Selecione um usuário</option>
                  {members?.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name ?? m.user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-700"
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Título *
              </label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Título da notificação"
                className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mensagem *
              </label>
              <textarea
                required
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Conteúdo da notificação"
                rows={3}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Link (opcional)
              </label>
              <input
                type="text"
                value={form.link}
                onChange={(e) =>
                  setForm((f) => ({ ...f, link: e.target.value }))
                }
                placeholder="/caminho/para/direcionar"
                className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Send className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Título
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Mensagem
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Usuário
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Lida
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : !paginatedNotifications?.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Nenhuma notificação encontrada.
                  </td>
                </tr>
              ) : (
                paginatedNotifications.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {n.title}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-gray-500 truncate">
                      {n.message}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <Bell className="mr-1 h-3 w-3" />
                        {typeLabels[n.type] ?? n.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {n.user.name ?? n.user.email}
                    </td>
                    <td className="px-4 py-3">
                      {n.isRead ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCheck className="h-4 w-4" /> Sim
                        </span>
                      ) : (
                        <span className="text-gray-400">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(n.createdAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages} — {notifications?.length ?? 0}{" "}
              registros
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
