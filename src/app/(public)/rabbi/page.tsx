"use client";

import { Suspense, useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { useAuth } from "@/client/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { HelpCircle, Send, LogIn } from "lucide-react";

const categories = ["Halachá", "Torá", "Ética", "Espiritualidade", "Outro"];

function RabbiSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function QuestionForm({ onSuccess }: { onSuccess: () => void }) {
  const { isAuthenticated, signIn } = useAuth();
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = trpc.rabbi.submitQuestion.useMutation({
    onSuccess: () => {
      toast.success("Pergunta enviada com sucesso! Aguarde a resposta do Rabino.");
      setTitle("");
      setQuestion("");
      setCategory("");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar pergunta. Tente novamente.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <LogIn className="h-10 w-10 text-gray-400" />
          <div className="text-center">
            <p className="text-gray-700 font-medium">Faça login para enviar uma pergunta</p>
            <p className="text-sm text-gray-500 mt-1">
              Você precisa estar autenticado para perguntar ao Rabino.
            </p>
          </div>
          <Button onClick={() => signIn()} variant="default">
            Entrar
          </Button>
        </CardContent>
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    submitMutation.mutate({ title, question, category: category || undefined });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Pergunta</CardTitle>
        <CardDescription>
          Preencha o formulário abaixo para enviar sua pergunta ao Rabino.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Resumo da sua pergunta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Pergunta</Label>
            <textarea
              id="question"
              placeholder="Descreva sua pergunta em detalhes..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              minLength={10}
              rows={5}
              className="flex w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Send className="h-4 w-4" />
            {isSubmitting ? "Enviando..." : "Enviar Pergunta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PublicQuestionsList() {
  const { data: questions, isLoading } = trpc.rabbi.publicQuestions.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <HelpCircle className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-gray-500">Nenhuma pergunta publicada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle>{q.title}</CardTitle>
            <CardDescription>
              {q.category && (
                <span className="mr-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {q.category}
                </span>
              )}
              {new Date(q.createdAt).toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {q.answers.length > 0 ? (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  {q.answers[0].rabbi?.name}
                </p>
                <p className="mt-1 text-sm text-gray-600">{q.answers[0].answer}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Aguardando resposta do Rabino.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RabbiPageContent() {
  const utils = trpc.useUtils();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pergunte ao Rabino</h1>
        <p className="mt-2 text-gray-600">
          Envie suas perguntas e receba respostas de nossos Rabinos
        </p>
      </div>

      <div className="space-y-8">
        <QuestionForm
          onSuccess={() => utils.rabbi.publicQuestions.invalidate()}
        />

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Perguntas Respondidas</h2>
          <PublicQuestionsList />
        </div>
      </div>
    </div>
  );
}

export default function RabbiPage() {
  return (
    <Suspense fallback={<RabbiSkeleton />}>
      <RabbiPageContent />
    </Suspense>
  );
}
