"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Eye, EyeOff } from "lucide-react";

export default function AdminCMSPage() {
  const utils = trpc.useUtils();
  const { data: pages } = trpc.cms.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", body: "", metaTitle: "", metaDescription: "" });

  const createPage = trpc.cms.create.useMutation({
    onSuccess: () => { toast.success("Página criada!"); utils.cms.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updatePage = trpc.cms.update.useMutation({
    onSuccess: () => { toast.success("Página atualizada!"); utils.cms.list.invalidate(); setShowForm(false); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const togglePublish = trpc.cms.togglePublish.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.cms.list.invalidate(); },
  });
  const deletePage = trpc.cms.delete.useMutation({
    onSuccess: () => { toast.success("Removida!"); utils.cms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() { setForm({ slug: "", title: "", body: "", metaTitle: "", metaDescription: "" }); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updatePage.mutate({ id: editingId, ...form, body: form.body, metaTitle: form.metaTitle || undefined, metaDescription: form.metaDescription || undefined });
    } else {
      createPage.mutate({ ...form, metaTitle: form.metaTitle || undefined, metaDescription: form.metaDescription || undefined });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS - Páginas</h1>
          <p className="text-sm text-gray-500">Crie e gerencie páginas estáticas</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Página"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Página</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} required /></div>
                <div className="space-y-2"><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
              </div>
              <div className="space-y-2"><Label>Conteúdo (HTML) *</Label><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono" required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Meta Título</Label><Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
                <div className="space-y-2"><Label>Meta Descrição</Label><Input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></div>
              </div>
              <Button type="submit" disabled={createPage.isPending || updatePage.isPending}>{editingId ? "Atualizar" : "Criar"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr><th className="px-4 py-3 font-medium text-gray-500">Título</th><th className="px-4 py-3 font-medium text-gray-500">Slug</th><th className="px-4 py-3 font-medium text-gray-500">Status</th><th className="px-4 py-3 font-medium text-gray-500">Ações</th></tr>
          </thead>
          <tbody className="divide-y">
            {!pages?.length ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500"><FileText className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-2">Nenhuma página.</p></td></tr>
            ) : pages.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">/{p.slug}</td>
                <td className="px-4 py-3">{p.isPublished ? <span className="text-green-600 text-xs font-medium">Publicado</span> : <span className="text-yellow-600 text-xs font-medium">Rascunho</span>}</td>
                <td className="px-4 py-3 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setForm({ slug: p.slug, title: p.title, body: "", metaTitle: "", metaDescription: "" }); setEditingId(p.id); setShowForm(true); }}><FileText className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => togglePublish.mutate({ id: p.id })}>{p.isPublished ? <EyeOff className="h-4 w-4 text-orange-500" /> : <Eye className="h-4 w-4 text-green-500" />}</Button>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deletePage.mutate({ id: p.id }); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
