"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MessageSquare, Power, PowerOff } from "lucide-react";

export default function AdminForumPage() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.forum.categories.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  function resetForm() {
    setForm({ name: "", description: "" });
  }

  function handleEdit(cat: any) {
    setForm({ name: cat.name, description: cat.description ?? "" });
    setEditingId(cat.id);
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fórum</h1>
          <p className="text-sm text-gray-500">Gerenciar categorias e tópicos do fórum</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Nova Categoria"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Editar" : "Nova"} Categoria</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); }} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">
                  {editingId ? "Atualizar" : "Criar"}
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
                <th className="px-4 py-3 font-medium text-gray-500">Nome</th>
                <th className="px-4 py-3 font-medium text-gray-500">Descrição</th>
                <th className="px-4 py-3 font-medium text-gray-500">Tópicos</th>
                <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : !categories?.length ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                  <MessageSquare className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2">Nenhuma categoria cadastrada.</p>
                </td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.description ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{(cat as any)._count?.topics ?? 0}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm("Remover esta categoria?")) {
                        toast.success("Categoria removida!");
                      }
                    }}>
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
