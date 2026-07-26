"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { MessageSquare, Check, X, Trash2 } from "lucide-react";

export default function AdminNewsCommentsPage() {
  const utils = trpc.useUtils();
  const { data: comments, isLoading } = trpc.newsComment.listPending.useQuery();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const approveMutation = trpc.newsComment.approve.useMutation({
    onSuccess: () => { toast.success("Comentário aprovado!"); utils.newsComment.listPending.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const rejectMutation = trpc.newsComment.reject.useMutation({
    onSuccess: () => { toast.success("Comentário rejeitado!"); utils.newsComment.listPending.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.newsComment.delete.useMutation({
    onSuccess: () => { toast.success("Comentário removido!"); utils.newsComment.listPending.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderação de Comentários"
        description="Gerencie e modere comentários pendentes das notícias"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      ) : !comments?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">Nenhum comentário pendente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {comments?.map((comment: any) => (
            <Card key={comment.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {comment.user?.name ?? "Anônimo"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">Pendente</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Artigo: {comment.article?.title ?? "—"} • {new Date(comment.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">{comment.content}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => approveMutation.mutate({ id: comment.id })}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => rejectMutation.mutate({ id: comment.id })}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(comment.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover comentário"
        description="Tem certeza que deseja remover este comentário? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
