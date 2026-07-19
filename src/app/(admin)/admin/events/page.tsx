"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar, Power, PowerOff } from "lucide-react";

export default function AdminEventsPage() {
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.event.listAll.useQuery();
  const { data: communities } = trpc.community.listAll.useQuery();
  const createMutation = trpc.event.create.useMutation({
    onSuccess: () => { toast.success("Evento criado!"); utils.event.listAll.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.event.update.useMutation({
    onSuccess: () => { toast.success("Evento atualizado!"); utils.event.listAll.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.event.delete.useMutation({
    onSuccess: () => { toast.success("Evento removido!"); utils.event.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const toggleMutation = trpc.event.toggleActive.useMutation({
    onSuccess: () => utils.event.listAll.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", dateTime: "", location: "", eventType: "IN_PERSON" as const,
    communityId: "", meetingUrl: "",
  });

  function resetForm() {
    setForm({ title: "", description: "", dateTime: "", location: "", eventType: "IN_PERSON", communityId: "", meetingUrl: "" });
  }

  function handleEdit(e: any) {
    setForm({
      title: e.title, description: e.description ?? "", dateTime: e.dateTime ? new Date(e.dateTime).toISOString().slice(0, 16) : "",
      location: e.location ?? "", eventType: e.eventType, communityId: e.communityId ?? "", meetingUrl: e.meetingUrl ?? "",
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
      meetingUrl: form.meetingUrl || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500">Gerencie os eventos da plataforma</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Evento"}
        </Button>
      </div>

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

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Título</th>
                <th className="px-4 py-3 font-medium text-gray-500">Data</th>
                <th className="px-4 py-3 font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 font-medium text-gray-500">Comunidade</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : !events?.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2">Nenhum evento cadastrado.</p>
                </td></tr>
              ) : events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(e.dateTime).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-gray-500">{e.eventType === "IN_PERSON" ? "Presencial" : e.eventType === "ONLINE" ? "Online" : "Híbrido"}</td>
                  <td className="px-4 py-3 text-gray-500">{e.community?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {e.isActive ? <span className="text-green-600 text-xs font-medium">Ativo</span> : <span className="text-red-600 text-xs font-medium">Inativo</span>}
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: e.id })}>
                      {e.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteMutation.mutate({ id: e.id }); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
