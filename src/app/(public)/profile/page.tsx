"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  BookOpen,
  MessageCircle,
  Search,
  Loader2,
  Save,
  Camera,
  Clock,
  Globe,
} from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { ImageUpload } from "@/client/components/ImageUpload";
import { ImageCropModal } from "@/client/components/ImageCropModal";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileForm {
  name: string;
  socialName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  preferredLanguage: string;
  image: string;
}

interface RecentActivity {
  id: string;
  type: "study" | "event" | "search";
  title: string;
  date: string;
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="flex items-center gap-6 mb-8">
        <div className="h-24 w-24 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 rounded-lg bg-gray-200" />
        <div className="h-24 rounded-lg bg-gray-200" />
        <div className="h-24 rounded-lg bg-gray-200" />
        <div className="h-24 rounded-lg bg-gray-200" />
      </div>
      <div className="mt-8 space-y-4">
        <div className="h-10 w-full rounded bg-gray-200" />
        <div className="h-10 w-full rounded bg-gray-200" />
        <div className="h-10 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const icon =
    activity.type === "study" ? (
      <BookOpen className="h-4 w-4" />
    ) : activity.type === "event" ? (
      <Calendar className="h-4 w-4" />
    ) : (
      <Search className="h-4 w-4" />
    );

  const label =
    activity.type === "study"
      ? "Estudo"
      : activity.type === "event"
        ? "Evento"
        : "Busca";

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-900">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{activity.date}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);

  const { data: meData, isLoading: meLoading } = trpc.auth.me.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const { data: favData } = trpc.favorite.list.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onSettled: () => setSaving(false),
  });

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    socialName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "Brasil",
    bio: "",
    preferredLanguage: "pt",
    image: "",
  });

  useEffect(() => {
    if (meData) {
      setForm((prev) => ({
        ...prev,
        name: meData.name || "",
        email: meData.email || "",
        phone: meData.phone || "",
        bio: meData.bio || "",
        image: meData.image || "",
      }));
    }
  }, [meData]);

  const [recentActivity] = useState<RecentActivity[]>([
    { id: "1", type: "study", title: "As Sete Leis de Noé - Introdução", date: "Hoje" },
    { id: "2", type: "event", title: "Encontro Comunitário Shavuot", date: "2 dias atrás" },
    { id: "3", type: "search", title: "O que é Bnei Noach?", date: "3 dias atrás" },
    { id: "4", type: "study", title: "Comentários do Rambam sobre idolatria", date: "4 dias atrás" },
    { id: "5", type: "event", title: "Shabat Comunitário Virtual", date: "1 semana atrás" },
  ]);

  const favoritesCount = favData?.favorites?.length ?? 0;

  const activityStats = [
    { icon: Heart, label: "Favoritos", value: favoritesCount, color: "text-red-500 bg-red-50" },
    { icon: Calendar, label: "Eventos", value: 3, color: "text-blue-500 bg-blue-50" },
    { icon: BookOpen, label: "Estudos", value: 12, color: "text-green-500 bg-green-50" },
    { icon: MessageCircle, label: "Posts no Fórum", value: 7, color: "text-purple-500 bg-purple-50" },
  ];

  function updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        name: form.name,
        phone: form.phone,
        bio: form.bio,
      });
    } catch {
      setSaving(false);
    }
  }

  if (status === "loading" || meLoading) {
    return <ProfileSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <FadeIn>
          <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Faça login para ver seu perfil</h1>
          <p className="mt-2 text-gray-600">
            Você precisa estar autenticado para acessar esta página.
          </p>
          <a href="/login" className="mt-6 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 text-sm font-medium text-white hover:bg-blue-800 transition-colors">
            Entrar
          </a>
        </FadeIn>
      </div>
    );
  }

  const memberSince = meData?.createdAt
    ? new Date(meData.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <FadeIn>
        <section className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 px-8 py-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden ring-4 ring-white/30">
                {form.image ? (
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-white/60" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <ImageUpload
                  value={form.image}
                  onChange={(url) => {
                    if (url && url !== form.image) {
                      setPendingImageSrc(url);
                      setCropOpen(true);
                    } else {
                      updateField("image", url);
                    }
                  }}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  label=""
                />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{form.name || "Meu Perfil"}</h1>
              <p className="text-blue-200">{form.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {meData?.tenantMembers?.map((tm) => (
                  <span
                    key={tm.tenant.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium"
                  >
                    {tm.role} · {tm.tenant.name}
                  </span>
                ))}
              </div>
              <p className="mt-2 flex items-center justify-center sm:justify-start gap-1 text-xs text-blue-300">
                <Calendar className="h-3 w-3" />
                Membro desde {memberSince}
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      <SlideUp className="mt-8">
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activityStats.map((stat) => (
            <StaggerItem key={stat.label}>
              <Card className="text-center">
                <CardContent className="pt-4">
                  <div className={`mx-auto inline-flex rounded-full p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SlideUp>

      <SlideUp className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-900" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialName">Nome Social</Label>
                <Input
                  id="socialName"
                  value={form.socialName}
                  onChange={(e) => updateField("socialName", e.target.value)}
                  placeholder="Nome social (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-3 w-3 mr-1" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  value={form.email}
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-3 w-3 mr-1" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">
                  <MapPin className="inline h-3 w-3 mr-1" />
                  Cidade
                </Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Sua cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="UF"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">
                  <Globe className="inline h-3 w-3 mr-1" />
                  País
                </Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="Brasil"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma Preferido</Label>
                <select
                  id="language"
                  value={form.preferredLanguage}
                  onChange={(e) => updateField("preferredLanguage", e.target.value)}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="he">עברית</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Conte um pouco sobre você..."
                className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{form.bio.length}/500</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : saved ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </SlideUp>

      <SlideUp className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-900" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </SlideUp>

      <ImageCropModal
        open={cropOpen}
        onClose={() => { setCropOpen(false); setPendingImageSrc(null); }}
        onConfirm={(cropped) => { updateField("image", cropped); setCropOpen(false); setPendingImageSrc(null); }}
        imageSrc={pendingImageSrc ?? ""}
        aspectRatio={1}
      />
    </div>
  );
}
