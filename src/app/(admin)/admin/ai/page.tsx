"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/client/lib/trpc";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { TabSelector } from "@/client/components/ui/TabSelector";
import { DataTable } from "@/client/components/ui/DataTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bot, BarChart3, MessageSquare, Zap, Clock, CheckCircle } from "lucide-react";

export default function AdminAIPage() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("config");

  const { data: config, isLoading: configLoading } = trpc.aiAdmin.getConfig.useQuery();
  const { data: logs, isLoading: logsLoading } = trpc.aiAdmin.getUsageLogs.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.aiAdmin.getUsageStats.useQuery();

  const upsertConfig = trpc.aiAdmin.upsertConfig.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      utils.aiAdmin.getConfig.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configurações.");
    },
  });

  const [form, setForm] = useState({
    apiKey: "",
    model: "gpt-4o-mini",
    systemPrompt: "",
    maxTokens: 1000,
    temperature: 0.7,
    isEnabled: false,
  });

  useEffect(() => {
    if (config) {
      setForm({
        apiKey: config.apiKey ?? "",
        model: config.model,
        systemPrompt: config.systemPrompt ?? "",
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        isEnabled: config.isEnabled,
      });
    }
  }, [config]);

  function handleSave() {
    upsertConfig.mutate({
      apiKey: form.apiKey || undefined,
      model: form.model,
      systemPrompt: form.systemPrompt || undefined,
      maxTokens: form.maxTokens,
      temperature: form.temperature,
      isEnabled: form.isEnabled,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assistente IA"
        description="Configure o assistente inteligente do portal"
      />

      <TabSelector
        tabs={[
          { key: "config", label: "Configuração", icon: <Bot className="h-4 w-4" /> },
          { key: "usage", label: "Uso", icon: <BarChart3 className="h-4 w-4" /> },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "config" && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Assistente</CardTitle>
            <CardDescription>
              Configure o modelo de IA, chave de API e parâmetros de comportamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="sk-..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <select
                  id="model"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="flex h-9 w-full items-center rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={form.maxTokens}
                  onChange={(e) => setForm({ ...form, maxTokens: parseInt(e.target.value) || 1000 })}
                  min={100}
                  max={4000}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <textarea
                id="systemPrompt"
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Instruções para o assistente IA..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) || 0.7 })}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={form.isEnabled}
                  onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isEnabled">Habilitado</Label>
              </div>
            </div>

            <Button onClick={handleSave} disabled={upsertConfig.isPending}>
              {upsertConfig.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "usage" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total de Requisições</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? (
                        <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-200" />
                      ) : (
                        stats?.totalRequests ?? 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-50 p-3">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tokens Utilizados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? (
                        <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-200" />
                      ) : (
                        stats?.totalTokens ?? 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-50 p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? (
                        <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-200" />
                      ) : (
                        `${stats?.successRate ?? 0}%`
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-orange-50 p-3">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Latência Média</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? (
                        <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-200" />
                      ) : (
                        `${stats?.avgLatency ?? 0}ms`
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            data={logs as Record<string, unknown>[] | undefined}
            isLoading={logsLoading}
            emptyIcon={<Bot className="h-10 w-10" />}
            emptyTitle="Nenhum registro de uso"
            emptyDescription="Ainda não há registros de uso do assistente IA."
            keyExtractor={(item: any) => item.id}
            columns={[
              {
                key: "createdAt",
                header: "Data",
                render: (item: any) => (
                  <span className="text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString("pt-BR")}{" "}
                    {new Date(item.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ),
              },
              {
                key: "user",
                header: "Usuário",
                render: (item: any) => (
                  <span className="font-medium">{item.user?.name ?? item.user?.email ?? "—"}</span>
                ),
              },
              {
                key: "model",
                header: "Modelo",
                render: (item: any) => (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {item.model}
                  </span>
                ),
              },
              {
                key: "totalTokens",
                header: "Tokens",
                render: (item: any) => (
                  <span className="text-gray-500">{item.totalTokens}</span>
                ),
              },
              {
                key: "latencyMs",
                header: "Latência",
                render: (item: any) => (
                  <span className="text-gray-500">{item.latencyMs ? `${item.latencyMs}ms` : "—"}</span>
                ),
              },
              {
                key: "success",
                header: "Status",
                render: (item: any) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.success
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.success ? "Sucesso" : "Erro"}
                  </span>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
