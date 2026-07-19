"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Plus, Trash2, Send } from "lucide-react";

export default function AIChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const utils = trpc.useUtils();

  const { data: conversations, isLoading: loadingConversations } = trpc.ai.listConversations.useQuery();

  const { data: conversation, isLoading: loadingConversation } = trpc.ai.getConversation.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  const createConversation = trpc.ai.createConversation.useMutation({
    onSuccess: (data) => {
      setSelectedConversationId(data.id);
      utils.ai.listConversations.invalidate();
    },
  });

  const sendMessage = trpc.ai.sendMessage.useMutation({
    onSuccess: () => {
      utils.ai.getConversation.invalidate({ conversationId: selectedConversationId! });
    },
  });

  const deleteConversation = trpc.ai.deleteConversation.useMutation({
    onSuccess: () => {
      setSelectedConversationId(null);
      utils.ai.listConversations.invalidate();
    },
  });

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    sendMessage.mutate({
      conversationId: selectedConversationId,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  const handleNewConversation = () => {
    createConversation.mutate({ title: "Nova conversa" });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-72 flex-shrink-0 border-r bg-white overflow-y-auto">
        <div className="flex h-full flex-col p-3">
          <Button onClick={handleNewConversation} className="mb-3 w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Conversa
          </Button>
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-gray-200" />
                ))}
              </div>
            ) : conversations && conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                      selectedConversationId === conv.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <span className="truncate">{conv.title || "Sem título"}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation.mutate({ conversationId: conv.id });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-4 text-center text-sm text-gray-500">Nenhuma conversa</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {selectedConversationId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingConversation ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
                  ))}
                </div>
              ) : conversation?.messages && conversation.messages.length > 0 ? (
                <div className="space-y-4">
                  {conversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">Envie uma mensagem para iniciar a conversa.</p>
                </div>
              )}
            </div>

            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={sendMessage.isPending}
                />
                <Button onClick={handleSend} disabled={!newMessage.trim() || sendMessage.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Brain className="h-16 w-16 text-blue-300" />
            <h2 className="text-xl font-semibold text-gray-700">Assistente IA</h2>
            <p className="text-center text-gray-500">
              Crie uma nova conversa ou selecione uma existente para começar.
            </p>
            <Button onClick={handleNewConversation}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conversa
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
