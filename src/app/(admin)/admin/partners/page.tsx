"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { DataTable } from "@/client/components/ui/DataTable";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, Users } from "lucide-react";

const typeLabels: Record<string, string> = {
  NGO: "ONG",
  SYNAGOGUE: "Sinagoga",
  SCHOOL: "Escola",
  CHARITY: "Beneficente",
  OTHER: "Outra",
};

export default function AdminPartnersPage() {
  const utils = trpc.useUtils();
  const { data: partners, isLoading } = trpc.partner.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewRepresentativesId, setViewRepresentativesId] = useState<string | null>(null);
  const [showRepForm, setShowRepForm] = useState(false);
  const [repForm, setRepForm] = useState({ name: "", email: "", phone: "" });
  const [form, setForm] = useState({
    name: "", logoUrl: "", website: "", partnershipType: "NGO" as string, description: "",
  });

  const { data: viewingPartner } = trpc.partner.get.useQuery(
    { id: viewRepresentativesId! },
    { enabled: !!viewRepresentativesId }
  );

  const createMutation = trpc.partner.create.useMutation({
    onSuccess: () => { toast.success("Parceiro criado!"); utils.partner.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.partner.update.useMutation({
    onSuccess: () => { toast.success("Parceiro atualizado!"); utils.partner.list.invalidate(); if (viewRepresentativesId) utils.partner.get.invalidate({ id: viewRepresentativesId }); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.partner.delete.useMutation({
    onSuccess: () => { toast.success("Parceiro removido!"); utils.partner.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const addRepresentative = trpc.partner.addRepresentative.useMutation({
    onSuccess: () => { toast.success("Representante adicionado!"); if (viewRepresentativesId) utils.partner.get.invalidate({ id: viewRepresentativesId }); setShowRepForm(false); setRepForm({ name: "", email: "", phone: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const removeRepresentative = trpc.partner.removeRepresentative.useMutation({
    onSuccess: () => { toast.success("Representante removido!"); if (viewRepresentativesId) utils.partner.get.invalidate({ id: viewRepresentativesId }); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ name: "", logoUrl: "", website: "", partnershipType: "NGO", description: "" });
  }

  function handleEdit(p: any) {
    setForm({
      name: p.name, logoUrl: p.logoUrl ?? "", website: p.website ?? "",
      partnershipType: p.partnershipType ?? "NGO", description: p.description ?? "",
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name, logoUrl: form.logoUrl || undefined, website: form.website || undefined,
      partnershipType: form.partnershipType, description: form.description || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const deleteItem = partners?.find((p: any) => p.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instituicoes Parceiras"
        description={viewRepresentativesId ? `Representantes - ${viewingPartner?.name ?? ""}` : "Gerencie instituicoes parceiras"}
        action={
          viewRepresentativesId ? (
            <Button variant="outline" onClick={() => { setViewRepresentativesId(null); setShowRepForm(false); }}>Voltar</Button>
          ) : (
            <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
              <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Parceiro"}
            </Button>
          )
        }
      />

      {showForm && !viewRepresentativesId && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Novo"} Parceiro</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Parceria</Label>
                <select value={form.partnershipType} onChange={(e) => setForm({ ...form, partnershipType: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>URL do Logo</Label>
                <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descricao</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
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

      {viewRepresentativesId && showRepForm && (
        <Card>
          <CardHeader><CardTitle>Novo Representante</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); addRepresentative.mutate({ institutionId: viewRepresentativesId, name: repForm.name, email: repForm.email || undefined, phone: repForm.phone || undefined }); }} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={repForm.name} onChange={(e) => setRepForm({ ...repForm, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={repForm.email} onChange={(e) => setRepForm({ ...repForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={repForm.phone} onChange={(e) => setRepForm({ ...repForm, phone: e.target.value })} />
              </div>
              <div>
                <Button type="submit" disabled={addRepresentative.isPending}>{addRepresentative.isPending ? "Salvando..." : "Adicionar"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {viewRepresentativesId ? (
        <>
          <Button variant="outline" size="sm" onClick={() => setShowRepForm(true)}>
            <Plus className="mr-1 h-3 w-3" />Novo Representante
          </Button>
          {viewingPartner?.representatives?.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">Nenhum representante cadastrado</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {viewingPartner?.representatives?.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-sm text-gray-500">{r.email ?? "—"} {r.phone ? `- ${r.phone}` : ""}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeRepresentative.mutate({ id: r.id })}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <DataTable
          data={partners}
          isLoading={isLoading}
          emptyIcon={<Building2 className="h-10 w-10" />}
          emptyTitle="Nenhum parceiro encontrado"
          keyExtractor={(p: any) => p.id}
          columns={[
            { key: "name", header: "Nome", render: (p: any) => (
              <div className="flex items-center gap-2 font-medium">
                {p.logoUrl && <img src={p.logoUrl} alt="" className="h-6 w-6 rounded object-cover" />}
                {p.name}
              </div>
            )},
            { key: "partnershipType", header: "Tipo", render: (p: any) => <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{typeLabels[p.partnershipType] ?? p.partnershipType}</span> },
            { key: "website", header: "Website", render: (p: any) => p.website ? <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm truncate max-w-[200px] block">{p.website}</a> : <span className="text-gray-400">—</span> },
            { key: "representatives", header: "Representantes", render: (p: any) => <span className="text-gray-500">{p._count?.representatives ?? 0}</span> },
          ]}
          actions={(p: any) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => setViewRepresentativesId(p.id)}><Users className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover parceiro"
        description={`Tem certeza que deseja remover "${deleteItem?.name ?? ""}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
