"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/client/lib/trpc";
import { TabSelector } from "@/client/components/ui/TabSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/client/components/ui/Switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plug,
  MessageSquare,
  Video,
  Monitor,
  Tv,
  Mail,
  Power,
  PowerOff,
  Settings,
  TestTube,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  BookOpen,
  Library,
  GraduationCap,
  Heart,
  User,
  Image,
  Radio,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Video,
  Monitor,
  Tv,
  Mail,
};

interface ConfigValues {
  [key: string]: string;
}

const FEATURES = [
  { key: "events", label: "Eventos", description: "Gerenciar eventos e encontros", icon: Calendar },
  { key: "forum", label: "Fórum", description: "Discussões e comunidade", icon: MessageSquare },
  { key: "library", label: "Biblioteca", description: "Acervo de materiais", icon: Library },
  { key: "studies", label: "Estudos", description: "Materiais de estudo e cursos", icon: GraduationCap },
  { key: "tzedaka", label: "Tzedaká", description: "Doações e caridade", icon: Heart },
  { key: "rabbi", label: "Rabbi", description: "Módulo do rabbi", icon: User },
  { key: "gallery", label: "Galeria", description: "Fotos e mídia", icon: Image },
  { key: "liveStreams", label: "Transmissões ao Vivo", description: "Aulas e eventos ao vivo", icon: Radio },
] as const;

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  // ── Branding state ──
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

  // ── Integrations state ──
  const { data: adapters } = trpc.integration.listAvailable.useQuery();
  const { data: configs } = trpc.integration.list.useQuery();

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<ConfigValues>({});
  const [testing, setTesting] = useState<string | null>(null);

  const upsert = trpc.integration.upsert.useMutation({
    onSuccess: () => {
      toast.success("Integração configurada!");
      utils.integration.list.invalidate();
      setSelectedService(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleActive = trpc.integration.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.integration.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteIntegration = trpc.integration.delete.useMutation({
    onSuccess: () => {
      toast.success("Integração removida!");
      utils.integration.list.invalidate();
      setSelectedService(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const testConnection = trpc.integration.testConnection.useMutation({
    onMutate: (vars: any) => { setTesting(vars.service); },
    onSettled: () => { setTesting(null); },
    onSuccess: (data: any) => {
      toast.success(data.message);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getConfigForService = (service: string) => {
    return configs?.find((c: any) => c.provider === service);
  };

  const openConfigDialog = (service: string) => {
    const existing = getConfigForService(service);
    const adapter = adapters?.find((a: any) => a.name === service);
    const initForm: ConfigValues = {};
    if (adapter) {
      for (const field of (adapter as any).configFields) {
        initForm[field.key] = "";
      }
    }
    if (existing) {
      if (existing.apiKey) initForm.apiKey = existing.apiKey;
      if (existing.apiSecret) initForm.apiSecret = existing.apiSecret;
      if (existing.webhookUrl) initForm.webhookUrl = existing.webhookUrl;
      if (existing.extraConfig) {
        try {
          const parsed = JSON.parse(existing.extraConfig);
          Object.assign(initForm, parsed);
        } catch {}
      }
    }
    setConfigForm(initForm);
    setSelectedService(service);
  };

  const handleSaveIntegration = () => {
    if (!selectedService) return;
    const { apiKey, apiSecret, webhookUrl, ...rest } = configForm;
    upsert.mutate({
      service: selectedService,
      apiKey: apiKey || undefined,
      apiSecret: apiSecret || undefined,
      webhookUrl: webhookUrl || undefined,
      extraConfig: Object.keys(rest).length > 0 ? JSON.stringify(rest) : undefined,
      isActive: true,
    });
  };

  const selectedAdapter = adapters?.find((a: any) => a.name === selectedService);
  const selectedConfig = selectedService ? getConfigForService(selectedService) : null;

  // ── Features state ──
  const { data: featureSettings } = trpc.tenantSetting.listByGroup.useQuery({ group: "features" });

  const setFeature = trpc.tenantSetting.set.useMutation({
    onSuccess: () => {
      utils.tenantSetting.listByGroup.invalidate({ group: "features" });
      toast.success("Recurso atualizado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const isFeatureEnabled = (key: string) => {
    const setting = featureSettings?.find((s: any) => s.key === key);
    return setting?.valueBool ?? true;
  };

  const toggleFeature = (key: string) => {
    setFeature.mutate({
      group: "features",
      key,
      valueBool: !isFeatureEnabled(key),
    });
  };

  const tabs = [
    { key: "general", label: "Geral" },
    { key: "branding", label: "Branding" },
    { key: "integrations", label: "Integrações" },
    { key: "features", label: "Recursos" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">
          Gerencie as configurações da plataforma
        </p>
      </div>

      <TabSelector tabs={tabs} active={activeTab} onChange={setActiveTab} variant="underline" />

      {/* ── Geral ── */}
      {activeTab === "general" && (
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
      )}

      {/* ── Branding ── */}
      {activeTab === "branding" && (
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
      )}

      {/* ── Integrações ── */}
      {activeTab === "integrations" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adapters?.map((adapter: any) => {
              const config = getConfigForService(adapter.name);
              const isActive = config?.isActive ?? false;
              const Icon = iconMap[adapter.icon] || Plug;

              return (
                <Card key={adapter.name}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{adapter.displayName}</CardTitle>
                          <CardDescription className="text-xs">{adapter.description}</CardDescription>
                        </div>
                      </div>
                      {config ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {isActive ? "Ativo" : "Inativo"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Não configurado
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openConfigDialog(adapter.name)}
                      >
                        <Settings className="mr-1 h-3 w-3" />
                        Configurar
                      </Button>
                      {config && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive.mutate({ id: config.id })}
                          >
                            {isActive ? <PowerOff className="mr-1 h-3 w-3" /> : <Power className="mr-1 h-3 w-3" />}
                            {isActive ? "Desativar" : "Ativar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection.mutate({ service: adapter.name })}
                            disabled={testing === adapter.name}
                          >
                            <TestTube className="mr-1 h-3 w-3" />
                            {testing === adapter.name ? "Testando..." : "Testar"}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Dialog open={!!selectedService} onOpenChange={(open) => { if (!open) setSelectedService(null); }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Configurar {(selectedAdapter as any)?.displayName}
                </DialogTitle>
                <DialogDescription>
                  {(selectedAdapter as any)?.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {(selectedAdapter as any)?.configFields.map((field: any) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key}>{field.label}{field.required && " *"}</Label>
                    <Input
                      id={field.key}
                      type={field.type === "password" ? "password" : "text"}
                      placeholder={field.type === "password" ? "••••••••" : `Digite ${field.label.toLowerCase()}`}
                      value={configForm[field.key] || ""}
                      onChange={(e) => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                    />
                  </div>
                ))}
                {selectedConfig && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (selectedConfig.id) {
                          deleteIntegration.mutate({ id: selectedConfig.id });
                        }
                      }}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remover
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedService(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveIntegration} disabled={upsert.isPending}>
                  {upsert.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* ── Recursos ── */}
      {activeTab === "features" && (
        <Card>
          <CardHeader>
            <CardTitle>Recursos da Plataforma</CardTitle>
            <CardDescription>
              Ative ou desative módulos da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {FEATURES.map((feature) => {
                const enabled = isFeatureEnabled(feature.key);
                const Icon = feature.icon;
                return (
                  <div key={feature.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{feature.label}</p>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => toggleFeature(feature.key)}
                      disabled={setFeature.isPending}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
