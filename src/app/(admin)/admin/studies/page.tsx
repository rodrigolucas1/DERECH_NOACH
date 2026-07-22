"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { DataTable } from "@/client/components/ui/DataTable";
import { TabSelector } from "@/client/components/ui/TabSelector";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen, FolderPlus, Pencil, FolderOpen } from "lucide-react";
import { ImageUpload } from "@/client/components/ImageUpload";

const emptyForm = { title: "", description: "", materialType: "DOCUMENT" as const, externalUrl: "", categoryId: "", isPublic: true, thumbnailUrl: "" };

export default function AdminStudiesPage() {
  const utils = trpc.useUtils();
  const { data: materials } = trpc.study.listAll.useQuery();
  const { data: categories } = trpc.study.categories.useQuery();
  const [tab, setTab] = useState<"materials" | "categories">("materials");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "" });
  const [form, setForm] = useState(emptyForm);

  const broadcast = trpc.notification.broadcast.useMutation();

  const createCat = trpc.study.createCategory.useMutation({
    onSuccess: () => { toast.success("Categoria criada!"); utils.study.categories.invalidate(); setCatForm({ name: "", slug: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCat = trpc.study.deleteCategory.useMutation({
    onSuccess: () => { toast.success("Removida!"); utils.study.categories.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const createMat = trpc.study.create.useMutation({
    onSuccess: () => { toast.success("Material criado!"); utils.study.listAll.invalidate(); setShowForm(false); setForm(emptyForm); broadcast.mutate({ type: "STUDY", title: "Novo material de estudo", message: "Um novo material foi adicionado à biblioteca de estudos.", link: "/studies" }); },
    onError: (e) => toast.error(e.message),
  });

  const updateMat = trpc.study.update.useMutation({
    onSuccess: () => { toast.success("Material atualizado!"); utils.study.listAll.invalidate(); setShowForm(false); setEditingId(null); setForm(emptyForm); broadcast.mutate({ type: "STUDY", title: "Material de estudo atualizado", message: "Um material de estudo foi atualizado.", link: "/studies" }); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMat = trpc.study.delete.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.study.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function handleEdit(m: Record<string, unknown>) {
    setEditingId(m.id as string);
    setForm({
      title: (m.title as string) ?? "",
      description: (m.description as string) ?? "",
      materialType: (m.materialType as typeof emptyForm.materialType) ?? "DOCUMENT",
      externalUrl: (m.externalUrl as string) ?? "",
      categoryId: (m.categoryId as string) ?? "",
      isPublic: (m.isPublic as boolean) ?? true,
      thumbnailUrl: (m.thumbnailUrl as string) ?? "",
    });
    setShowForm(true);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { title: form.title, description: form.description || undefined, materialType: form.materialType, externalUrl: form.externalUrl || undefined, categoryId: form.categoryId || undefined, isPublic: form.isPublic, thumbnailUrl: form.thumbnailUrl || undefined };
    if (editingId) {
      updateMat.mutate({ id: editingId, ...payload });
    } else {
      createMat.mutate(payload);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Estudos" description="Gerencie materiais de estudo e categorias" />

      <TabSelector
        tabs={[
          { key: "materials", label: "Materiais", icon: <BookOpen className="h-4 w-4" /> },
          { key: "categories", label: "Categorias", icon: <FolderOpen className="h-4 w-4" /> },
        ]}
        active={tab}
        onChange={(k) => setTab(k as "materials" | "categories")}
      />

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
                  <Button variant="ghost" size="sm" onClick={() => setDeleteCatId(cat.id)}>
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
            <Button onClick={() => { if (showForm) { handleCancelEdit(); } else { setShowForm(true); } }}><Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Material"}</Button>
          </div>
          {showForm && (
            <Card>
              <CardHeader><CardTitle>{editingId ? "Editar Material" : "Novo Material"}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2"><Label>Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Tipo</Label>
                    <select value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value as typeof emptyForm.materialType })} className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
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
                  <div className="sm:col-span-2">
                    <ImageUpload value={form.thumbnailUrl || undefined} onChange={(url) => setForm({ ...form, thumbnailUrl: url })} label="Capa do Material" />
                  </div>
                  <div className="sm:col-span-2"><Button type="submit" disabled={createMat.isPending || updateMat.isPending}>{editingId ? (updateMat.isPending ? "Atualizando..." : "Atualizar Material") : (createMat.isPending ? "Criando..." : "Criar Material")}</Button></div>
                </form>
              </CardContent>
            </Card>
          )}
          <DataTable
            data={materials}
            isLoading={false}
            emptyIcon={<BookOpen className="h-10 w-10" />}
            emptyTitle="Nenhum material"
            keyExtractor={(m: any) => m.id as string}
            columns={[
              { key: "title", header: "Título", render: (m: any) => <span className="font-medium">{m.title as string}</span> },
              { key: "materialType", header: "Tipo", render: (m: any) => <span className="text-gray-500">{m.materialType as string}</span> },
              { key: "category", header: "Categoria", render: (m: any) => <span className="text-gray-500">{(m.category as Record<string, unknown> | null)?.name as string ?? "—"}</span> },
            ]}
            actions={(m: any) => (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(m.id as string)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </>
            )}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remover material?"
        description="Esta ação não pode ser desfeita."
        variant="destructive"
        confirmLabel="Remover"
        onConfirm={() => { if (deleteId) deleteMat.mutate({ id: deleteId }); setDeleteId(null); }}
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
