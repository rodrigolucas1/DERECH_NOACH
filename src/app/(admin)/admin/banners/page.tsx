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
import { Plus, Trash2, Megaphone, Power, PowerOff, Pencil } from "lucide-react";

const positionLabels: Record<string, string> = {
  HOME_HERO: "Home Hero", HOME_SIDEBAR: "Home Sidebar", HOME_MID: "Home Meio",
  COMMUNITY_TOP: "Topo Comunidade", EVENT_TOP: "Topo Evento", GLOBAL: "Global",
};

export default function AdminBannersPage() {
  const utils = trpc.useUtils();
  const { data: banners } = trpc.banner.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "HOME_HERO" as const, order: 0 });

  const createBanner = trpc.banner.create.useMutation({
    onSuccess: () => { toast.success("Banner criado!"); utils.banner.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateBanner = trpc.banner.update.useMutation({
    onSuccess: () => { toast.success("Banner atualizado!"); utils.banner.list.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const toggleBanner = trpc.banner.toggleActive.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.banner.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteBanner = trpc.banner.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.banner.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "HOME_HERO", order: 0 });
    setEditingId(null);
  }

  function handleEdit(b: any) {
    setForm({ title: b.title, subtitle: b.subtitle ?? "", imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? "", position: b.position, order: b.order });
    setEditingId(b.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, linkUrl: form.linkUrl || undefined, subtitle: form.subtitle || undefined };
    if (editingId) {
      updateBanner.mutate({ id: editingId, ...payload });
    } else {
      createBanner.mutate(payload);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Gerencie banners e propagandas"
        action={
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Banner"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Novo"} Banner</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Subtítulo</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Imagem *</Label>
                <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
              </div>
              <div className="space-y-2"><Label>URL do Link</Label><Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." /></div>
              <div className="space-y-2"><Label>Posição</Label>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as any })} className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(positionLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
              <div className="sm:col-span-2"><Button type="submit" disabled={createBanner.isPending || updateBanner.isPending}>
                {createBanner.isPending || updateBanner.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar Banner"}
              </Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={banners}
        isLoading={false}
        emptyIcon={<Megaphone className="h-10 w-10" />}
        emptyTitle="Nenhum banner"
        keyExtractor={(b: any) => b.id}
        columns={[
          { key: "title", header: "Banner", render: (b: any) => (
            <div className="flex items-center gap-2">
              <img src={b.imageUrl as string} alt="" className="h-10 w-16 rounded object-cover" />
              <span className="font-medium">{b.title as string}</span>
            </div>
          )},
          { key: "position", header: "Posição", render: (b: any) => positionLabels[b.position as string] ?? (b.position as string) },
          { key: "order", header: "Ordem", render: (b: any) => String(b.order) },
          { key: "isActive", header: "Status", render: (b: any) => (
            b.isActive ? <span className="text-green-600 text-xs font-medium">Ativo</span> : <span className="text-red-600 text-xs font-medium">Inativo</span>
          )},
        ]}
        actions={(b: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => toggleBanner.mutate({ id: b.id as string })}>
              {b.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(b.id as string)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remover banner?"
        description="Esta ação não pode ser desfeita."
        variant="destructive"
        confirmLabel="Remover"
        onConfirm={() => { if (deleteId) deleteBanner.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
