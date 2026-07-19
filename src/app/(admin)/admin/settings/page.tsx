"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/client/lib/trpc";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const utils = trpc.useUtils();
  const { data: branding } = trpc.admin.getBranding.useQuery();
  const updateBranding = trpc.admin.updateBranding.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      utils.admin.getBranding.invalidate();
      utils.tenant.getCurrent.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configurações.");
    },
  });

  const [form, setForm] = useState({
    platformName: "",
    slogan: "",
    footerText: "",
    primaryColor: "#1a56db",
    secondaryColor: "#1e40af",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  });

  useEffect(() => {
    if (branding) {
      setForm({
        platformName: branding.platformName ?? "",
        slogan: branding.slogan ?? "",
        footerText: branding.footerText ?? "",
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        backgroundColor: branding.backgroundColor,
        textColor: branding.textColor,
      });
    }
  }, [branding]);

  function handleSave() {
    updateBranding.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">
          Gerencie as configurações da plataforma
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configurações básicas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Nome da Plataforma</Label>
                  <Input
                    id="platformName"
                    value={form.platformName}
                    onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                    placeholder="Portal Bnei Noach"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    value={form.slogan}
                    onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                    placeholder="Conectando a comunidade"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footerText">Texto do Rodapé</Label>
                <Input
                  id="footerText"
                  value={form.footerText}
                  onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                  placeholder="© 2024 Portal Bnei Noach"
                />
              </div>
              <Button onClick={handleSave} disabled={updateBranding.isPending}>
                {updateBranding.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>
                Configure as cores, logo e aparência da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  { key: "primaryColor", label: "Cor Primária" },
                  { key: "secondaryColor", label: "Cor Secundária" },
                  { key: "accentColor", label: "Cor de Destaque" },
                  { key: "backgroundColor", label: "Cor de Fundo" },
                ] as const).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex gap-2">
                      <Input
                        id={field.key}
                        type="color"
                        value={form[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="h-10 w-14 cursor-pointer p-1"
                      />
                      <Input
                        value={form[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 rounded-lg border p-4">
                <p className="text-sm text-gray-500">Pré-visualização:</p>
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-2"
                  style={{
                    backgroundColor: form.primaryColor,
                    color: "#ffffff",
                  }}
                >
                  <span className="font-bold">{form.platformName || "Portal"}</span>
                </div>
                <div
                  className="rounded-lg px-4 py-2"
                  style={{
                    backgroundColor: form.accentColor,
                    color: "#000000",
                  }}
                >
                  Botão de Ação
                </div>
              </div>
              <Button onClick={handleSave} disabled={updateBranding.isPending}>
                {updateBranding.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Configure serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "YouTube", desc: "Transmissões ao vivo" },
                { name: "Zoom", desc: "Reuniões online" },
                { name: "Google Meet", desc: "Reuniões online" },
                { name: "WhatsApp", desc: "Notificações por mensagem" },
                { name: "OpenAI", desc: "Assistente com IA" },
              ].map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-sm text-gray-500">{provider.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Em breve
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
