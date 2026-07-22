"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { DataTable } from "@/client/components/ui/DataTable";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";

export default function AdminCMSPage() {
  const utils = trpc.useUtils();
  const { data: pages } = trpc.cms.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", body: "", metaTitle: "", metaDescription: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    onError: (e) => toast.error(e.message),
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
      <PageHeader
        title="CMS - Páginas"
        description="Crie e gerencie páginas estáticas"
        action={
          <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Página"}
          </Button>
        }
      />

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

      <DataTable
        data={(pages as any) ?? []}
        isLoading={false}
        columns={[
          { key: "title", header: "Título" },
          { key: "slug", header: "Slug", render: (item: any) => <span className="text-gray-500">/{item.slug}</span> },
          {
            key: "isPublished",
            header: "Status",
            render: (item: any) =>
              item.isPublished ? (
                <span className="text-xs font-medium text-green-600">Publicado</span>
              ) : (
                <span className="text-xs font-medium text-yellow-600">Rascunho</span>
              ),
          },
        ]}
        emptyIcon={<FileText className="mx-auto h-10 w-10 text-gray-300" />}
        emptyTitle="Nenhuma página."
        keyExtractor={(item: any) => item.id}
        actions={(item: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => { setForm({ slug: item.slug, title: item.title, body: item.body ?? "", metaTitle: item.metaTitle ?? "", metaDescription: item.metaDescription ?? "" }); setEditingId(item.id); setShowForm(true); }}>
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => togglePublish.mutate({ id: item.id })}>
              {item.isPublished ? <EyeOff className="h-4 w-4 text-orange-500" /> : <Eye className="h-4 w-4 text-green-500" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setDeleteId(item.id); setConfirmOpen(true); }}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remover página"
        description="Tem certeza que deseja remover esta página?"
        onConfirm={() => { if (deleteId) deletePage.mutate({ id: deleteId }); }}
        confirmLabel="Remover"
        variant="destructive"
      />
    </div>
  );
}
