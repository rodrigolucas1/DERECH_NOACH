"use client";

import { useState } from "react";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";

const actionLabels: Record<string, string> = {
  CREATE: "Criar",
  UPDATE: "Atualizar",
  DELETE: "Excluir",
  LOGIN: "Login",
  LOGOUT: "Logout",
  VIEW: "Visualizar",
  EXPORT: "Exportar",
};

const actionBadgeColors: Record<string, string> = {
  CREATE: "bg-green-50 text-green-700",
  UPDATE: "bg-yellow-50 text-yellow-700",
  DELETE: "bg-red-50 text-red-700",
  LOGIN: "bg-blue-50 text-blue-700",
  LOGOUT: "bg-gray-100 text-gray-700",
  VIEW: "bg-purple-50 text-purple-700",
  EXPORT: "bg-orange-50 text-orange-700",
};

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState("");
  const pageSize = 20;

  const { data, isLoading } = trpc.audit.listLogs.useQuery({
    page,
    pageSize,
    action: (actionFilter as any) || undefined,
    entityType: entityFilter || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auditoria</h1>
        <p className="text-sm text-gray-500">
          Histórico de ações realizadas na plataforma
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="">Todas as ações</option>
          {Object.entries(actionLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filtrar por entidade..."
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border bg-white px-3 py-2 text-sm text-gray-700"
        />
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Ação</th>
                <th className="px-4 py-3 font-medium text-gray-500">Entidade</th>
                <th className="px-4 py-3 font-medium text-gray-500">ID da Entidade</th>
                <th className="px-4 py-3 font-medium text-gray-500">Usuário</th>
                <th className="px-4 py-3 font-medium text-gray-500">Detalhes</th>
                <th className="px-4 py-3 font-medium text-gray-500">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : !data?.logs?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${actionBadgeColors[log.action] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        <Shield className="h-3 w-3" />
                        {actionLabels[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {log.entityType}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {log.entityId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {log.user?.name ?? log.user?.email ?? "Sistema"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {log.newValues ? (
                        <span className="line-clamp-1 max-w-[200px] text-xs">
                          {log.newValues}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages} — {data?.total ?? 0} registros
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
