"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MessageSquare } from "lucide-react";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { DataTable } from "@/client/components/ui/DataTable";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";

export default function AdminForumPage() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.forum.categories.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const broadcast = trpc.notification.broadcast.useMutation();

  const createMutation = trpc.forum.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada!");
      utils.forum.categories.invalidate();
      resetForm();
      setShowForm(false);
      broadcast.mutate({ type: "FORUM", title: "Nova categoria no fórum", message: "Uma nova categoria foi criada no fórum.", link: "/forum" });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.forum.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      utils.forum.categories.invalidate();
      resetForm();
      setEditingId(null);
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.forum.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria removida!");
      utils.forum.categories.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  function resetForm() {
    setForm({ name: "", description: "" });
  }

  function handleEdit(cat: { id: string; name: string; description: string | null }) {
    setForm({ name: cat.name, description: cat.description ?? "" });
    setEditingId(cat.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: form.name,
        description: form.description || null,
      });
    } else {
      createMutation.mutate({
        name: form.name,
        description: form.description || null,
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fórum"
        description="Gerenciar categorias e tópicos do fórum"
        action={
          <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }} disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Categoria"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Categoria</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={isSubmitting} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting}>
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={(categories as any) ?? []}
        isLoading={isLoading}
        columns={[
          { key: "name", header: "Nome" },
          { key: "description", header: "Descrição", render: (item: any) => item.description ?? "—" },
          { key: "topics", header: "Tópicos", render: (item: any) => (item as any)._count?.topics ?? 0 },
        ]}
        emptyIcon={<MessageSquare className="mx-auto h-10 w-10 text-gray-300" />}
        emptyTitle="Nenhuma categoria cadastrada."
        keyExtractor={(item: any) => item.id}
        actions={(item: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} disabled={isSubmitting}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setDeleteId(item.id); setConfirmOpen(true); }} disabled={isSubmitting}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remover categoria"
        description="Tem certeza que deseja remover esta categoria?"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); }}
        confirmLabel="Remover"
        variant="destructive"
      />
    </div>
  );
}
