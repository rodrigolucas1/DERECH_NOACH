"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/client/components/ImageUpload";
import { toast } from "sonner";
import { Plus, Trash2, Newspaper, Eye, EyeOff, Tag } from "lucide-react";

export default function AdminNewsPage() {
  const utils = trpc.useUtils();
  const { data: articles } = trpc.news.listAll.useQuery();
  const { data: categories } = trpc.news.categories.useQuery();
  const [tab, setTab] = useState<"articles" | "categories">("articles");
  const [showForm, setShowForm] = useState(false);

  const [catForm, setCatForm] = useState({ name: "", slug: "", color: "#1a56db" });
  const createCat = trpc.news.createCategory.useMutation({
    onSuccess: () => { toast.success("Categoria criada!"); utils.news.categories.invalidate(); setCatForm({ name: "", slug: "", color: "#1a56db" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCat = trpc.news.deleteCategory.useMutation({
    onSuccess: () => { toast.success("Removida!"); utils.news.categories.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", body: "", categoryId: "", isFeatured: false, coverUrl: "", tagNames: "" });
  const createArticle = trpc.news.create.useMutation({
    onSuccess: () => { toast.success("Artigo criado!"); utils.news.listAll.invalidate(); setShowForm(false); setForm({ title: "", slug: "", excerpt: "", body: "", categoryId: "", isFeatured: false, coverUrl: "", tagNames: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const publishArticle = trpc.news.publish.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.news.listAll.invalidate(); },
  });
  const deleteArticle = trpc.news.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.news.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
          <p className="text-sm text-gray-500">Gerencie notícias e artigos</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "articles" ? "default" : "outline"} size="sm" onClick={() => setTab("articles")}>Artigos</Button>
        <Button variant={tab === "categories" ? "default" : "outline"} size="sm" onClick={() => setTab("categories")}>Categorias</Button>
      </div>

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
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteCat.mutate({ id: cat.id }); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "articles" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Artigo"}</Button>
          </div>
          {showForm && (
            <Card>
              <CardHeader><CardTitle>Novo Artigo</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const tags = form.tagNames ? form.tagNames.split(",").map(t => t.trim()).filter(Boolean) : [];
                  createArticle.mutate({
                    title: form.title, slug: form.slug, excerpt: form.excerpt || undefined,
                    body: form.body, categoryId: form.categoryId || undefined,
                    coverUrl: form.coverUrl || undefined, isFeatured: form.isFeatured, tagNames: tags.length ? tags : undefined,
                  });
                }} className="grid gap-4">
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
                  <Button type="submit" disabled={createArticle.isPending}>{createArticle.isPending ? "Criando..." : "Criar Artigo"}</Button>
                </form>
              </CardContent>
            </Card>
          )}
          <div className="rounded-lg border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Artigo</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Categoria</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!articles?.length ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500"><Newspaper className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-2">Nenhum artigo.</p></td></tr>
                ) : articles.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.title}</div>
                      {a.isFeatured && <span className="text-xs text-amber-600">Destaque</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.category?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {a.status === "PUBLISHED" ? <span className="text-green-600 text-xs font-medium">Publicado</span> : <span className="text-yellow-600 text-xs font-medium">Rascunho</span>}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => publishArticle.mutate({ id: a.id })}>
                        {a.status === "PUBLISHED" ? <EyeOff className="h-4 w-4 text-orange-500" /> : <Eye className="h-4 w-4 text-green-500" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteArticle.mutate({ id: a.id }); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </td>
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
