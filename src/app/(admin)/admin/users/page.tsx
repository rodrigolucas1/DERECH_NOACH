"use client";

import { useState } from "react";
import { Plus, Shield, UserCheck, UserX, Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  MEMBER: "Membro",
  LEADER: "Líder",
  ADMIN: "Admin",
};

type Member = {
  id: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
  };
};

export default function AdminUsersPage() {
  const utils = trpc.useUtils();

  const { data: members, isLoading } = trpc.admin.listUsers.useQuery();

  const createUser = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      utils.admin.listUsers.invalidate();
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", role: "MEMBER" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar usuário.");
    },
  });

  const updateUserRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Papel atualizado com sucesso!");
      utils.admin.listUsers.invalidate();
      setEditOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar papel.");
    },
  });

  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.admin.listUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status.");
    },
  });

  const deactivateUser = trpc.admin.deactivateUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário desativado com sucesso!");
      utils.admin.listUsers.invalidate();
      setDeleteOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao desativar usuário.");
    },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER" as "ADMIN" | "MEMBER" | "LEADER",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editRole, setEditRole] = useState("MEMBER");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const handleEdit = (member: Member) => {
    setEditMember(member);
    setEditRole(member.role);
    setEditOpen(true);
  };

  const handleDelete = (member: Member) => {
    setDeleteMember(member);
    setDeleteOpen(true);
  };

  const handleToggleActive = (member: Member) => {
    updateUser.mutate({
      userId: member.userId,
      isActive: !member.user.isActive,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500">
            Gerencie os usuários da plataforma
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
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
                <th className="px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : !members?.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(member)}
                          className={member.user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          {member.user.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">E-mail</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Senha</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select value={createForm.role} onValueChange={(value) => setCreateForm({ ...createForm, role: (value ?? "MEMBER") as "ADMIN" | "MEMBER" | "LEADER" })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                  <SelectItem value="LEADER">Líder</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createUser.mutate(createForm)}
              disabled={createUser.isPending}
            >
              {createUser.isPending ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Papel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Editando papel de <strong>{editMember?.user.name ?? editMember?.user.email}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value ?? "MEMBER")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                  <SelectItem value="LEADER">Líder</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editMember) {
                  updateUserRole.mutate({
                    userId: editMember.userId,
                    role: editRole as "MEMBER" | "LEADER" | "ADMIN",
                  });
                }
              }}
              disabled={updateUserRole.isPending}
            >
              {updateUserRole.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Desativação</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tem certeza que deseja desativar o usuário{" "}
            <strong>{deleteMember?.user.name ?? deleteMember?.user.email}</strong>?
            Ele não poderá mais acessar a plataforma.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteMember) {
                  deactivateUser.mutate({ userId: deleteMember.userId });
                }
              }}
              disabled={deactivateUser.isPending}
            >
              {deactivateUser.isPending ? "Desativando..." : "Desativar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
