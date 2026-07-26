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
import { Plus, Pencil, Trash2, Users, Eye, X, Check, ArrowLeft } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export default function AdminVolunteerPage() {
  const utils = trpc.useUtils();
  const { data: opportunities, isLoading } = trpc.volunteer.opportunityList.useQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: opportunityDetail } = trpc.volunteer.opportunityGet.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId }
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", location: "", maxVolunteers: "", startDate: "", endDate: "",
  });

  const createMutation = trpc.volunteer.opportunityCreate.useMutation({
    onSuccess: () => { toast.success("Oportunidade criada!"); utils.volunteer.opportunityList.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.volunteer.opportunityUpdate.useMutation({
    onSuccess: () => { toast.success("Oportunidade atualizada!"); utils.volunteer.opportunityList.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.volunteer.opportunityDelete.useMutation({
    onSuccess: () => { toast.success("Oportunidade removida!"); utils.volunteer.opportunityList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const updateSignupStatus = trpc.volunteer.updateSignupStatus.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); if (selectedId) utils.volunteer.opportunityGet.invalidate({ id: selectedId }); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ title: "", description: "", location: "", maxVolunteers: "", startDate: "", endDate: "" });
  }

  function handleEdit(o: any) {
    setForm({
      title: o.title, description: o.description ?? "", location: o.location ?? "",
      maxVolunteers: o.maxVolunteers?.toString() ?? "",
      startDate: o.startDate ? new Date(o.startDate).toISOString().slice(0, 10) : "",
      endDate: o.endDate ? new Date(o.endDate).toISOString().slice(0, 10) : "",
    });
    setEditingId(o.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title, description: form.description || undefined,
      location: form.location || undefined,
      maxVolunteers: form.maxVolunteers ? parseInt(form.maxVolunteers) : undefined,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const signups = opportunityDetail?.signups ?? [];
  const deleteItem = opportunities?.find((o: any) => o.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voluntariado"
        description={selectedId ? `Inscrições \u2014 ${opportunities?.find((o: any) => o.id === selectedId)?.title ?? ""}` : "Gerencie oportunidades de voluntariado"}
        action={
          selectedId ? (
            <Button variant="outline" onClick={() => setSelectedId(null)}>
              <ArrowLeft className="mr-2 h-4 w-4" />Voltar
            </Button>
          ) : (
            <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
              <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Oportunidade"}
            </Button>
          )
        }
      />

      {showForm && !selectedId && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Oportunidade</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Máximo de Voluntários</Label>
                <Input type="number" value={form.maxVolunteers} onChange={(e) => setForm({ ...form, maxVolunteers: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
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

      {selectedId ? (
        <>
          {signups.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">Nenhuma inscrição encontrada</p>
            </CardContent></Card>
          ) : (
            <DataTable
              data={signups}
              isLoading={false}
              emptyTitle="Nenhuma inscrição"
              keyExtractor={(s: any) => s.id}
              columns={[
                { key: "user", header: "Voluntário", render: (s: any) => <span className="font-medium">{s.user?.name ?? "\u2014"}</span> },
                { key: "status", header: "Status", render: (s: any) => (
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    s.status === "CONFIRMED" ? "bg-green-50 text-green-700" : s.status === "PENDING" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-600"
                  }`}>{statusLabels[s.status] ?? s.status}</span>
                )},
                { key: "signedUpAt", header: "Inscrição", render: (s: any) => <span className="text-gray-500">{new Date(s.signedUpAt).toLocaleDateString("pt-BR")}</span> },
              ]}
              actions={(s: any) => (
                <>
                  {s.status !== "CONFIRMED" && s.status !== "COMPLETED" && (
                    <Button variant="ghost" size="sm" onClick={() => updateSignupStatus.mutate({ signupId: s.id, status: "CONFIRMED" })}>
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                  {s.status !== "CANCELLED" && (
                    <Button variant="ghost" size="sm" onClick={() => updateSignupStatus.mutate({ signupId: s.id, status: "CANCELLED" })}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </>
              )}
            />
          )}
        </>
      ) : (
        <DataTable
          data={opportunities}
          isLoading={isLoading}
          emptyIcon={<Users className="h-10 w-10" />}
          emptyTitle="Nenhuma oportunidade de voluntariado"
          keyExtractor={(o: any) => o.id}
          columns={[
            { key: "title", header: "Título", render: (o: any) => <span className="font-medium">{o.title}</span> },
            { key: "location", header: "Local", render: (o: any) => <span className="text-gray-500">{o.location ?? "\u2014"}</span> },
            { key: "signups", header: "Inscritos", render: (o: any) => <span className="text-gray-500">{o._count?.signups ?? 0}{o.maxVolunteers ? ` / ${o.maxVolunteers}` : ""}</span> },
            { key: "isActive", header: "Status", render: (o: any) => o.isActive
              ? <span className="text-green-600 text-xs font-medium">Ativo</span>
              : <span className="text-gray-400 text-xs">Inativo</span>
            },
          ]}
          actions={(o: any) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(o.id)}><Eye className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(o)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(o.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover oportunidade"
        description={`Tem certeza que deseja remover "${deleteItem?.title ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
