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
import { Plus, Pencil, Trash2, Radio, PowerOff } from "lucide-react";

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  LIVE: "Ao Vivo",
  ENDED: "Encerrada",
};

const platformLabels: Record<string, string> = {
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
  ZOOM: "Zoom",
  GOOGLE_MEET: "Google Meet",
  MS_TEAMS: "MS Teams",
  OTHER: "Outro",
};

export default function AdminLivestreamPage() {
  const utils = trpc.useUtils();
  const { data: streams, isLoading } = trpc.livestream.listAll.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [form, setForm] = useState({
    eventId: "", platform: "YOUTUBE" as string, streamUrl: "", chatUrl: "", scheduledAt: "",
  });

  const createMutation = trpc.livestream.create.useMutation({
    onSuccess: () => { toast.success("Transmissão criada!"); utils.livestream.listAll.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.livestream.update.useMutation({
    onSuccess: () => { toast.success("Transmissão atualizada!"); utils.livestream.listAll.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.livestream.delete.useMutation({
    onSuccess: () => { toast.success("Transmissão removida!"); utils.livestream.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const goLive = trpc.livestream.goLive.useMutation({
    onSuccess: () => { toast.success("Transmissão iniciada!"); utils.livestream.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const endLive = trpc.livestream.endLive.useMutation({
    onSuccess: () => { toast.success("Transmissão encerrada!"); utils.livestream.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ eventId: "", platform: "YOUTUBE", streamUrl: "", chatUrl: "", scheduledAt: "" });
  }

  function handleEdit(s: any) {
    setForm({
      eventId: s.eventId ?? "",
      platform: s.platform ?? "YOUTUBE",
      streamUrl: s.streamUrl ?? "",
      chatUrl: s.chatUrl ?? "",
      scheduledAt: s.scheduledAt ? new Date(s.scheduledAt).toISOString().slice(0, 16) : "",
    });
    setEditingId(s.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      platform: form.platform as any,
      streamUrl: form.streamUrl,
      eventId: form.eventId || undefined,
      chatUrl: form.chatUrl || undefined,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filtered = streams?.filter((s: any) => {
    if (filter === "ALL") return true;
    return s.status === filter;
  });

  const deleteItem = streams?.find((s: any) => s.id === deleteId);

  const statusBadge = (status: string) => {
    if (status === "LIVE") return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700"><Radio className="h-3 w-3 animate-pulse" />Ao Vivo</span>;
    if (status === "SCHEDULED") return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">Agendada</span>;
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">Encerrada</span>;
  };

  const platformBadge = (platform: string) => (
    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
      {platformLabels[platform] ?? platform}
    </span>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transmissões ao Vivo"
        description="Gerencie transmissões ao vivo"
        action={
          <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Transmissão"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Transmissão</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Plataforma *</Label>
                <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(platformLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Data/Hora Agendada</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>URL da Transmissão *</Label>
                <Input value={form.streamUrl} onChange={(e) => setForm({ ...form, streamUrl: e.target.value })} placeholder="https://..." required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>URL do Chat</Label>
                <Input value={form.chatUrl} onChange={(e) => setForm({ ...form, chatUrl: e.target.value })} placeholder="https://..." />
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

      <div className="flex gap-2">
        {(["ALL", "SCHEDULED", "LIVE", "ENDED"] as string[]).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "ALL" ? "Todas" : statusLabels[f]}
          </Button>
        ))}
      </div>

      <DataTable
        data={filtered}
        isLoading={isLoading}
        emptyIcon={<Radio className="h-10 w-10" />}
        emptyTitle="Nenhuma transmissão encontrada"
        keyExtractor={(s: any) => s.id}
        columns={[
          { key: "event", header: "Evento", render: (s: any) => <span className="font-medium">{s.event?.title ?? "—"}</span> },
          { key: "platform", header: "Plataforma", render: (s: any) => platformBadge(s.platform) },
          { key: "status", header: "Status", render: (s: any) => statusBadge(s.status) },
          { key: "scheduledAt", header: "Agendada", render: (s: any) => s.scheduledAt
            ? <span className="text-gray-500">{new Date(s.scheduledAt).toLocaleString("pt-BR")}</span>
            : <span className="text-gray-400">—</span>
          },
          { key: "viewerCount", header: "Espectadores", render: (s: any) => <span className="text-gray-500">{s.viewerCount ?? 0}</span> },
        ]}
        actions={(s: any) => (
          <>
            {s.status === "SCHEDULED" && (
              <Button variant="ghost" size="sm" onClick={() => goLive.mutate({ id: s.id })}>
                <Radio className="h-4 w-4 text-red-500" />
              </Button>
            )}
            {s.status === "LIVE" && (
              <Button variant="ghost" size="sm" onClick={() => endLive.mutate({ id: s.id })}>
                <PowerOff className="h-4 w-4 text-orange-500" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(s.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover transmissão"
        description={`Tem certeza que deseja remover esta transmissão? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
