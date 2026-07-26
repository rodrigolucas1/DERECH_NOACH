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
import { Plus, Pencil, Trash2, GraduationCap, Users } from "lucide-react";

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  PAUSED: "Pausada",
  CANCELLED: "Cancelada",
};

export default function AdminMentorshipPage() {
  const utils = trpc.useUtils();
  const { data: mentors, isLoading: mentorsLoading } = trpc.mentorship.mentorListAll.useQuery();
  const { data: mentorships, isLoading: mentorshipsLoading } = trpc.mentorship.listMyMentorships.useQuery();

  const [tab, setTab] = useState<"mentors" | "mentorships">("mentors");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    expertise: "", bio: "", maxMentees: "",
  });

  const createMentor = trpc.mentorship.mentorCreate.useMutation({
    onSuccess: () => { toast.success("Mentor criado!"); utils.mentorship.mentorListAll.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMentor = trpc.mentorship.mentorUpdate.useMutation({
    onSuccess: () => { toast.success("Mentor atualizado!"); utils.mentorship.mentorListAll.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMentor = trpc.mentorship.mentorDelete.useMutation({
    onSuccess: () => { toast.success("Mentor removido!"); utils.mentorship.mentorListAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ expertise: "", bio: "", maxMentees: "" });
  }

  function handleEdit(m: any) {
    setForm({
      expertise: m.expertise ?? "",
      bio: m.bio ?? "",
      maxMentees: m.maxMentees?.toString() ?? "",
    });
    setEditingId(m.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      expertise: form.expertise || undefined,
      bio: form.bio || undefined,
      maxMentees: form.maxMentees ? parseInt(form.maxMentees) : undefined,
    };
    if (editingId) {
      updateMentor.mutate(payload);
    } else {
      createMentor.mutate(payload);
    }
  }

  const deleteItem = tab === "mentors" ? mentors?.find((m: any) => m.id === deleteId) : mentorships?.find((m: any) => m.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentoria"
        description="Gerencie mentores e mentorias"
        action={
          tab === "mentors" && (
            <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
              <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Mentor"}
            </Button>
          )
        }
      />

      <div className="flex gap-2">
        <Button variant={tab === "mentors" ? "default" : "outline"} size="sm" onClick={() => setTab("mentors")}>
          <GraduationCap className="mr-1 h-3 w-3" />Mentores
        </Button>
        <Button variant={tab === "mentorships" ? "default" : "outline"} size="sm" onClick={() => setTab("mentorships")}>
          <Users className="mr-1 h-3 w-3" />Mentorias
        </Button>
      </div>

      {showForm && tab === "mentors" && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Novo"} Mentor</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Especialidades</Label>
                <Input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} placeholder="ex: Torá, Halachá, Liderança" />
              </div>
              <div className="space-y-2">
                <Label>Máximo de Mentorados</Label>
                <Input type="number" min="1" value={form.maxMentees} onChange={(e) => setForm({ ...form, maxMentees: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Bio</Label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createMentor.isPending || updateMentor.isPending}>
                  {createMentor.isPending || updateMentor.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "mentors" ? (
        <DataTable
          data={mentors}
          isLoading={mentorsLoading}
          emptyIcon={<GraduationCap className="h-10 w-10" />}
          emptyTitle="Nenhum mentor encontrado"
          keyExtractor={(m: any) => m.id}
          columns={[
            { key: "name", header: "Nome", render: (m: any) => <span className="font-medium">{m.user?.name ?? "—"}</span> },
            { key: "expertise", header: "Especialidades", render: (m: any) => (
              <span className="text-gray-500">{m.expertise ?? "—"}</span>
            )},
            { key: "maxMentees", header: "Máx. Mentorados", render: (m: any) => <span className="text-gray-500">{m.maxMentees}</span> },
            { key: "isAvailable", header: "Disponível", render: (m: any) => m.isAvailable
              ? <span className="text-green-600 text-xs font-medium">Sim</span>
              : <span className="text-gray-400 text-xs">Não</span>
            },
          ]}
          actions={(m: any) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => { setDeleteId(m.id); }}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        />
      ) : (
        <DataTable
          data={mentorships}
          isLoading={mentorshipsLoading}
          emptyIcon={<Users className="h-10 w-10" />}
          emptyTitle="Nenhuma mentoria encontrada"
          keyExtractor={(m: any) => m.id}
          columns={[
            { key: "mentor", header: "Mentor", render: (m: any) => <span className="font-medium">{m.mentor?.name ?? "—"}</span> },
            { key: "mentee", header: "Mentorado", render: (m: any) => <span className="text-gray-500">{m.mentee?.name ?? "—"}</span> },
            { key: "status", header: "Status", render: (m: any) => (
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                m.status === "ACTIVE" ? "bg-green-50 text-green-700" : m.status === "COMPLETED" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}>{statusLabels[m.status] ?? m.status}</span>
            )},
            { key: "startDate", header: "Início", render: (m: any) => <span className="text-gray-500">{m.startDate ? new Date(m.startDate).toLocaleDateString("pt-BR") : "—"}</span> },
          ]}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover"
        description={`Tem certeza que deseja remover? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId && tab === "mentors") deleteMentor.mutate(); setDeleteId(null); }}
      />
    </div>
  );
}
