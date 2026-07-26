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
import { Plus, Pencil, Trash2, FileText, Power } from "lucide-react";

export default function AdminTzedakaReportsPage() {
  const utils = trpc.useUtils();
  const { data: reports, isLoading } = trpc.tzedakaReport.list.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", summary: "", periodStart: "", periodEnd: "",
    totalReceived: "", totalAllocated: "",
  });

  const createMutation = trpc.tzedakaReport.create.useMutation({
    onSuccess: () => { toast.success("Relatório criado!"); utils.tzedakaReport.list.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.tzedakaReport.update.useMutation({
    onSuccess: () => { toast.success("Relatório atualizado!"); utils.tzedakaReport.list.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.tzedakaReport.delete.useMutation({
    onSuccess: () => { toast.success("Relatório removido!"); utils.tzedakaReport.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const togglePublish = trpc.tzedakaReport.update.useMutation({
    onSuccess: () => { toast.success("Status de publicação alterado!"); utils.tzedakaReport.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", summary: "", periodStart: "", periodEnd: "", totalReceived: "", totalAllocated: "" });
  }

  function handleEdit(r: any) {
    setForm({
      title: r.title, summary: r.summary ?? "",
      periodStart: r.periodStart ? new Date(r.periodStart).toISOString().slice(0, 10) : "",
      periodEnd: r.periodEnd ? new Date(r.periodEnd).toISOString().slice(0, 10) : "",
      totalReceived: r.totalReceived?.toString() ?? "", totalAllocated: r.totalAllocated?.toString() ?? "",
    });
    setEditingId(r.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, title: form.title, summary: form.summary || undefined });
    } else {
      createMutation.mutate({
        title: form.title,
        summary: form.summary || undefined,
        periodStart: form.periodStart ? new Date(form.periodStart) : new Date(),
        periodEnd: form.periodEnd ? new Date(form.periodEnd) : new Date(),
        totalReceived: form.totalReceived ? parseFloat(form.totalReceived) : 0,
        totalAllocated: form.totalAllocated ? parseFloat(form.totalAllocated) : 0,
      });
    }
  }

  const deleteItem = reports?.find((r: any) => r.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios Financeiros"
        description="Gerencie os relatórios financeiros de Tzedaká"
        action={
          <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Relatório"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Novo"} Relatório</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Resumo</Label>
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              {!editingId && (
                <>
                  <div className="space-y-2">
                    <Label>Início do Período</Label>
                    <Input type="date" value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim do Período</Label>
                    <Input type="date" value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Recebido (R$)</Label>
                    <Input type="number" step="0.01" value={form.totalReceived} onChange={(e) => setForm({ ...form, totalReceived: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Alocado (R$)</Label>
                    <Input type="number" step="0.01" value={form.totalAllocated} onChange={(e) => setForm({ ...form, totalAllocated: e.target.value })} />
                  </div>
                </>
              )}
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
        data={reports}
        isLoading={isLoading}
        emptyIcon={<FileText className="h-10 w-10" />}
        emptyTitle="Nenhum relatório encontrado"
        keyExtractor={(r: any) => r.id}
        columns={[
          { key: "title", header: "Título", render: (r: any) => <span className="font-medium">{r.title}</span> },
          { key: "period", header: "Período", render: (r: any) => {
            const start = r.periodStart ? new Date(r.periodStart).toLocaleDateString("pt-BR") : "\u2014";
            const end = r.periodEnd ? new Date(r.periodEnd).toLocaleDateString("pt-BR") : "\u2014";
            return <span className="text-gray-500">{start} \u2014 {end}</span>;
          }},
          { key: "totalReceived", header: "Recebido", render: (r: any) => <span className="text-gray-500">R$ {Number(r.totalReceived ?? 0).toFixed(2)}</span> },
          { key: "totalAllocated", header: "Alocado", render: (r: any) => <span className="text-gray-500">R$ {Number(r.totalAllocated ?? 0).toFixed(2)}</span> },
          { key: "publishedAt", header: "Publicado", render: (r: any) => r.publishedAt
            ? <span className="text-green-600 text-xs font-medium">Sim \u2014 {new Date(r.publishedAt).toLocaleDateString("pt-BR")}</span>
            : <span className="text-gray-400 text-xs">Não</span>
          },
        ]}
        actions={(r: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => togglePublish.mutate({ id: r.id, publishedAt: r.publishedAt ? undefined : new Date() })}>
              <Power className={`h-4 w-4 ${r.publishedAt ? "text-green-500" : "text-gray-400"}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover relatório"
        description={`Tem certeza que deseja remover o relatório "${deleteItem?.title ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
