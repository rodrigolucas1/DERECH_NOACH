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
import { TabSelector } from "@/client/components/ui/TabSelector";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Trash2, Newspaper, Eye, EyeOff, Tag, Pencil, FolderOpen } from "lucide-react";

const emptyForm = { title: "", slug: "", excerpt: "", body: "", categoryId: "", isFeatured: false, coverUrl: "", tagNames: "" };

export default function AdminNewsPage() {
  const utils = trpc.useUtils();
  const { data: articles } = trpc.news.listAll.useQuery();
  const { data: categories } = trpc.news.categories.useQuery();
  const [tab, setTab] = useState<"articles" | "categories">("articles");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const broadcast = trpc.notification.broadcast.useMutation();

  const [catForm, setCatForm] = useState({ name: "", slug: "", color: "#1a56db" });
  const createCat = trpc.news.createCategory.useMutation({
    onSuccess: () => { toast.success("Categoria criada!"); utils.news.categories.invalidate(); setCatForm({ name: "", slug: "", color: "#1a56db" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCat = trpc.news.deleteCategory.useMutation({
    onSuccess: () => { toast.success("Removida!"); utils.news.categories.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState(emptyForm);
  const createArticle = trpc.news.create.useMutation({
    onSuccess: () => { toast.success("Artigo criado!"); utils.news.listAll.invalidate(); resetForm(); broadcast.mutate({ type: "NEWS", title: "Nova notícia publicada", message: "Um novo artigo foi publicado no portal.", link: "/news" }); },
    onError: (e) => toast.error(e.message),
  });
  const updateArticle = trpc.news.update.useMutation({
    onSuccess: () => { toast.success("Artigo atualizado!"); utils.news.listAll.invalidate(); resetForm(); broadcast.mutate({ type: "NEWS", title: "Notícia atualizada", message: "Um artigo foi atualizado no portal.", link: "/news" }); },
    onError: (e) => toast.error(e.message),
  });
  const publishArticle = trpc.news.publish.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.news.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteArticle = trpc.news.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.news.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(article: { id: string }) {
    setEditingId(article.id);
    setShowForm(true);
    utils.news.getById.fetch({ id: article.id }).then((data) => {
      setForm({
        title: data.title, slug: data.slug, excerpt: data.excerpt ?? "",
        body: data.body, categoryId: data.categoryId ?? "",
        isFeatured: data.isFeatured, coverUrl: data.coverUrl ?? "",
        tagNames: data.tagNames.join(", "),
      });
    }).catch((err: Error) => toast.error(err.message));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = form.tagNames ? form.tagNames.split(",").map(t => t.trim()).filter(Boolean) : [];
    const payload = {
      title: form.title, slug: form.slug, excerpt: form.excerpt || undefined,
      body: form.body, categoryId: form.categoryId || undefined,
      coverUrl: form.coverUrl || undefined, isFeatured: form.isFeatured, tagNames: tags.length ? tags : undefined,
    };
    if (editingId) {
      updateArticle.mutate({ id: editingId, ...payload });
    } else {
      createArticle.mutate(payload);
    }
  }

  const isSubmitting = createArticle.isPending || updateArticle.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title="Notícias" description="Gerencie notícias e artigos" />

      <TabSelector
        tabs={[
          { key: "articles", label: "Artigos", icon: <Newspaper className="h-4 w-4" /> },
          { key: "categories", label: "Categorias", icon: <FolderOpen className="h-4 w-4" /> },
        ]}
        active={tab}
        onChange={(k) => setTab(k as "articles" | "categories")}
      />

      {tab === "categories" && (
        <Card>
          <CardHeader><CardTitle>Categorias</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); createCat.mutate(catForm); }} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1"><Label>Nome</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div>
              <div className="w-16 space-y-1"><Label>Cor</Label><Input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="h-8 p-1" /></div>
              <Button type="submit" size="sm"><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
            </form>
            <div className="space-y-2">
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded" style={{ backgroundColor: cat.color ?? "#ccc" }} />
                    <span className="text-sm">{cat.name} <span className="text-gray-400">({cat._count.articles})</span></span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteCatId(cat.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "articles" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => showForm ? resetForm() : setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Artigo"}
            </Button>
          </div>
          {showForm && (
            <Card>
              <CardHeader><CardTitle>{editingId ? "Editar Artigo" : "Novo Artigo"}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} required /></div>
                    <div className="space-y-2"><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-2"><Label>Resumo</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Conteúdo *</Label><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Categoria</Label>
                      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Sem categoria</option>
                        {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="h-4 w-4" />
                      <Label htmlFor="featured">Destaque</Label>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tags (separadas por vírgula)</Label>
                      <Input value={form.tagNames} onChange={(e) => setForm({ ...form, tagNames: e.target.value })} placeholder="shabat, torá, noachida" />
                    </div>
                    <div className="space-y-2">
                      <Label>Imagem de capa</Label>
                      <ImageUpload value={form.coverUrl} onChange={(url) => setForm({ ...form, coverUrl: url })} />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Artigo"}</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <DataTable
            data={articles}
            isLoading={false}
            emptyIcon={<Newspaper className="h-10 w-10" />}
            emptyTitle="Nenhum artigo"
            keyExtractor={(a: any) => a.id}
            columns={[
              { key: "title", header: "Artigo", render: (a: any) => (
                <div>
                  <div className="font-medium">{a.title as string}</div>
                  {a.isFeatured && <span className="text-xs text-amber-600">Destaque</span>}
                </div>
              )},
              { key: "category", header: "Categoria", render: (a: any) => (a.category as Record<string, unknown> | null)?.name as string ?? "—" },
              { key: "status", header: "Status", render: (a: any) => (
                a.status === "PUBLISHED" ? <span className="text-green-600 text-xs font-medium">Publicado</span> : <span className="text-yellow-600 text-xs font-medium">Rascunho</span>
              )},
            ]}
            actions={(a: any) => (
              <>
                <Button variant="ghost" size="sm" onClick={() => publishArticle.mutate({ id: a.id as string })}>
                  {a.status === "PUBLISHED" ? <EyeOff className="h-4 w-4 text-orange-500" /> : <Eye className="h-4 w-4 text-green-500" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(a as { id: string })}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(a.id as string)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </>
            )}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remover artigo?"
        description="Esta ação não pode ser desfeita."
        variant="destructive"
        confirmLabel="Remover"
        onConfirm={() => { if (deleteId) deleteArticle.mutate({ id: deleteId }); setDeleteId(null); }}
      />
      <ConfirmDialog
        open={!!deleteCatId}
        onOpenChange={() => setDeleteCatId(null)}
        title="Remover categoria?"
        description="Esta ação não pode ser desfeita."
        variant="destructive"
        confirmLabel="Remover"
        onConfirm={() => { if (deleteCatId) deleteCat.mutate({ id: deleteCatId }); setDeleteCatId(null); }}
      />
    </div>
  );
}
