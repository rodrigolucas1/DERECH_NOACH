"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/client/components/ImageUpload";
import { toast } from "sonner";
import { Plus, Trash2, Megaphone, Power, PowerOff, Pencil } from "lucide-react";

export default function AdminBannersPage() {
  const utils = trpc.useUtils();
  const { data: banners } = trpc.banner.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    onSuccess: () => utils.banner.list.invalidate(),
  });
  const deleteBanner = trpc.banner.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.banner.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "HOME_HERO", order: 0 });
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

  const positionLabels: Record<string, string> = {
    HOME_HERO: "Home Hero", HOME_SIDEBAR: "Home Sidebar", HOME_MID: "Home Meio",
    COMMUNITY_TOP: "Topo Comunidade", EVENT_TOP: "Topo Evento", GLOBAL: "Global",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500">Gerencie banners e propagandas</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Banner"}
        </Button>
      </div>

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

      <div className="rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-500">Banner</th><th className="px-4 py-3 font-medium text-gray-500">Posição</th><th className="px-4 py-3 font-medium text-gray-500">Ordem</th><th className="px-4 py-3 font-medium text-gray-500">Status</th><th className="px-4 py-3 font-medium text-gray-500">Ações</th></tr>
          </thead>
          <tbody className="divide-y">
            {!banners?.length ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500"><Megaphone className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-2">Nenhum banner.</p></td></tr>
            ) : banners.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={b.imageUrl} alt="" className="h-10 w-16 rounded object-cover" />
                    <span className="font-medium">{b.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{positionLabels[b.position] ?? b.position}</td>
                <td className="px-4 py-3 text-gray-500">{b.order}</td>
                <td className="px-4 py-3">{b.isActive ? <span className="text-green-600 text-xs font-medium">Ativo</span> : <span className="text-red-600 text-xs font-medium">Inativo</span>}</td>
                <td className="px-4 py-3 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleBanner.mutate({ id: b.id })}>
                    {b.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteBanner.mutate({ id: b.id }); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
