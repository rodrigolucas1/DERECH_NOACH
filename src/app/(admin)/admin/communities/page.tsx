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
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, Power, PowerOff } from "lucide-react";

export default function AdminCommunitiesPage() {
  const utils = trpc.useUtils();
  const { data: communities, isLoading } = trpc.community.listAll.useQuery();
  const broadcast = trpc.notification.broadcast.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", city: "", state: "MG", description: "",
    address: "", phone: "", email: "", logoUrl: "", coverImageUrl: "",
  });

  const createMutation = trpc.community.create.useMutation({
    onSuccess: () => { toast.success("Comunidade criada!"); utils.community.listAll.invalidate(); setShowForm(false); resetForm(); broadcast.mutate({ type: "COMMUNITY", title: "Nova comunidade criada", message: "Uma nova comunidade foi adicionada ao portal.", link: "/communities" }); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.community.update.useMutation({
    onSuccess: () => { toast.success("Comunidade atualizada!"); utils.community.listAll.invalidate(); setEditingId(null); resetForm(); broadcast.mutate({ type: "COMMUNITY", title: "Comunidade atualizada", message: "Uma comunidade foi atualizada no portal.", link: "/communities" }); },
    onError: (e) => toast.error(e.message),
  });
  const toggleMutation = trpc.community.toggleActive.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.community.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.community.delete.useMutation({
    onSuccess: () => { toast.success("Comunidade removida!"); utils.community.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ name: "", slug: "", city: "", state: "MG", description: "", address: "", phone: "", email: "", logoUrl: "", coverImageUrl: "" });
    setEditingId(null);
  }

  function handleEdit(c: any) {
    if (!c) return;
    setForm({
      name: c.name ?? "", slug: c.slug ?? "", city: c.city ?? "", state: c.state ?? "MG",
      description: c.description ?? "", address: c.address ?? "",
      phone: c.phone ?? "", email: c.email ?? "",
      logoUrl: c.logoUrl ?? "", coverImageUrl: c.coverImageUrl ?? "",
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, logoUrl: form.logoUrl || undefined, coverImageUrl: form.coverImageUrl || undefined };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comunidades"
        description="Gerencie as comunidades do tenant"
        action={
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Comunidade"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Comunidade</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} required />
              </div>
              <div className="space-y-2">
                <Label>Cidade *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>UF *</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} required maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <ImageUpload value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} />
              </div>
              <div className="space-y-2">
                <Label>Capa</Label>
                <ImageUpload value={form.coverImageUrl} onChange={(url) => setForm({ ...form, coverImageUrl: url })} label="Imagem de capa" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={communities}
        isLoading={isLoading}
        emptyIcon={<MapPin className="h-10 w-10" />}
        emptyTitle="Nenhuma comunidade cadastrada"
        keyExtractor={(c: any) => c.id}
        columns={[
          { key: "name", header: "Comunidade", render: (c: any) => (
            <div className="flex items-center gap-2">
              {c.logoUrl && <img src={c.logoUrl as string} alt="" className="h-8 w-8 rounded object-cover" />}
              <span className="font-medium">{c.name as string}</span>
            </div>
          )},
          { key: "city", header: "Cidade", render: (c: any) => c.city as string },
          { key: "state", header: "UF", render: (c: any) => c.state as string },
          { key: "members", header: "Membros", render: (c: any) => String(c._count?.members ?? 0) },
          { key: "isActive", header: "Status", render: (c: any) => (
            c.isActive ? <span className="text-green-600 text-xs font-medium">Ativo</span> : <span className="text-red-600 text-xs font-medium">Inativo</span>
          )},
        ]}
        actions={(c: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: c.id as string })}>
              {c.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id as string)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remover comunidade?"
        description="Esta ação não pode ser desfeita."
        variant="destructive"
        confirmLabel="Remover"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
