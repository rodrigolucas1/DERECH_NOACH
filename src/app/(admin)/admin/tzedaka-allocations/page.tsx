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
import { Plus, Pencil, Trash2, Banknote } from "lucide-react";

export default function AdminTzedakaAllocationsPage() {
  const utils = trpc.useUtils();
  const { data: allocations, isLoading } = trpc.tzedakaAllocation.list.useQuery();
  const { data: campaigns } = trpc.tzedaka.list.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    campaignId: "", amount: "", description: "", recipient: "",
  });

  const createMutation = trpc.tzedakaAllocation.create.useMutation({
    onSuccess: () => { toast.success("Alocação criada!"); utils.tzedakaAllocation.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.tzedakaAllocation.update.useMutation({
    onSuccess: () => { toast.success("Alocação atualizada!"); utils.tzedakaAllocation.list.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.tzedakaAllocation.delete.useMutation({
    onSuccess: () => { toast.success("Alocação removida!"); utils.tzedakaAllocation.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ campaignId: "", amount: "", description: "", recipient: "" });
  }

  function handleEdit(a: any) {
    setForm({
      campaignId: a.campaignId ?? "", amount: a.amount?.toString() ?? "",
      description: a.description ?? "", recipient: a.recipient ?? "",
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      campaignId: form.campaignId || undefined,
      amount: parseFloat(form.amount),
      description: form.description,
      recipient: form.recipient || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const totalAllocated = allocations?.reduce((sum: number, a: any) => sum + (Number(a.amount) || 0), 0) ?? 0;
  const totalCount = allocations?.length ?? 0;

  const deleteItem = allocations?.find((a: any) => a.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alocações Financeiras"
        description="Gerencie as alocações de recursos das campanhas"
        action={
          <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Alocação"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Alocado</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">R$ {totalAllocated.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total de Alocações</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalCount}</p></CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Alocação</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Campanha</Label>
                <select value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Selecione...</option>
                  {campaigns?.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Destinatário</Label>
                <Input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
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
        data={allocations}
        isLoading={isLoading}
        emptyIcon={<Banknote className="h-10 w-10" />}
        emptyTitle="Nenhuma alocação encontrada"
        keyExtractor={(a: any) => a.id}
        columns={[
          { key: "campaign", header: "Campanha", render: (a: any) => <span className="font-medium">{a.campaign?.title ?? "\u2014"}</span> },
          { key: "amount", header: "Valor", render: (a: any) => <span className="text-gray-500">R$ {Number(a.amount).toFixed(2)}</span> },
          { key: "recipient", header: "Destinatário", render: (a: any) => <span className="text-gray-500">{a.recipient ?? "\u2014"}</span> },
          { key: "description", header: "Descrição", render: (a: any) => <span className="truncate text-gray-500 max-w-[200px] block">{a.description ?? "\u2014"}</span> },
          { key: "allocatedAt", header: "Data", render: (a: any) => <span className="text-gray-500">{new Date(a.allocatedAt).toLocaleDateString("pt-BR")}</span> },
        ]}
        actions={(a: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(a)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(a.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover alocação"
        description={`Tem certeza que deseja remover esta alocação de R$ ${deleteItem ? Number(deleteItem.amount).toFixed(2) : "0"}? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
