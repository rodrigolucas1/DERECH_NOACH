# Manual do Desenvolvedor — Projeto DERECH NOACH

Guia completo para desenvolvedores que trabalham na plataforma.

---

## Estrutura do Projeto

```
DERECH_NOACH/
├── prisma/
│   ├── schema.prisma        # Schema do banco (61 modelos)
│   ├── seed.ts              # Dados iniciais
│   ├── config.ts            # Configuração Prisma
│   └── migrations/          # Migrações do banco
├── src/
│   ├── app/                 # Rotas Next.js (App Router)
│   │   ├── layout.tsx       # Layout raiz (providers)
│   │   ├── globals.css      # Estilos globais
│   │   ├── (public)/        # Páginas públicas (com Header/Footer)
│   │   ├── (auth)/          # Páginas de autenticação
│   │   ├── (admin)/         # Painel administrativo
│   │   └── api/             # Endpoints de API
│   ├── client/              # Código do cliente
│   │   ├── components/      # Componentes React
│   │   │   ├── layout/      # Header, Sidebar, Footer
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── TRPCProvider.tsx
│   │   │   └── BrandingProvider.tsx
│   │   ├── hooks/           # Hooks customizados
│   │   │   ├── useAuth.ts
│   │   │   └── useTenant.ts
│   │   └── lib/
│   │       └── trpc.ts      # Cliente tRPC
│   ├── server/              # Código do servidor
│   │   ├── db/
│   │   │   └── client.ts    # Singleton Prisma
│   │   ├── trpc/
│   │   │   ├── context.ts   # Contexto tRPC
│   │   │   ├── router.ts    # Router principal
│   │   │   └── routers/     # 13 sub-routers
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   └── utils/
│   │       ├── permissions.ts
│   │       └── tenant-resolver.ts
│   ├── components/ui/       # shadcn/ui
│   ├── lib/
│   │   └── utils.ts         # cn() helper
│   └── types/
│       ├── index.ts
│       ├── roles.ts
│       └── tenancy.ts
├── docs/                    # Documentação
├── scripts/                 # Scripts utilitários
├── public/                  # Arquivos estáticos
└── tests/                   # Testes
```

---

## Convenções de Código

### Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivos de componente | PascalCase | `ImageUpload.tsx` |
| Arquivos utilitários | camelCase | `tenant-resolver.ts` |
| Pastas de rotas | lowercase | `(public)`, `(admin)` |
| Variáveis | camelCase | `tenantId`, `userId` |
| Funções | camelCase | `resolveTenant()` |
| Componentes React | PascalCase | `AuthProvider` |
| Tabelas Prisma | PascalCase | `TzedakaCampaign` |
| Colunas Prisma | camelCase | `tenantId`, `createdAt` |
| Enums Prisma | PascalCase | `CampaignStatus` |
| Variáveis de ambiente | UPPER_SNAKE_CASE | `DATABASE_URL` |

### Padrão de Arquivo de Componente

```tsx
"use client"; // Se usar hooks ou interatividade

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MeuComponente() {
  // 1. Hooks
  // 2. Estado
  // 3. Mutations tRPC
  // 4. Queries tRPC
  // 5. Handlers
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Padrão de Página Admin

```tsx
"use client";

import { useState } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminMinhaPagina() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.meuRouter.listAll.useQuery();
  
  const createMutation = trpc.meuRouter.create.useMutation({
    onSuccess: () => {
      toast.success("Criado com sucesso!");
      utils.meuRouter.listAll.invalidate();
      setShowForm(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  // ... form state

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Título</h1>
          <p className="text-sm text-gray-500">Descrição</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          Novo Item
        </Button>
      </div>

      {showForm && (
        {/* Formulário */}
      )}

      {/* Tabela de dados */}
    </div>
  );
}
```

---

## Criando um Novo Router tRPC

### 1. Criar o arquivo do router

```typescript
// src/server/trpc/routers/meu-router.ts
import { z } from "zod";
import { router, tenantProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const meuModelInput = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const meuRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];
    return db.meuModel.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: adminProcedure(["ADMIN"])
    .input(meuModelInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");
      return db.meuModel.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await db.meuModel.findUnique({ where: { id: input.id } });
      if (!item || item.tenantId !== ctx.tenantId) {
        throw new Error("Acesso negado.");
      }
      return db.meuModel.delete({ where: { id: input.id } });
    }),
});
```

### 2. Registrar no router principal

```typescript
// src/server/trpc/router.ts
import { meuRouter } from "./routers/meu-router";

