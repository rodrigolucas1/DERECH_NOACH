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
import { ImageUpload } from "@/client/components/ImageUpload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar, Power, PowerOff } from "lucide-react";

export default function AdminEventsPage() {
  const utils = trpc.useUtils();
  const { data: eventsData, isLoading } = trpc.event.listAll.useQuery();
  const events = eventsData?.items;
  const { data: communitiesData } = trpc.community.listAll.useQuery();
  const communities = communitiesData?.items;

  const broadcast = trpc.notification.broadcast.useMutation();

  const createMutation = trpc.event.create.useMutation({
    onSuccess: () => { toast.success("Evento criado!"); utils.event.listAll.invalidate(); setShowForm(false); resetForm(); broadcast.mutate({ type: "EVENT", title: "Novo evento disponível", message: "Um novo evento foi criado no portal.", link: "/events" }); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.event.update.useMutation({
    onSuccess: () => { toast.success("Evento atualizado!"); utils.event.listAll.invalidate(); setEditingId(null); resetForm(); broadcast.mutate({ type: "EVENT", title: "Evento atualizado", message: "Um evento foi atualizado no portal.", link: "/events" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.event.delete.useMutation({
    onSuccess: () => { toast.success("Evento removido!"); utils.event.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const toggleMutation = trpc.event.toggleActive.useMutation({
    onSuccess: () => utils.event.listAll.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", dateTime: "", location: "", eventType: "IN_PERSON" as const,
    communityId: "", meetingUrl: "", imageUrl: "",
  });

  function resetForm() {
    setForm({ title: "", description: "", dateTime: "", location: "", eventType: "IN_PERSON", communityId: "", meetingUrl: "", imageUrl: "" });
  }

  function handleEdit(e: any) {
    setForm({
      title: e.title, description: e.description ?? "", dateTime: e.dateTime ? new Date(e.dateTime).toISOString().slice(0, 16) : "",
      location: e.location ?? "", eventType: e.eventType, communityId: e.communityId ?? "", meetingUrl: e.meetingUrl ?? "", imageUrl: e.imageUrl ?? "",
    });
    setEditingId(e.id);
    setShowForm(true);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = {
      title: form.title, description: form.description || undefined,
      dateTime: new Date(form.dateTime).toISOString(), location: form.location || undefined,
      eventType: form.eventType, communityId: form.communityId || undefined,
      meetingUrl: form.meetingUrl || undefined, imageUrl: form.imageUrl || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const eventTypeLabel = (t: string) => t === "IN_PERSON" ? "Presencial" : t === "ONLINE" ? "Online" : "Híbrido";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        description="Gerencie os eventos da plataforma"
        action={
          <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Evento"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Novo"} Evento</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Data/Hora *</Label>
                <Input type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value as any })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="IN_PERSON">Presencial</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Comunidade</Label>
                <select value={form.communityId} onChange={(e) => setForm({ ...form, communityId: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Sem comunidade</option>
                  {communities?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Link de reunião</Label>
                <Input value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Imagem do evento</Label>
                <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Imagem do evento" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar Evento"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={events}
        isLoading={isLoading}
        emptyIcon={<Calendar className="h-10 w-10" />}
        emptyTitle="Nenhum evento cadastrado"
        keyExtractor={(e: any) => e.id}
        columns={[
          { key: "title", header: "Título" },
          { key: "dateTime", header: "Data", render: (e: any) => new Date(e.dateTime).toLocaleDateString("pt-BR") },
          { key: "eventType", header: "Tipo", render: (e: any) => eventTypeLabel(e.eventType as string) },
          { key: "community", header: "Comunidade", render: (e: any) => (e.community as Record<string, unknown> | null)?.name as string ?? "—" },
          { key: "isActive", header: "Status", render: (e: any) => (
            e.isActive ? <span className="text-green-600 text-xs font-medium">Ativo</span> : <span className="text-red-600 text-xs font-medium">Inativo</span>
          )},
        ]}
        actions={(e: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(e)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: e.id as string })}>
              {e.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(e.id as string)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remover evento?"
        description="Esta ação não pode ser desfeita."
        variant="destructive"
        confirmLabel="Remover"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
