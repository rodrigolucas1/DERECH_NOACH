"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/client/components/ImageUpload";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { DataTable } from "@/client/components/ui/DataTable";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, HandHeart, Power } from "lucide-react";

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  DRAFT: "Rascunho",
  CANCELLED: "Cancelada",
};

export default function AdminTzedakaPage() {
  const utils = trpc.useUtils();
  const { data: campaigns, isLoading } = trpc.tzedaka.list.useQuery();

  const broadcast = trpc.notification.broadcast.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", goalAmount: "", coverUrl: "", isPublic: true,
  });

  const createMutation = trpc.tzedaka.create.useMutation({
    onSuccess: () => { toast.success("Campanha criada!"); utils.tzedaka.list.invalidate(); setShowForm(false); resetForm(); broadcast.mutate({ type: "TZEDAKA", title: "Nova campanha de Tzedaká", message: "Uma nova campanha de Tzedaká foi criada.", link: "/tzedaka" }); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.tzedaka.update.useMutation({
    onSuccess: () => { toast.success("Campanha atualizada!"); utils.tzedaka.list.invalidate(); setEditingId(null); resetForm(); broadcast.mutate({ type: "TZEDAKA", title: "Campanha de Tzedaká atualizada", message: "Uma campanha de Tzedaká foi atualizada.", link: "/tzedaka" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.tzedaka.delete.useMutation({
    onSuccess: () => { toast.success("Campanha removida!"); utils.tzedaka.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const togglePublic = trpc.tzedaka.togglePublic.useMutation({
    onSuccess: () => { toast.success("Visibilidade alterada!"); utils.tzedaka.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatus = trpc.tzedaka.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.tzedaka.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", description: "", goalAmount: "", coverUrl: "", isPublic: true });
  }

  function handleEdit(c: any) {
    setForm({
      title: c.title, description: c.description ?? "",
      goalAmount: c.goalAmount?.toString() ?? "", coverUrl: c.coverUrl ?? "", isPublic: c.isPublic,
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description || undefined,
      goalAmount: form.goalAmount ? parseFloat(form.goalAmount) : undefined,
      coverUrl: form.coverUrl || undefined,
      isPublic: form.isPublic,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const deleteCampaign = campaigns?.find((c) => c.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tzedaká"
        description="Gerencie campanhas de Tzedaká e doações"
        action={
          <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Campanha"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Campanha</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Meta (R$)</Label>
                <Input type="number" step="0.01" value={form.goalAmount} onChange={(e) => setForm({ ...form, goalAmount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Imagem de capa</Label>
                <ImageUpload value={form.coverUrl} onChange={(url) => setForm({ ...form, coverUrl: url })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="h-4 w-4" />
                <Label>Pública</Label>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={campaigns}
        isLoading={isLoading}
        emptyIcon={<HandHeart className="h-10 w-10" />}
        emptyTitle="Nenhuma campanha de Tzedaká"
        keyExtractor={(c: any) => c.id}
        columns={[
          {
            key: "title",
            header: "Campanha",
            render: (c: any) => (
              <div className="flex items-center gap-2 font-medium">
                {c.coverUrl && <img src={c.coverUrl} alt="" className="h-8 w-8 rounded object-cover" />}
                {c.title}
              </div>
            ),
          },
          {
            key: "goalAmount",
            header: "Meta",
            render: (c: any) => <span className="text-gray-500">R$ {c.goalAmount?.toString() ?? "—"}</span>,
          },
          {
            key: "currentAmount",
            header: "Arrecadado",
            render: (c: any) => <span className="text-gray-500">R$ {c.currentAmount.toString()}</span>,
          },
          {
            key: "donations",
            header: "Doações",
            render: (c: any) => <span className="text-gray-500">{c._count.donations}</span>,
          },
          {
            key: "status",
            header: "Status",
            render: (c: any) => (
              <select
                value={c.status}
                onChange={(e) => updateStatus.mutate({ id: c.id, status: e.target.value as any })}
                className="rounded border px-2 py-1 text-xs"
              >
                {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ),
          },
        ]}
        actions={(c: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => togglePublic.mutate({ id: c.id })}>
              <Power className={`h-4 w-4 ${c.isPublic ? "text-green-500" : "text-gray-400"}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover campanha"
        description={`Tem certeza que deseja remover a campanha "${deleteCampaign?.title ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate({ id: deleteId });
          setDeleteId(null);
        }}
      />
    </div>
  );
}
