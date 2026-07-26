"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Shield,
  Palette,
  Bell,
  Eye,
  Lock,
  Monitor,
  Sun,
  Moon,
  Loader2,
  Save,
  Check,
  Smartphone,
  BookOpen,
  Calendar,
  MessageCircle,
  Newspaper,
  Users,
  Sparkles,
  MonitorSmartphone,
  Type,
  Mail,
  Globe,
} from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/client/components/ui/Switch";

const STORAGE_KEY = "derech-noach-settings";

interface SettingsState {
  theme: "light" | "dark" | "system";
  language: string;
  fontSize: "small" | "normal" | "large";
  reducedMotion: boolean;
  highContrast: boolean;
  notifications: {
    email: boolean;
    inApp: boolean;
    events: boolean;
    studies: boolean;
    news: boolean;
    communities: boolean;
    ai: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    showEmail: boolean;
    showPhone: boolean;
  };
}

const defaultSettings: SettingsState = {
  theme: "system",
  language: "pt",
  fontSize: "normal",
  reducedMotion: false,
  highContrast: false,
  notifications: {
    email: true,
    inApp: true,
    events: true,
    studies: true,
    news: false,
    communities: true,
    ai: true,
  },
  privacy: {
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
  },
};

function ToggleSetting({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
          <Icon className="h-4 w-4 text-blue-900" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ThemeOption({
  value,
  icon: Icon,
  label,
  current,
  onChange,
}: {
  value: "light" | "dark" | "system";
  icon: React.ElementType;
  label: string;
  current: string;
  onChange: (v: "light" | "dark" | "system") => void;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
        isActive
          ? "border-blue-600 bg-blue-50 text-blue-900"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{label}</span>
      {isActive && <Check className="h-4 w-4 text-blue-600" />}
    </button>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPass !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (newPass.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao alterar senha");
      }

      setSuccess(true);
      setCurrent("");
      setNewPass("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Senha Atual</Label>
        <Input
          id="current-password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">Nova Senha</Label>
        <Input
          id="new-password"
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Senha alterada com sucesso!</p>}
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
        Alterar Senha
      </Button>
    </form>
  );
}

const sessions = [
  { id: "1", device: "Chrome · Windows", ip: "189.xx.xx.xx", lastActive: "Agora", current: true },
  { id: "2", device: "Safari · iPhone", ip: "189.xx.xx.xx", lastActive: "2 horas atrás", current: false },
];

const loginHistory = [
  { id: "1", date: "26/07/2026 17:00", ip: "189.xx.xx.xx", device: "Chrome · Windows", success: true },
  { id: "2", date: "25/07/2026 09:30", ip: "189.xx.xx.xx", device: "Chrome · Windows", success: true },
  { id: "3", date: "24/07/2026 14:15", ip: "177.xx.xx.xx", device: "Safari · iPhone", success: true },
  { id: "4", date: "23/07/2026 21:00", ip: "200.xx.xx.xx", device: "Firefox · Linux", success: false },
];

export default function SettingsPage() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState<"security" | "preferences" | "notifications" | "privacy">("preferences");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {}
  }, []);

  const saveSettings = useCallback((newSettings: SettingsState) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {}
  }, []);

  function handleSave() {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: "security" as const, label: "Segurança", icon: Shield },
    { id: "preferences" as const, label: "Preferências", icon: Palette },
    { id: "notifications" as const, label: "Notificações", icon: Bell },
    { id: "privacy" as const, label: "Privacidade", icon: Eye },
  ];

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <FadeIn>
          <Lock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Faça login para acessar configurações</h1>
          <a href="/login" className="mt-6 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 text-sm font-medium text-white hover:bg-blue-800 transition-colors">
            Entrar
          </a>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <FadeIn>
        <section className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 px-8 py-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <h1 className="relative text-2xl font-bold sm:text-3xl">Configurações da Conta</h1>
          <p className="relative mt-2 text-blue-200">Personalize sua experiência no portal</p>
        </section>
      </FadeIn>

      <SlideUp className="mt-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </SlideUp>

      <SlideUp className="mt-6">
        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-900" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-900" />
                  Sessões Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                          <Smartphone className="h-4 w-4 text-blue-900" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {session.device}
                            {session.current && (
                              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                Atual
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            IP: {session.ip} · {session.lastActive}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button variant="destructive" size="sm">
                          Encerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-900" />
                  Histórico de Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 font-medium">Data</th>
                        <th className="pb-2 font-medium">Dispositivo</th>
                        <th className="pb-2 font-medium">IP</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loginHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td className="py-2 text-gray-900">{entry.date}</td>
                          <td className="py-2 text-gray-600">{entry.device}</td>
                          <td className="py-2 text-gray-600">{entry.ip}</td>
                          <td className="py-2">
                            {entry.success ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                Sucesso
                              </span>
                            ) : (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                Falhou
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-blue-900" />
                  Tema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <ThemeOption
                    value="light"
                    icon={Sun}
                    label="Claro"
                    current={settings.theme}
                    onChange={(v) => saveSettings({ ...settings, theme: v })}
                  />
                  <ThemeOption
                    value="dark"
                    icon={Moon}
                    label="Escuro"
                    current={settings.theme}
                    onChange={(v) => saveSettings({ ...settings, theme: v })}
                  />
                  <ThemeOption
                    value="system"
                    icon={Monitor}
                    label="Sistema"
                    current={settings.theme}
                    onChange={(v) => saveSettings({ ...settings, theme: v })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-900" />
                  Idioma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "pt", label: "Português" },
                    { value: "en", label: "English" },
                    { value: "es", label: "Español" },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => saveSettings({ ...settings, language: lang.value })}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                        settings.language === lang.value
                          ? "border-blue-600 bg-blue-50 text-blue-900"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {lang.label}
                      {settings.language === lang.value && (
                        <Check className="mx-auto mt-1 h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-blue-900" />
                  Tamanho da Fonte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "small" as const, label: "Pequeno" },
                    { value: "normal" as const, label: "Normal" },
                    { value: "large" as const, label: "Grande" },
                  ].map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => saveSettings({ ...settings, fontSize: size.value })}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                        settings.fontSize === size.value
                          ? "border-blue-600 bg-blue-50 text-blue-900"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {size.label}
                      {settings.fontSize === size.value && (
                        <Check className="mx-auto mt-1 h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorSmartphone className="h-5 w-5 text-blue-900" />
                  Acessibilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleSetting
                  icon={MonitorSmartphone}
                  label="Movimento Reduzido"
                  description="Reduz animações e transições na interface"
                  checked={settings.reducedMotion}
                  onChange={(v) => saveSettings({ ...settings, reducedMotion: v })}
                />
                <ToggleSetting
                  icon={Eye}
                  label="Alto Contraste"
                  description="Aumenta o contraste para melhor legibilidade"
                  checked={settings.highContrast}
                  onChange={(v) => saveSettings({ ...settings, highContrast: v })}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-900" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ToggleSetting
                icon={Mail}
                label="Notificações por E-mail"
                description="Receba resumos e alertas importantes por e-mail"
                checked={settings.notifications.email}
                onChange={(v) =>
                  saveSettings({ ...settings, notifications: { ...settings.notifications, email: v } })
                }
              />
              <ToggleSetting
                icon={Bell}
                label="Notificações In-App"
                description="Receba notificações dentro da plataforma"
                checked={settings.notifications.inApp}
                onChange={(v) =>
                  saveSettings({ ...settings, notifications: { ...settings.notifications, inApp: v } })
                }
              />
              <ToggleSetting
                icon={Calendar}
                label="Eventos"
                description="Notificações sobre novos eventos e lembretes"
                checked={settings.notifications.events}
                onChange={(v) =>
                  saveSettings({ ...settings, notifications: { ...settings.notifications, events: v } })
                }
              />
              <ToggleSetting
                icon={BookOpen}
                label="Estudos"
                description="Atualizações sobre novos materiais de estudo"
                checked={settings.notifications.studies}
                onChange={(v) =>
                  saveSettings({ ...settings, notifications: { ...settings.notifications, studies: v } })
                }
              />
              <ToggleSetting
                icon={Newspaper}
                label="Notícias"
                description="Receba as últimas notícias da comunidade"
                checked={settings.notifications.news}
                onChange={(v) =>
                  saveSettings({ ...settings, notifications: { ...settings.notifications, news: v } })
                }
              />
              <ToggleSetting
                icon={Users}
                label="Comunidades"
                description="Atividades e discussões nas suas comunidades"
                checked={settings.notifications.communities}
                onChange={(v) =>
                  saveSettings({ ...settings, notifications: { ...settings.notifications, communities: v } })
                }
              />
              <ToggleSetting
                icon={Sparkles}
                label="Assistente IA"
                description="Sugestões e respostas do assistente inteligente"
                checked={settings.notifications.ai}
                onChange={(v) =>
                  saveSettings({ ...settings, notifications: { ...settings.notifications, ai: v } })
                }
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-900" />
                  Visibilidade do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      saveSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: "public" },
                      })
                    }
                    className={`rounded-lg border-2 p-4 text-center transition-all ${
                      settings.privacy.profileVisibility === "public"
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Globe className="mx-auto h-6 w-6 mb-2" />
                    <p className="text-sm font-medium">Público</p>
                    <p className="text-xs text-gray-500 mt-1">Qualquer pessoa pode ver seu perfil</p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: "private" },
                      })
                    }
                    className={`rounded-lg border-2 p-4 text-center transition-all ${
                      settings.privacy.profileVisibility === "private"
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Lock className="mx-auto h-6 w-6 mb-2" />
                    <p className="text-sm font-medium">Privado</p>
                    <p className="text-xs text-gray-500 mt-1">Apenas você pode ver seu perfil</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-900" />
                  Informações Visíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleSetting
                  icon={Mail}
                  label="Mostrar E-mail"
                  description="Exibir seu endereço de e-mail no perfil público"
                  checked={settings.privacy.showEmail}
                  onChange={(v) =>
                    saveSettings({ ...settings, privacy: { ...settings.privacy, showEmail: v } })
                  }
                />
                <ToggleSetting
                  icon={Smartphone}
                  label="Mostrar Telefone"
                  description="Exibir seu número de telefone no perfil público"
                  checked={settings.privacy.showPhone}
                  onChange={(v) =>
                    saveSettings({ ...settings, privacy: { ...settings.privacy, showPhone: v } })
                  }
                />
              </CardContent>
            </Card>
          </div>
        )}
      </SlideUp>

      {activeTab !== "security" && (
        <SlideUp className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Preferências"}
          </Button>
        </SlideUp>
      )}
    </div>
  );
}
