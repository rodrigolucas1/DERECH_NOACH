"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Award, Copy, CheckCircle } from "lucide-react";

type Tab = "templates" | "certificates";

export default function AdminCertificatesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const utils = trpc.useUtils();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificados</h1>
        <p className="text-sm text-gray-500">Gerencie templates e certificados emitidos</p>
      </div>

      <div className="flex gap-1 rounded-lg border bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setActiveTab("templates")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "templates" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("certificates")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "certificates" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Certificados Emitidos
        </button>
      </div>

      {activeTab === "templates" ? <TemplatesTab /> : <CertificatesTab />}
    </div>
  );
}

function TemplatesTab() {
  const utils = trpc.useUtils();
  const { data: templates, isLoading } = trpc.certificate.listTemplates.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    subtitle: "",
    borderStyle: "classic",
    fontFamily: "serif",
    primaryColor: "#1a56db",
    accentColor: "#f59e0b",
  });

  const createMutation = trpc.certificate.createTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template criado!");
      utils.certificate.listTemplates.invalidate();
      setShowForm(false);
      setForm({ name: "", title: "", subtitle: "", borderStyle: "classic", fontFamily: "serif", primaryColor: "#1a56db", accentColor: "#f59e0b" });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.certificate.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template removido!");
      utils.certificate.listTemplates.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Novo Template"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Novo Template de Certificado</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Certificado de Curso" />
              </div>
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Ex: Certificado de Conclusão" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Subtítulo</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Ex: Programa de Estudos Bíblicos" />
              </div>
              <div className="space-y-2">
                <Label>Estilo de Borda</Label>
                <select
                  value={form.borderStyle}
                  onChange={(e) => setForm({ ...form, borderStyle: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="classic">Clássico</option>
                  <option value="modern">Moderno</option>
                  <option value="elegant">Elegante</option>
                  <option value="simple">Simples</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fonte</Label>
                <select
                  value={form.fontFamily}
                  onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="serif">Serifada</option>
                  <option value="sans-serif">Sem Serifa</option>
                  <option value="monospace">Monoespaçada</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border"
                  />
                  <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor de Destaque</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border"
                  />
                  <Input value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Criar Template"}
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
                <th className="px-4 py-3 font-medium text-gray-500">Título</th>
                <th className="px-4 py-3 font-medium text-gray-500">Estilo</th>
                <th className="px-4 py-3 font-medium text-gray-500">Certificados</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : !templates?.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  <Award className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2">Nenhum template cadastrado.</p>
                </td></tr>
              ) : templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500">{t.title}</td>
                  <td className="px-4 py-3 text-gray-500">{t.borderStyle}</td>
                  <td className="px-4 py-3 text-gray-500">{t._count.certificates}</td>
                  <td className="px-4 py-3">
                    {t.isActive ? <span className="text-green-600 text-xs font-medium">Ativo</span> : <span className="text-red-600 text-xs font-medium">Inativo</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Remover este template?")) deleteMutation.mutate({ id: t.id }); }}>
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

function CertificatesTab() {
  const utils = trpc.useUtils();
  const { data: certificates, isLoading } = trpc.certificate.listCertificates.useQuery();
  const { data: templates } = trpc.certificate.listTemplates.useQuery();
  const { data: users } = trpc.admin.listUsers.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    templateId: "",
    userId: "",
    recipientName: "",
    completionDate: "",
  });

  const issueMutation = trpc.certificate.issueCertificate.useMutation({
    onSuccess: () => {
      toast.success("Certificado emitido!");
      utils.certificate.listCertificates.invalidate();
      setShowForm(false);
      setForm({ templateId: "", userId: "", recipientName: "", completionDate: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    issueMutation.mutate({
      templateId: form.templateId,
      userId: form.userId,
      recipientName: form.recipientName,
      completionDate: form.completionDate ? new Date(form.completionDate).toISOString() : undefined,
    });
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />{showForm ? "Cancelar" : "Emitir Certificado"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Emitir Novo Certificado</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Template *</Label>
                <select
                  value={form.templateId}
                  onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                  required
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Selecione um template</option>
                  {templates?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Destinatário (Usuário) *</Label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  required
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Selecione um usuário</option>
                  {users?.map((u: any) => <option key={u.user.id} value={u.user.id}>{u.user.name ?? u.user.email}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nome no Certificado *</Label>
                <Input value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} required placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>Data de Conclusão</Label>
                <Input type="date" value={form.completionDate} onChange={(e) => setForm({ ...form, completionDate: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={issueMutation.isPending}>
                  {issueMutation.isPending ? "Emitindo..." : "Emitir Certificado"}
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
                <th className="px-4 py-3 font-medium text-gray-500">Destinatário</th>
                <th className="px-4 py-3 font-medium text-gray-500">Template</th>
                <th className="px-4 py-3 font-medium text-gray-500">Nº Certificado</th>
                <th className="px-4 py-3 font-medium text-gray-500">Data Emissão</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : !certificates?.length ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <Award className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2">Nenhum certificado emitido.</p>
                </td></tr>
              ) : certificates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.recipientName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.template.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    <span className="flex items-center gap-1">
                      {c.certificateNumber}
                      <button
                        onClick={() => copyToClipboard(c.certificateNumber, c.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copiar código"
                      >
                        {copiedId === c.id ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.issuedAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${c.status === "ACTIVE" ? "text-green-600" : c.status === "REVOKED" ? "text-red-600" : "text-yellow-600"}`}>
                      {c.status === "ACTIVE" ? "Ativo" : c.status === "REVOKED" ? "Revogado" : "Expirado"}
                    </span>
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
