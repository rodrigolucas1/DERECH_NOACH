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

export default function AdminRabbiPage() {
  const utils = trpc.useUtils();
  const { data: rabbis } = trpc.rabbi.listAll.useQuery();
  const { data: questions } = trpc.rabbi.listQuestions.useQuery();

  const [tab, setTab] = useState<"profiles" | "questions">("profiles");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", title: "", bio: "", photoUrl: "", email: "" });

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
  });
  const updateQuestionStatus = trpc.rabbi.updateQuestionStatus.useMutation({
    onSuccess: () => { toast.success("Status alterado!"); utils.rabbi.listQuestions.invalidate(); },
  });
  const deleteQuestion = trpc.rabbi.deleteQuestion.useMutation({
    onSuccess: () => { toast.success("Removida!"); utils.rabbi.listQuestions.invalidate(); },
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pergunte ao Rabino</h1>
        <p className="text-sm text-gray-500">Gerencie rabinos e perguntas/respostas</p>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "profiles" ? "default" : "outline"} size="sm" onClick={() => setTab("profiles")}>Rabinos</Button>
        <Button variant={tab === "questions" ? "default" : "outline"} size="sm" onClick={() => setTab("questions")}>Perguntas</Button>
      </div>

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
          <div className="rounded-lg border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Rabino</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Título</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Respostas</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Visível</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!rabbis?.length ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <MessageCircleQuestion className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2">Nenhum rabino cadastrado.</p>
                  </td></tr>
                ) : rabbis.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {r.photoUrl && <img src={r.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />}
                        {r.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.title ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{r._count.answers}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => toggleProfile.mutate({ id: r.id })}>
                        {r.isPublic ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteProfile.mutate({ id: r.id }); }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "questions" && (
        <div className="rounded-lg border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Pergunta</th>
                <th className="px-4 py-3 font-medium text-gray-500">Usuário</th>
                <th className="px-4 py-3 font-medium text-gray-500">Categoria</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Respostas</th>
                <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!questions?.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  <MessageCircleQuestion className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2">Nenhuma pergunta.</p>
                </td></tr>
              ) : questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{q.title}</div>
                    <div className="max-w-xs truncate text-xs text-gray-400">{q.question}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{q.user?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{q.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${q.status === "PUBLISHED" ? "text-green-600" : q.status === "REJECTED" ? "text-red-600" : "text-yellow-600"}`}>
                      {q.status === "PUBLISHED" ? "Publicada" : q.status === "REJECTED" ? "Rejeitada" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{q.answers.length}</td>
                  <td className="px-4 py-3 flex gap-1">
                    {q.status !== "PUBLISHED" && (
                      <Button variant="ghost" size="sm" onClick={() => updateQuestionStatus.mutate({ id: q.id, status: "PUBLISHED", isPublic: true })}>
                        <Eye className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    {q.status !== "REJECTED" && (
                      <Button variant="ghost" size="sm" onClick={() => updateQuestionStatus.mutate({ id: q.id, status: "REJECTED" })}>
                        <EyeOff className="h-4 w-4 text-orange-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover?")) deleteQuestion.mutate({ id: q.id }); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
