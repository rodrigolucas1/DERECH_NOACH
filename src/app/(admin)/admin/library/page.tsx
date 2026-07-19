"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen, FolderPlus, Users } from "lucide-react";

export default function AdminLibraryPage() {
  const utils = trpc.useUtils();
  const { data: items } = trpc.library.listAll.useQuery();
  const { data: categories } = trpc.library.categories.useQuery();
  const { data: authors } = trpc.library.authors.useQuery();
  const [tab, setTab] = useState<"items" | "categories" | "authors">("items");
  const [showForm, setShowForm] = useState(false);

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

  const [form, setForm] = useState({ title: "", description: "", materialType: "DOCUMENT" as const, externalUrl: "", authorId: "", categoryId: "", tagNames: "" });
  const createItem = trpc.library.create.useMutation({
    onSuccess: () => { toast.success("Item criado!"); utils.library.listAll.invalidate(); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteItem = trpc.library.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.library.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Biblioteca Digital</h1>
        <p className="text-sm text-gray-500">Gerencie livros, documentos, vídeos e áudios</p>
      </div>

      <div className="flex gap-2">
        {(["items", "categories", "authors"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
            {t === "items" ? "Itens" : t === "categories" ? "Categorias" : "Autores"}
          </Button>
        ))}
      </div>

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
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteCat.mutate({ id: c.id }); }}>
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
            <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Item"}</Button>
          </div>
          {showForm && (
            <Card>
              <CardHeader><CardTitle>Novo Item</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const tags = form.tagNames ? form.tagNames.split(",").map(t => t.trim()).filter(Boolean) : [];
                  createItem.mutate({
                    title: form.title, description: form.description || undefined,
                    materialType: form.materialType, externalUrl: form.externalUrl || undefined,
                    authorId: form.authorId || undefined, categoryId: form.categoryId || undefined,
                    tagNames: tags.length ? tags : undefined,
                  });
                }} className="grid gap-4 sm:grid-cols-2">
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
                  <div className="sm:col-span-2"><Button type="submit" disabled={createItem.isPending}>{createItem.isPending ? "Criando..." : "Criar Item"}</Button></div>
                </form>
              </CardContent>
            </Card>
          )}
          <div className="rounded-lg border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr><th className="px-4 py-3 font-medium text-gray-500">Título</th><th className="px-4 py-3 font-medium text-gray-500">Tipo</th><th className="px-4 py-3 font-medium text-gray-500">Autor</th><th className="px-4 py-3 font-medium text-gray-500">Downloads</th><th className="px-4 py-3 font-medium text-gray-500">Ações</th></tr>
              </thead>
              <tbody className="divide-y">
                {!items?.length ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500"><BookOpen className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-2">Nenhum item.</p></td></tr>
                ) : items.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{i.title}</td>
                    <td className="px-4 py-3 text-gray-500">{i.materialType}</td>
                    <td className="px-4 py-3 text-gray-500">{i.author?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{i.downloadCount}</td>
                    <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteItem.mutate({ id: i.id }); }}><Trash2 className="h-4 w-4 text-red-500" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
