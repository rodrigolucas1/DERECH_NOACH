"use client";

import { Plus, Shield, UserCheck, UserX } from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";

const roleLabels: Record<string, string> = {
  MEMBER: "Membro",
  LEADER: "Líder",
  ADMIN: "Admin",
};

export default function AdminUsersPage() {
  const { data: members, isLoading } = trpc.admin.listUsers.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500">
            Gerencie os usuários da plataforma
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Nome</th>
                <th className="px-4 py-3 font-medium text-gray-500">E-mail</th>
                <th className="px-4 py-3 font-medium text-gray-500">Papel</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Último Login</th>
                <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : !members?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                          {member.user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <span className="font-medium">{member.user.name ?? "Sem nome"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{member.user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <Shield className="h-3 w-3" />
                        {roleLabels[member.role] ?? member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {member.user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <UserCheck className="h-4 w-4" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <UserX className="h-4 w-4" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {member.user.lastLoginAt
                        ? new Date(member.user.lastLoginAt).toLocaleDateString("pt-BR")
                        : "Nunca"}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
