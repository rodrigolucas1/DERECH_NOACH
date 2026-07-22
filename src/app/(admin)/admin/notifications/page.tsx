"use client";

import { useState } from "react";
import {
  Bell,
  Send,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { DataTable } from "@/client/components/ui/DataTable";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    userId: "",
    type: "GENERAL" as string,
    title: "",
    message: "",
    link: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: notifications, isLoading } =
    trpc.notification.listAll.useQuery();

  const { data: members } = trpc.admin.listUsers.useQuery();

  const createMutation = trpc.notification.create.useMutation({
    onSuccess: () => {
      toast.success("Notificação criada!");
      utils.notification.listAll.invalidate();
      setForm({ userId: "", type: "GENERAL", title: "", message: "", link: "" });
      setShowForm(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.notification.update.useMutation({
    onSuccess: () => {
      toast.success("Notificação atualizada!");
      utils.notification.listAll.invalidate();
      setForm({ userId: "", type: "GENERAL", title: "", message: "", link: "" });
      setEditingId(null);
      setShowForm(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.notification.delete.useMutation({
    onSuccess: () => {
      toast.success("Notificação removida!");
      utils.notification.listAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ userId: "", type: "GENERAL", title: "", message: "", link: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(n: { id: string; userId: string; type: string; title: string; message: string; link: string | null }) {
    setEditingId(n.id);
    setForm({ userId: n.userId, type: n.type, title: n.title, message: n.message, link: n.link ?? "" });
    setShowForm(true);
  }

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
      <PageHeader
        title="Notificações"
        description="Gerencie e envie notificações para os usuários"
        action={
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Send className="mr-2 h-4 w-4" />
            {showForm ? "Cancelar" : "Nova Notificação"}
          </Button>
        }
      />

      {showForm && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingId ? "Editar Notificação" : "Enviar Notificação"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (form.title && form.message) {
                if (editingId) {
                  updateMutation.mutate({
                    id: editingId,
                    type: form.type as any,
                    title: form.title,
                    message: form.message,
                    link: form.link || undefined,
                  });
                } else if (form.userId) {
                  createMutation.mutate({
                    userId: form.userId,
                    type: form.type as any,
                    title: form.title,
                    message: form.message,
                    link: form.link || undefined,
                  });
                }
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
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                <Send className="mr-2 h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending ? "Salvando..." : editingId ? "Atualizar" : "Enviar"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={(paginatedNotifications as any) ?? []}
        isLoading={isLoading}
        columns={[
          { key: "title", header: "Título", render: (item: any) => <span className="font-medium text-gray-900">{item.title}</span> },
          { key: "message", header: "Mensagem", className: "max-w-[200px]", render: (item: any) => <span className="truncate text-gray-500">{item.message}</span> },
          {
            key: "type",
            header: "Tipo",
            render: (item: any) => (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                <Bell className="mr-1 h-3 w-3" />
                {typeLabels[item.type] ?? item.type}
              </span>
            ),
          },
          { key: "user", header: "Usuário", render: (item: any) => <span className="text-gray-500">{item.user.name ?? item.user.email}</span> },
          {
            key: "isRead",
            header: "Lida",
            render: (item: any) =>
              item.isRead ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCheck className="h-4 w-4" /> Sim
                </span>
              ) : (
                <span className="text-gray-400">Não</span>
              ),
          },
          { key: "createdAt", header: "Data", render: (item: any) => <span className="text-gray-500">{new Date(item.createdAt).toLocaleString("pt-BR")}</span> },
        ]}
        emptyTitle="Nenhuma notificação encontrada."
        keyExtractor={(item: any) => item.id}
        actions={(item: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setDeleteId(item.id); setConfirmOpen(true); }}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remover notificação"
        description="Tem certeza que deseja remover esta notificação?"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); }}
        confirmLabel="Remover"
        variant="destructive"
      />
    </div>
  );
}
