"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function AdminIntegrationsPage() {
  const utils = trpc.useUtils();
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
    onMutate: (vars) => { setTesting(vars.service); },
    onSettled: () => { setTesting(null); },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const getConfigForService = (service: string) => {
    return configs?.find((c) => c.provider === service);
  };

  const openConfigDialog = (service: string) => {
    const existing = getConfigForService(service);
    const adapter = adapters?.find((a) => a.name === service);
    const form: ConfigValues = {};
    if (adapter) {
      for (const field of adapter.configFields) {
        form[field.key] = "";
      }
    }
    if (existing) {
      if (existing.apiKey) form.apiKey = existing.apiKey;
      if (existing.apiSecret) form.apiSecret = existing.apiSecret;
      if (existing.webhookUrl) form.webhookUrl = existing.webhookUrl;
      if (existing.extraConfig) {
        try {
          const parsed = JSON.parse(existing.extraConfig);
          Object.assign(form, parsed);
        } catch {}
      }
    }
    setConfigForm(form);
    setSelectedService(service);
  };

  const handleSave = () => {
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

  const selectedAdapter = adapters?.find((a) => a.name === selectedService);
  const selectedConfig = selectedService ? getConfigForService(selectedService) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrações</h1>
        <p className="text-gray-500">
          Configure integrações com serviços externos
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adapters?.map((adapter) => {
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
              Configurar {selectedAdapter?.displayName}
            </DialogTitle>
            <DialogDescription>
              {selectedAdapter?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAdapter?.configFields.map((field) => (
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
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
