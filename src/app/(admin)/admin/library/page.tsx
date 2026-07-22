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
import { Plus, Pencil, Trash2, BookOpen, FolderPlus, Users } from "lucide-react";

export default function AdminLibraryPage() {
  const utils = trpc.useUtils();
  const { data: items } = trpc.library.listAll.useQuery();
  const { data: categories } = trpc.library.categories.useQuery();
  const { data: authors } = trpc.library.authors.useQuery();
  const [tab, setTab] = useState<"items" | "categories" | "authors">("items");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const broadcast = trpc.notification.broadcast.useMutation();

  const [catForm, setCatForm] = useState({ name: "", slug: "" });
  const createCat = trpc.library.createCategory.useMutation({
    onSuccess: () => { toast.success("Categoria criada!"); utils.library.categories.invalidate(); setCatForm({ name: "", slug: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCat = trpc.library.deleteCategory.useMutation({
    onSuccess: () => { toast.success("Removida!"); utils.library.categories.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const [authorForm, setAuthorForm] = useState({ name: "", bio: "" });
  const createAuthor = trpc.library.createAuthor.useMutation({
    onSuccess: () => { toast.success("Autor criado!"); utils.library.authors.invalidate(); setAuthorForm({ name: "", bio: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteAuthor = trpc.library.deleteAuthor?.useMutation?.({
    onSuccess: () => { toast.success("Removido!"); utils.library.authors.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ title: "", description: "", materialType: "DOCUMENT" as const, externalUrl: "", authorId: "", categoryId: "", tagNames: "", thumbnailUrl: "" });
  const createItem = trpc.library.create.useMutation({
    onSuccess: () => { toast.success("Item criado!"); utils.library.listAll.invalidate(); setShowForm(false); resetForm(); broadcast.mutate({ type: "STUDY", title: "Novo item na biblioteca", message: "Um novo item foi adicionado à biblioteca digital.", link: "/library" }); },
    onError: (e) => toast.error(e.message),
  });
  const updateItem = trpc.library.update.useMutation({
    onSuccess: () => { toast.success("Item atualizado!"); utils.library.listAll.invalidate(); setEditingId(null); setShowForm(false); resetForm(); broadcast.mutate({ type: "STUDY", title: "Item da biblioteca atualizado", message: "Um item da biblioteca digital foi atualizado.", link: "/library" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteItem = trpc.library.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.library.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", description: "", materialType: "DOCUMENT", externalUrl: "", authorId: "", categoryId: "", tagNames: "", thumbnailUrl: "" });
  }

  async function handleEdit(item: { id: string }) {
    const full = await utils.library.getById.fetch({ id: item.id });
    if (!full) return;
    setForm({
      title: full.title,
      description: full.description ?? "",
      materialType: full.materialType as any,
      externalUrl: full.externalUrl ?? "",
      authorId: full.authorId ?? "",
      categoryId: full.categoryId ?? "",
      tagNames: full.tags?.map((t) => t.tag.name).join(", ") ?? "",
      thumbnailUrl: full.thumbnailUrl ?? "",
    });
    setEditingId(full.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = form.tagNames ? form.tagNames.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const payload = {
      title: form.title,
      description: form.description || undefined,
      materialType: form.materialType,
      externalUrl: form.externalUrl || undefined,
      authorId: form.authorId || undefined,
      categoryId: form.categoryId || undefined,
      thumbnailUrl: form.thumbnailUrl || undefined,
      tagNames: tags.length ? tags : undefined,
    };
    if (editingId) {
      updateItem.mutate({ id: editingId, ...payload });
    } else {
      createItem.mutate(payload);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Biblioteca Digital" description="Gerencie livros, documentos, vídeos e áudios" />

      <TabSelector
        tabs={[
          { key: "items", label: "Itens", icon: <BookOpen className="h-4 w-4" /> },
          { key: "categories", label: "Categorias", icon: <FolderPlus className="h-4 w-4" /> },
          { key: "authors", label: "Autores", icon: <Users className="h-4 w-4" /> },
        ]}
        active={tab}
        onChange={(k) => setTab(k as "items" | "categories" | "authors")}
      />

      {tab === "categories" && (
        <Card>
          <CardHeader><CardTitle>Categorias</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); createCat.mutate({ ...catForm, slug: catForm.slug || catForm.name.toLowerCase().replace(/[^a-z0-9-]/g, "-") }); }} className="flex gap-2">
              <Input placeholder="Nome" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="flex-1" />
              <Button type="submit" size="sm"><FolderPlus className="mr-1 h-4 w-4" />Adicionar</Button>
            </form>
            <div className="space-y-2">
              {categories?.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">{c.name} <span className="text-gray-400">({c._count.items})</span></span>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteCatId(c.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "authors" && (
        <Card>
          <CardHeader><CardTitle>Autores</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); createAuthor.mutate(authorForm); }} className="flex gap-2">
              <Input placeholder="Nome do autor" value={authorForm.name} onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })} className="flex-1" />
              <Button type="submit" size="sm"><Users className="mr-1 h-4 w-4" />Adicionar</Button>
            </form>
            <div className="space-y-2">
              {authors?.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">{a.name} <span className="text-gray-400">({a._count.items} itens)</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "items" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}><Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Item"}</Button>
          </div>
          {showForm && (
            <Card>
              <CardHeader><CardTitle>{editingId ? "Editar Item" : "Novo Item"}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Tipo *</Label>
                    <select value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value as any })} className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="DOCUMENT">Documento</option><option value="VIDEO">Vídeo</option><option value="AUDIO">Áudio</option><option value="LINK">Link</option>
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Autor</Label>
                    <select value={form.authorId} onChange={(e) => setForm({ ...form, authorId: e.target.value })} className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Sem autor</option>
                      {authors?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Categoria</Label>
                    <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Sem categoria</option>
                      {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>URL</Label><Input value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Tags (separadas por vírgula)</Label><Input value={form.tagNames} onChange={(e) => setForm({ ...form, tagNames: e.target.value })} placeholder="halachá, torá, estudo" /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="space-y-2 sm:col-span-2">
                    <ImageUpload value={form.thumbnailUrl} onChange={(url) => setForm({ ...form, thumbnailUrl: url })} label="Imagem de capa" />
                  </div>
                  <div className="sm:col-span-2"><Button type="submit" disabled={createItem.isPending || updateItem.isPending}>{createItem.isPending || updateItem.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar Item"}</Button></div>
                </form>
              </CardContent>
            </Card>
          )}

          <DataTable
            data={items}
            isLoading={false}
            emptyIcon={<BookOpen className="h-10 w-10" />}
            emptyTitle="Nenhum item"
            keyExtractor={(i: any) => i.id}
            columns={[
              { key: "title", header: "Título", render: (i: any) => (
                <div className="flex items-center gap-2">
                  {i.thumbnailUrl && <img src={i.thumbnailUrl as string} alt="" className="h-8 w-8 rounded object-cover" />}
                  <span className="font-medium">{i.title as string}</span>
                </div>
              )},
              { key: "materialType", header: "Tipo" },
              { key: "author", header: "Autor", render: (i: any) => (i.author as Record<string, unknown> | null)?.name as string ?? "—" },
              { key: "downloadCount", header: "Downloads" },
            ]}
            actions={(i: any) => (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(i as { id: string })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteItemId(i.id as string)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteItemId}
        onOpenChange={() => setDeleteItemId(null)}
        title="Remover item?"
        description="Esta ação não pode ser desfeita."
        variant="destructive"
        confirmLabel="Remover"
        onConfirm={() => { if (deleteItemId) deleteItem.mutate({ id: deleteItemId }); setDeleteItemId(null); }}
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