export const appRouter = router({
  // ... outros routers
  meu: meuRouter,
});
```

### 3. Criar a página admin

Crie a página em `src/app/(admin)/admin/meu-modulo/page.tsx` seguindo o padrão acima.

---

## Fluxo de Alteração do Schema

1. Editar `prisma/schema.prisma`
2. Rodar `npm run db:migrate` para criar a migração
3. Rodar `npx prisma generate` para atualizar o Prisma Client
4. Atualizar routers tRPC conforme necessário
5. Testar as queries

```bash
# Criar migração
npx prisma migrate dev --name descricao_da_mudanca

# Gerar cliente
npx prisma generate

# Sincronizar sem criar migração (dev apenas)
npx prisma db push
```

---

## Padrões de Hooks

### useAuth

```tsx
import { useAuth } from "@/client/hooks/useAuth";

function MeuComponente() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  // ...
}
```

### useTenant

```tsx
import { useTenant } from "@/client/hooks/useTenant";

function MeuComponente() {
  const { tenant, tenantId, tenantSlug } = useTenant();
  // ...
}
```

---

## Trabalhando com o tRPC no Cliente

```tsx
import { trpc } from "@/client/lib/trpc";

function MeuComponente() {
  // Query
  const { data, isLoading, error } = trpc.community.list.useQuery();
  
  // Mutation
  const mutation = trpc.community.create.useMutation({
    onSuccess: () => { /* invalidar cache */ },
    onError: (e) => toast.error(e.message),
  });
  
  // Chamar mutation
  mutation.mutate({ name: "Nova Comunidade", slug: "nova", city: "BH", state: "MG" });
  
  // Verificar estado
  if (mutation.isPending) return <span>Salvando...</span>;
}
```

---

## Git Workflow

### Commits

Usar mensagens descritivas em Português:

```
feat: Adiciona módulo de certificados
fix: Corrige renderização de Decimal no admin
docs: Atualiza manual de instalação
refactor: Melhora performance das queries de eventos
security: Adiciona rate limiting nas APIs públicas
```

### Branches

- `main` — Produção
- `develop` — Desenvolvimento
- `feature/nome-da-feature` — Features
- `fix/nome-do-fix` — Correções

---

## Componentes Reutilizáveis (shadcn/ui)

A projeto usa shadcn/ui com estilo `base-nova`. Componentes disponíveis em `src/components/ui/`:

- `Button` — Botões com variantes
- `Card` — Cards de conteúdo
- `Input` — Campos de entrada
- `Label` — Rótulos
- `Dialog` — Modais
- `DropdownMenu` — Menus suspensos
- `Tabs` — Abas
- `Tooltip` — Dicas
- `Avatar` — Avatares
- `Separator` — Divisórias
- `Select` — Seleções
- `Sonner` — Toast notifications

Para adicionar novos componentes:

```bash
npx shadcn@latest add nome-do-componente
```

---

## Multi-Tenant: Padrões

### No Servidor (tRPC)

```typescript
// Todas as queries devem filtrar por tenantId
const items = await db.meuModel.findMany({
  where: { tenantId: ctx.tenantId },
});

// Todas as mutations devem verificar tenantId
const item = await db.meuModel.findUnique({ where: { id } });
if (!item || item.tenantId !== ctx.tenantId) {
  throw new Error("Acesso negado.");
}
```

### No Cliente

```tsx
// O tenant é resolvido automaticamente pelo middleware
// Não é necessário passar tenantId nas queries tRPC
const { data } = trpc.community.list.useQuery();
```

---

*Manual atualizado em Julho 2026.*
