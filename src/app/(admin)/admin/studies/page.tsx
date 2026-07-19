"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen, FolderPlus } from "lucide-react";

export default function AdminStudiesPage() {
  const utils = trpc.useUtils();
  const { data: materials } = trpc.study.listAll.useQuery();
  const { data: categories } = trpc.study.categories.useQuery();
  const [tab, setTab] = useState<"materials" | "categories">("materials");

  const createCat = trpc.study.createCategory.useMutation({
    onSuccess: () => { toast.success("Categoria criada!"); utils.study.categories.invalidate(); setCatForm({ name: "", slug: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCat = trpc.study.deleteCategory.useMutation({
    onSuccess: () => { toast.success("Removida!"); utils.study.categories.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "" });
  const [form, setForm] = useState({ title: "", description: "", materialType: "DOCUMENT" as const, externalUrl: "", categoryId: "", isPublic: true });

  const createMat = trpc.study.create.useMutation({
    onSuccess: () => { toast.success("Material criado!"); utils.study.listAll.invalidate(); setShowForm(false); setForm({ title: "", description: "", materialType: "DOCUMENT", externalUrl: "", categoryId: "", isPublic: true }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMat = trpc.study.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.study.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estudos</h1>
          <p className="text-sm text-gray-500">Gerencie materiais de estudo e categorias</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "materials" ? "default" : "outline"} size="sm" onClick={() => setTab("materials")}>Materiais</Button>
        <Button variant={tab === "categories" ? "default" : "outline"} size="sm" onClick={() => setTab("categories")}>Categorias</Button>
      </div>

      {tab === "categories" && (
        <Card>
          <CardHeader><CardTitle>Categorias de Estudo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); createCat.mutate(catForm); }} className="flex gap-2">
              <Input placeholder="Nome" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className="flex-1" />
              <Button type="submit" size="sm" disabled={createCat.isPending}><FolderPlus className="mr-1 h-4 w-4" />Adicionar</Button>
            </form>
            <div className="space-y-2">
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded border p-3">
                  <span className="text-sm">{cat.name} <span className="text-gray-400">({cat._count.materials})</span></span>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteCat.mutate({ id: cat.id }); }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "materials" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Material"}</Button>
          </div>
          {showForm && (
            <Card>
              <CardHeader><CardTitle>Novo Material</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createMat.mutate({ title: form.title, description: form.description || undefined, materialType: form.materialType, externalUrl: form.externalUrl || undefined, categoryId: form.categoryId || undefined, isPublic: form.isPublic }); }} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Tipo</Label>
                    <select value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value as any })} className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="DOCUMENT">Documento</option><option value="VIDEO">Vídeo</option><option value="AUDIO">Áudio</option><option value="LINK">Link</option>
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Categoria</Label>
                    <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Sem categoria</option>
                      {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>URL Externa</Label><Input value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="sm:col-span-2"><Button type="submit" disabled={createMat.isPending}>{createMat.isPending ? "Criando..." : "Criar Material"}</Button></div>
                </form>
              </CardContent>
            </Card>
          )}
          <div className="rounded-lg border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Título</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Tipo</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Categoria</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!materials?.length ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500"><BookOpen className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-2">Nenhum material.</p></td></tr>
                ) : materials.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m.title}</td>
                    <td className="px-4 py-3 text-gray-500">{m.materialType}</td>
                    <td className="px-4 py-3 text-gray-500">{m.category?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteMat.mutate({ id: m.id }); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
