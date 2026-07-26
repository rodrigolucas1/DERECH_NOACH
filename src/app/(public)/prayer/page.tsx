"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FadeIn, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { Heart, Plus, MessageCircle, Clock, Send } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "Todas" },
  { value: "GENERAL", label: "Geral" },
  { value: "HEALTH", label: "Saúde" },
  { value: "FAMILY", label: "Família" },
  { value: "SHALOM", label: "Shalom" },
  { value: "PARNASSA", label: "Parnassá" },
  { value: "STUDY", label: "Estudo" },
  { value: "COMMUNITY", label: "Comunidade" },
];

function PrayerSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function PrayerContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");
  const [newIsAnonymous, setNewIsAnonymous] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const utils = trpc.useUtils();

  const { data: prayerRequests, isLoading } = trpc.prayer.list.useQuery();

  const createPrayer = trpc.prayer.create.useMutation({
    onSuccess: () => {
      utils.prayer.list.invalidate();
      setShowCreateDialog(false);
      setNewTitle("");
      setNewDescription("");
      setNewCategory("GENERAL");
    },
  });

  const respondToPrayer = trpc.prayer.respond.useMutation({
    onSuccess: () => {
      utils.prayer.list.invalidate();
      setRespondingTo(null);
      setResponseText("");
    },
  });

  const filtered =
    activeCategory === "all"
      ? prayerRequests
      : prayerRequests?.filter((r) => r.category === activeCategory);

  const handleCreate = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    createPrayer.mutate({
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory as any,
      isAnonymous: newIsAnonymous,
    });
  };

  const handleRespond = () => {
    if (!respondingTo || !responseText.trim()) return;
    respondToPrayer.mutate({
      requestId: respondingTo,
      message: responseText.trim(),
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos de Oração</h1>
            <p className="mt-2 text-gray-600">Compartilhe e ore uns pelos outros</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Pedido
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1} className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
              activeCategory === cat.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </FadeIn>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !filtered?.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhum pedido de oração</p>
        </div>
      ) : (
        <StaggerContainer className="space-y-4">
          {filtered.map((req) => (
            <StaggerItem key={req.id}>
              <AnimatedCard className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900">{req.title}</h2>
                      {req.category && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {CATEGORIES.find((c) => c.value === req.category)?.label ?? req.category}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-gray-600">{req.description}</p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                      <span>{req.isAnonymous ? "Anônimo" : req.user?.name ?? "Anônimo"}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {req._count?.responses ?? 0}{" "}
                        {(req._count?.responses ?? 0) === 1 ? "resposta" : "respostas"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {respondingTo === req.id ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Sua oração..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleRespond();
                          }
                        }}
                        disabled={respondToPrayer.isPending}
                      />
                      <Button
                        size="sm"
                        onClick={handleRespond}
                        disabled={!responseText.trim() || respondToPrayer.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseText("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRespondingTo(req.id)}
                    >
                      <MessageCircle className="mr-2 h-3.5 w-3.5" />
                      Responder
                    </Button>
                  )}
                </div>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Pedido de Oração</DialogTitle>
            <DialogDescription>
              Compartilhe seu pedido com a comunidade.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="prayer-title">Título</Label>
              <Input
                id="prayer-title"
                placeholder="Ex: Oração pela saúde"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prayer-description">Descrição</Label>
              <textarea
                id="prayer-description"
                placeholder="Descreva seu pedido de oração..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={4}
                className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setNewCategory(cat.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      newCategory === cat.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || !newDescription.trim() || createPrayer.isPending}
            >
              <Heart className="mr-2 h-4 w-4" />
              Enviar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PrayerPage() {
  return (
    <Suspense fallback={<PrayerSkeleton />}>
      <PrayerContent />
    </Suspense>
  );
}
