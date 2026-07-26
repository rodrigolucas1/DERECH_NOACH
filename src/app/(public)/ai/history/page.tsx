"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { MessageSquare, Plus, Trash2, ArrowLeft, Clock, Hash } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
}

function HistorySkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-40 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function HistoryContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8">
        <Link
          href="/ai"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Chat
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico de Conversas</h1>
            <p className="mt-2 text-gray-600">Todas as suas conversas com o assistente IA</p>
          </div>
          <Link href="/ai">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conversa
            </Button>
          </Link>
        </div>
      </FadeIn>

      {conversations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border bg-white p-12 text-center"
        >
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">Nenhuma conversa ainda</p>
          <p className="mt-1 text-sm text-gray-400">
            Inicie uma nova conversa com o assistente IA
          </p>
          <Link href="/ai" className="mt-6 inline-block">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conversa
            </Button>
          </Link>
        </motion.div>
      ) : (
        <StaggerContainer className="space-y-3">
          {conversations.map((conv) => (
            <StaggerItem key={conv.id}>
              <AnimatedCard className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                    className="flex flex-1 items-start gap-4 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{conv.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(conv.createdAt).toLocaleDateString("pt-BR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {conv.messageCount} {conv.messageCount === 1 ? "mensagem" : "mensagens"}
                        </span>
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(conv.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {expandedId === conv.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border-t pt-4"
                  >
                    <p className="text-sm text-gray-500">
                      Clique para visualizar esta conversa no chat.
                    </p>
                    <Link href="/ai" className="mt-2 inline-block">
                      <Button variant="outline" size="sm">
                        Abrir Conversa
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}

export default function AIHistoryPage() {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <HistoryContent />
    </Suspense>
  );
}
