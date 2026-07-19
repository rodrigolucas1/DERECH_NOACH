"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/client/components/ImageUpload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, Power, PowerOff } from "lucide-react";

export default function AdminCommunitiesPage() {
  const utils = trpc.useUtils();
  const { data: communities, isLoading } = trpc.community.listAll.useQuery();
  const createMutation = trpc.community.create.useMutation({
    onSuccess: () => { toast.success("Comunidade criada!"); utils.community.listAll.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.community.update.useMutation({
    onSuccess: () => { toast.success("Comunidade atualizada!"); utils.community.listAll.invalidate(); setEditingId(null); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const toggleMutation = trpc.community.toggleActive.useMutation({
    onSuccess: () => { utils.community.listAll.invalidate(); },
  });
  const deleteMutation = trpc.community.delete.useMutation({
    onSuccess: () => { toast.success("Comunidade removida!"); utils.community.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", city: "", state: "MG", description: "",
    address: "", phone: "", email: "", logoUrl: "", coverImageUrl: "",
  });

  function resetForm() {
    setForm({ name: "", slug: "", city: "", state: "MG", description: "", address: "", phone: "", email: "", logoUrl: "", coverImageUrl: "" });
  }

  function handleEdit(c: any) {
    setForm({
      name: c.name, slug: c.slug, city: c.city, state: c.state,
      description: c.description ?? "", address: c.address ?? "",
      phone: c.phone ?? "", email: c.email ?? "",
      logoUrl: c.logoUrl ?? "", coverImageUrl: c.coverImageUrl ?? "",
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, logoUrl: form.logoUrl || undefined, coverImageUrl: form.coverImageUrl || undefined };
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
          <h1 className="text-2xl font-bold text-gray-900">Comunidades</h1>
          <p className="text-sm text-gray-500">Gerencie as comunidades do tenant</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Comunidade"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Comunidade</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} required />
              </div>
              <div className="space-y-2">
                <Label>Cidade *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>UF *</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} required maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <ImageUpload value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} />
              </div>
              <div className="space-y-2">
                <Label>Capa</Label>
                <ImageUpload value={form.coverImageUrl} onChange={(url) => setForm({ ...form, coverImageUrl: url })} label="Imagem de capa" />
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

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Comunidade</th>
                <th className="px-4 py-3 font-medium text-gray-500">Cidade</th>
                <th className="px-4 py-3 font-medium text-gray-500">UF</th>
                <th className="px-4 py-3 font-medium text-gray-500">Membros</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : !communities?.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  <MapPin className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2">Nenhuma comunidade cadastrada.</p>
                </td></tr>
              ) : communities.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {c.logoUrl && <img src={c.logoUrl} alt="" className="h-8 w-8 rounded object-cover" />}
                      {c.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.city}</td>
                  <td className="px-4 py-3 text-gray-500">{c.state}</td>
                  <td className="px-4 py-3 text-gray-500">{c._count.members}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <span className="text-green-600 text-xs font-medium">Ativo</span>
                    ) : (
                      <span className="text-red-600 text-xs font-medium">Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: c.id })}>
                      {c.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover esta comunidade?")) deleteMutation.mutate({ id: c.id }); }}>
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
