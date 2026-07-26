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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Mic, Link as LinkIcon, X } from "lucide-react";

export default function AdminSpeakersPage() {
  const utils = trpc.useUtils();
  const { data: speakers, isLoading } = trpc.speaker.listAll.useQuery();
  const { data: events } = trpc.event.listAll.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", title: "", bio: "", photoUrl: "",
  });
  const [linkEventId, setLinkEventId] = useState<string | null>(null);

  const createMutation = trpc.speaker.create.useMutation({
    onSuccess: () => { toast.success("Palestrante criado!"); utils.speaker.listAll.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.speaker.update.useMutation({
    onSuccess: () => { toast.success("Palestrante atualizado!"); utils.speaker.listAll.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.speaker.delete.useMutation({
    onSuccess: () => { toast.success("Palestrante removido!"); utils.speaker.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const linkEvent = trpc.speaker.linkEvent.useMutation({
    onSuccess: () => { toast.success("Evento vinculado!"); utils.speaker.listAll.invalidate(); setLinkEventId(null); },
    onError: (e) => toast.error(e.message),
  });
  const unlinkEvent = trpc.speaker.unlinkEvent.useMutation({
    onSuccess: () => { toast.success("Evento desvinculado!"); utils.speaker.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ name: "", title: "", bio: "", photoUrl: "" });
  }

  function handleEdit(s: any) {
    setForm({
      name: s.name, title: s.title ?? "", bio: s.bio ?? "",
      photoUrl: s.photoUrl ?? "",
    });
    setEditingId(s.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name, title: form.title || undefined, bio: form.bio || undefined,
      photoUrl: form.photoUrl || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const deleteItem = speakers?.find((s: any) => s.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Palestrantes"
        description="Gerencie palestrantes e suas especialidades"
        action={
          <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
            <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Palestrante"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Novo"} Palestrante</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>T\u00edtulo/Cargo</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Foto (URL)</Label>
                <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Bio</Label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
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

      <DataTable
        data={speakers}
        isLoading={isLoading}
        emptyIcon={<Mic className="h-10 w-10" />}
        emptyTitle="Nenhum palestrante encontrado"
        keyExtractor={(s: any) => s.id}
        columns={[
          { key: "name", header: "Nome", render: (s: any) => (
            <div className="flex items-center gap-2 font-medium">
              {s.photoUrl && <img src={s.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />}
              <div>
                <p>{s.name}</p>
                {s.title && <p className="text-xs text-gray-400">{s.title}</p>}
              </div>
            </div>
          )},
          { key: "expertise", header: "Especialidades", render: (s: any) => (
            <div className="flex flex-wrap gap-1">
              {(s.expertise ?? []).slice(0, 3).map((e: any, i: number) => (
                <span key={i} className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">{e.topic}</span>
              ))}
            </div>
          )},
          { key: "events", header: "Eventos", render: (s: any) => <span className="text-gray-500">{s.events?.length ?? 0}</span> },
        ]}
        actions={(s: any) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setLinkEventId(s.id)}><LinkIcon className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(s.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover palestrante"
        description={`Tem certeza que deseja remover "${deleteItem?.name ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />

      <Dialog open={linkEventId !== null} onOpenChange={(open) => { if (!open) setLinkEventId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Evento</DialogTitle>
            <DialogDescription>Selecione um evento para vincular a este palestrante.</DialogDescription>
          </DialogHeader>
          {linkEventId && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(Array.isArray(events) ? events : []).map((ev: any) => {
                const speaker = speakers?.find((s: any) => s.id === linkEventId);
                const isLinked = speaker?.events?.some((e: any) => e.eventId === ev.id);
                return (
                  <div key={ev.id} className="flex items-center justify-between rounded border p-2">
                    <span className="text-sm">{ev.title}</span>
                    {isLinked ? (
                      <Button variant="ghost" size="sm" onClick={() => unlinkEvent.mutate({ speakerId: linkEventId, eventId: ev.id })}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => linkEvent.mutate({ speakerId: linkEventId, eventId: ev.id })}>
                        <LinkIcon className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
