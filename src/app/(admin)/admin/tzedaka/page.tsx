"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/client/components/ImageUpload";
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

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", goalAmount: "", coverUrl: "", isPublic: true,
  });

  const createMutation = trpc.tzedaka.create.useMutation({
    onSuccess: () => { toast.success("Campanha criada!"); utils.tzedaka.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.tzedaka.update.useMutation({
    onSuccess: () => { toast.success("Campanha atualizada!"); utils.tzedaka.list.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.tzedaka.delete.useMutation({
    onSuccess: () => { toast.success("Campanha removida!"); utils.tzedaka.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const togglePublic = trpc.tzedaka.togglePublic.useMutation({
    onSuccess: () => { toast.success("Visibilidade alterada!"); utils.tzedaka.list.invalidate(); },
  });
  const updateStatus = trpc.tzedaka.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.tzedaka.list.invalidate(); },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tzedaká</h1>
          <p className="text-sm text-gray-500">Gerencie campanhas de Tzedaká e doações</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Campanha"}
        </Button>
      </div>

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

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Campanha</th>
                <th className="px-4 py-3 font-medium text-gray-500">Meta</th>
                <th className="px-4 py-3 font-medium text-gray-500">Arrecadado</th>
                <th className="px-4 py-3 font-medium text-gray-500">Doações</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : !campaigns?.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  <HandHeart className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2">Nenhuma campanha de Tzedaká.</p>
                </td></tr>
              ) : campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {c.coverUrl && <img src={c.coverUrl} alt="" className="h-8 w-8 rounded object-cover" />}
                      {c.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">R$ {c.goalAmount?.toString() ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">R$ {c.currentAmount.toString()}</td>
                  <td className="px-4 py-3 text-gray-500">{c._count.donations}</td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => updateStatus.mutate({ id: c.id, status: e.target.value as any })}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => togglePublic.mutate({ id: c.id })}>
                      <Power className={`h-4 w-4 ${c.isPublic ? "text-green-500" : "text-gray-400"}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteMutation.mutate({ id: c.id }); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
