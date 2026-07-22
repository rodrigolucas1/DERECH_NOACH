"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/client/components/ImageUpload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MessageCircleQuestion, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { TabSelector } from "@/client/components/ui/TabSelector";
import { DataTable } from "@/client/components/ui/DataTable";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";

export default function AdminRabbiPage() {
  const utils = trpc.useUtils();
  const { data: rabbis } = trpc.rabbi.listAll.useQuery();
  const { data: questions } = trpc.rabbi.listQuestions.useQuery();

  const [tab, setTab] = useState<"profiles" | "questions">("profiles");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", title: "", bio: "", photoUrl: "", email: "" });
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const [profileConfirmOpen, setProfileConfirmOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [questionConfirmOpen, setQuestionConfirmOpen] = useState(false);

  const createProfile = trpc.rabbi.createProfile.useMutation({
    onSuccess: () => { toast.success("Rabino criado!"); utils.rabbi.listAll.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateProfile = trpc.rabbi.updateProfile.useMutation({
    onSuccess: () => { toast.success("Rabino atualizado!"); utils.rabbi.listAll.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteProfile = trpc.rabbi.deleteProfile.useMutation({
    onSuccess: () => { toast.success("Removido!"); utils.rabbi.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const toggleProfile = trpc.rabbi.toggleProfilePublic.useMutation({
    onSuccess: () => { utils.rabbi.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const updateQuestionStatus = trpc.rabbi.updateQuestionStatus.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.rabbi.listQuestions.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteQuestion = trpc.rabbi.deleteQuestion.useMutation({
    onSuccess: () => { toast.success("Removida!"); utils.rabbi.listQuestions.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ name: "", title: "", bio: "", photoUrl: "", email: "" });
  }

  function handleEdit(r: any) {
    setForm({ name: r.name, title: r.title ?? "", bio: r.bio ?? "", photoUrl: r.photoUrl ?? "", email: r.email ?? "" });
    setEditingId(r.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, photoUrl: form.photoUrl || undefined, email: form.email || undefined, title: form.title || undefined, bio: form.bio || undefined };
    if (editingId) {
      updateProfile.mutate({ id: editingId, ...payload });
    } else {
      createProfile.mutate(payload);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pergunte ao Rabino"
        description="Gerencie rabinos e perguntas/respostas"
      />

      <TabSelector
        tabs={[
          { key: "profiles", label: "Rabinos" },
          { key: "questions", label: "Perguntas" },
        ]}
        active={tab}
        onChange={(key: any) => setTab(key as "profiles" | "questions")}
      />

      {tab === "profiles" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
              <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Rabino"}
            </Button>
          </div>
          {showForm && (
            <Card>
              <CardHeader><CardTitle>{editingId ? "Editar" : "Novo"} Rabino</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Rabbi, Rav..." />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Foto</Label>
                    <ImageUpload value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Bio</Label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={createProfile.isPending || updateProfile.isPending}>
                      {createProfile.isPending || updateProfile.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          <DataTable
            data={(rabbis as any) ?? []}
            isLoading={false}
            columns={[
              {
                key: "name",
                header: "Rabino",
                render: (item: any) => (
                  <div className="flex items-center gap-2 font-medium">
                    {item.photoUrl && <img src={item.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />}
                    {item.name}
                  </div>
                ),
              },
              { key: "title", header: "Título", render: (item: any) => item.title ?? "—" },
              { key: "answers", header: "Respostas", render: (item: any) => item._count.answers },
              {
                key: "isPublic",
                header: "Visível",
                render: (item: any) => (
                  <Button variant="ghost" size="sm" onClick={() => toggleProfile.mutate({ id: item.id })}>
                    {item.isPublic ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                  </Button>
                ),
              },
            ]}
            emptyIcon={<MessageCircleQuestion className="mx-auto h-10 w-10 text-gray-300" />}
            emptyTitle="Nenhum rabino cadastrado."
            keyExtractor={(item: any) => item.id}
            actions={(item: any) => (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setDeleteProfileId(item.id); setProfileConfirmOpen(true); }}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          />
        </>
      )}

      {tab === "questions" && (
        <DataTable
          data={(questions as any) ?? []}
          isLoading={false}
          columns={[
            {
              key: "title",
              header: "Pergunta",
              render: (item: any) => (
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="max-w-xs truncate text-xs text-gray-400">{item.question}</div>
                </div>
              ),
            },
            { key: "user", header: "Usuário", render: (item: any) => item.user?.name ?? "—" },
            { key: "category", header: "Categoria", render: (item: any) => item.category ?? "—" },
            {
              key: "status",
              header: "Status",
              render: (item: any) => (
                <span className={`text-xs font-medium ${item.status === "PUBLISHED" ? "text-green-600" : item.status === "REJECTED" ? "text-red-600" : "text-yellow-600"}`}>
                  {item.status === "PUBLISHED" ? "Publicada" : item.status === "REJECTED" ? "Rejeitada" : "Pendente"}
                </span>
              ),
            },
            { key: "answers", header: "Respostas", render: (item: any) => item.answers.length },
          ]}
            emptyIcon={<MessageCircleQuestion className="mx-auto h-10 w-10 text-gray-300" />}
            emptyTitle="Nenhuma pergunta."
            keyExtractor={(item: any) => item.id}
            actions={(item: any) => (
              <>
                {item.status !== "PUBLISHED" && (
                  <Button variant="ghost" size="sm" onClick={() => updateQuestionStatus.mutate({ id: item.id, status: "PUBLISHED", isPublic: true })}>
                    <Eye className="h-4 w-4 text-green-500" />
                  </Button>
                )}
                {item.status !== "REJECTED" && (
                  <Button variant="ghost" size="sm" onClick={() => updateQuestionStatus.mutate({ id: item.id, status: "REJECTED" })}>
                    <EyeOff className="h-4 w-4 text-orange-500" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => { setDeleteQuestionId(item.id); setQuestionConfirmOpen(true); }}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          />
      )}

      <ConfirmDialog
        open={profileConfirmOpen}
        onOpenChange={setProfileConfirmOpen}
        title="Remover rabino"
        description="Tem certeza que deseja remover este rabino?"
        onConfirm={() => { if (deleteProfileId) deleteProfile.mutate({ id: deleteProfileId }); }}
        confirmLabel="Remover"
        variant="destructive"
      />

      <ConfirmDialog
        open={questionConfirmOpen}
        onOpenChange={setQuestionConfirmOpen}
        title="Remover pergunta"
        description="Tem certeza que deseja remover esta pergunta?"
        onConfirm={() => { if (deleteQuestionId) deleteQuestion.mutate({ id: deleteQuestionId }); }}
        confirmLabel="Remover"
        variant="destructive"
      />
    </div>
  );
}
