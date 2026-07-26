"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { DataTable } from "@/client/components/ui/DataTable";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Heart, Eye, Trash2, ArrowLeft } from "lucide-react";

const statusLabels: Record<string, string> = {
  OPEN: "Aberto",
  ANSWERED: "Atendido",
  CLOSED: "Fechado",
};

export default function AdminPrayerPage() {
  const utils = trpc.useUtils();
  const { data: prayers, isLoading } = trpc.prayer.listPending.useQuery();
  const [filter, setFilter] = useState<string>("ALL");
  const [viewResponsesId, setViewResponsesId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: prayerDetail } = trpc.prayer.get.useQuery(
    { id: viewResponsesId! },
    { enabled: !!viewResponsesId }
  );

  const updateStatus = trpc.prayer.update.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); utils.prayer.listPending.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.prayer.delete.useMutation({
    onSuccess: () => { toast.success("Pedido removido!"); utils.prayer.listPending.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = prayers?.filter((p: any) => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  const deleteItem = prayers?.find((p: any) => p.id === deleteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de Ora\u00e7\u00e3o"
        description={viewResponsesId ? `Respostas \u2014 ${prayerDetail?.title ?? ""}` : "Gerencie pedidos de oração da comunidade"}
        action={
          viewResponsesId ? (
            <Button variant="outline" onClick={() => setViewResponsesId(null)}>
              <ArrowLeft className="mr-2 h-4 w-4" />Voltar
            </Button>
          ) : undefined
        }
      />

      {!viewResponsesId && (
        <div className="flex gap-2">
          {(["ALL", "OPEN", "ANSWERED", "CLOSED"] as string[]).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f === "ALL" ? "Todos" : f === "OPEN" ? "Abertos" : f === "ANSWERED" ? "Atendidos" : "Fechados"}
            </Button>
          ))}
        </div>
      )}

      {viewResponsesId ? (
        prayerDetail?.responses?.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">Nenhuma resposta encontrada</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {prayerDetail?.responses?.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.user?.name ?? "An\u00f4nimo"}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{r.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <DataTable
          data={filtered}
          isLoading={isLoading}
          emptyIcon={<Heart className="h-10 w-10" />}
          emptyTitle="Nenhum pedido de oração"
          keyExtractor={(p: any) => p.id}
          columns={[
            { key: "title", header: "T\u00edtulo", render: (p: any) => <span className="font-medium">{p.title}</span> },
            { key: "user", header: "Usu\u00e1rio", render: (p: any) => <span className="text-gray-500">{p.isAnonymous ? "An\u00f4nimo" : (p.user?.name ?? "\u2014")}</span> },
            { key: "category", header: "Categoria", render: (p: any) => <span className="text-gray-500">{p.category ?? "\u2014"}</span> },
            { key: "status", header: "Status", render: (p: any) => (
              <select value={p.status} onChange={(e) => updateStatus.mutate({ id: p.id, status: e.target.value as any })}
                className="rounded border px-2 py-1 text-xs">
                {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            )},
            { key: "responses", header: "Respostas", render: (p: any) => <span className="text-gray-500">{p._count?.responses ?? 0}</span> },
          ]}
          actions={(p: any) => (
            <>
              <Button variant="ghost" size="sm" onClick={() => setViewResponsesId(p.id)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover pedido de oração"
        description={`Tem certeza que deseja remover "${deleteItem?.title ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); setDeleteId(null); }}
      />
    </div>
  );
}
