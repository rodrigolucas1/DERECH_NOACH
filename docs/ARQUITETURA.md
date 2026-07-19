# Documentação Técnica — Arquitetura do Projeto DERECH NOACH

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE                            │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐    │
│  │ Browser  │  │ Mobile   │  │ Admin Panel         │    │
│  └────┬─────┘  └────┬─────┘  └─────────┬───────────┘    │
│       │              │                  │                │
│       └──────────────┼──────────────────┘                │
│                      │                                   │
│              ┌───────▼────────┐                          │
│              │  Next.js 16    │                          │
│              │  (App Router)  │                          │
│              └───────┬────────┘                          │
│                      │                                   │
│       ┌──────────────┼──────────────┐                   │
│       │              │              │                   │
│  ┌────▼────┐  ┌──────▼──────┐  ┌───▼──────┐            │
│  │ React   │  │  tRPC       │  │  API     │            │
│  │ SSR/SSG │  │  Client     │  │  Routes  │            │
│  └─────────┘  └──────┬──────┘  └───┬──────┘            │
│                      │              │                   │
└──────────────────────┼──────────────┼───────────────────┘
                       │              │
              ┌────────▼──────────────▼────────┐
              │         SERVIDOR               │
              │                                │
              │  ┌──────────┐  ┌──────────┐   │
              │  │ tRPC     │  │  Auth    │   │
              │  │ Router   │  │  (JWT)   │   │
              │  └────┬─────┘  └──────────┘   │
              │       │                       │
              │  ┌────▼─────────────────────┐ │
              │  │    Prisma Client         │ │
              │  │    (with PG adapter)     │ │
              │  └────┬────────────────────┘ │
              │       │                       │
              └───────┼───────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼────┐  ┌────▼────┐  ┌───▼────┐
    │PostgreSQL│  │  Redis  │  │  File  │
    │   16    │  │   7     │  │ System │
    └─────────┘  └─────────┘  └────────┘
```

---

## Multi-Tenancy

### Estratégia: Shared Database, Shared Schema

Todos os dados são armazenados em tabelas compartilhadas com coluna `tenantId`.

### Fluxo de Resolução do Tenant

```
Requisição HTTP
     │
     ▼
Middleware (Next.js)
     │
     ├─ Extrair subdomínio: mg.bneinoach.org → "mg"
     │  ou
     ├─ Ler header: x-tenant-id (desenvolvimento)
     │
     ▼
Rewrite URL: /events → /mg/events
     │
     ▼
tRPC Context
     │
     ├─ resolveTenant(slug) → tenantId
     │
     ▼
Router tRPC
     │
     ├─ Filtrar queries por tenantId
     │
     ▼
Prisma Client
     │
     ├─ WHERE tenantId = 'xxx'
     │
     ▼
PostgreSQL
```

### Isolamento de Dados

Cada tabela com dados multi-tenant possui:
- Coluna `tenantId` (String, obrigatória)
- Índice em `tenantId` para performance
- Foreign key para tabela `Tenant`

---

## Autenticação

### Fluxo de Login

```
Usuário → /login → Credenciais (email + senha)
     │
     ▼
NextAuth Credentials Provider
     │
     ├─ Buscar usuário por email
     ├─ Verificar senha (bcryptjs)
     ├─ Atualizar lastLoginAt
     │
     ▼
JWT Token gerado
     │
     ├─ user.id armazenado no JWT
     │
     ▼
Session Callback
     │
     ├─ user.id exposto ao cliente
     │
     ▼
useAuth() hook
     │
     ├─ isAuthenticated = true
     ├─ user.id disponível
```

### Fluxo de Registro

```
Usuário → /register → name, email, password
     │
     ▼
POST /api/auth/register
     │
     ├─ Validar entrada (Zod)
     ├─ Verificar email duplicado
     ├─ Hash senha (bcryptjs)
     ├─ Criar usuário no banco
     │
     ▼
Resposta: sucesso/erro
```

---

## Autorização (RBAC)

### Hierarquia de Papéis

```
SUPER_ADMIN (level 3)
     │
     ├── Acesso total a todos os tenants
     │
ADMIN (level 2)
     │
     ├── Gerenciar comunidades
     ├── Gerenciar eventos
     ├── Gerenciar estudos
     ├── Gerenciar usuários
     ├── Gerenciar configurações
     │
LEADER (level 1)
     │
     ├── Criar/editar eventos
     ├── Criar/editar estudos
     ├── Gerenciar membros da comunidade
     │
MEMBER (level 0)
     │
     ├── Visualizar eventos
     ├── Visualizar estudos
     ├── Inscrever-se em eventos
     ├── Baixar materiais
```

### Implementação no tRPC

```typescript
// Middleware de autenticação
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { userId: ctx.userId, userRole: ctx.userRole } });
});

// Procedimento admin
const adminProcedure = (roles: string[]) =>
  publicProcedure.use(isAuthed).use(({ ctx, next }) => {
    if (!roles.includes(ctx.userRole)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx });
  });
```

---

## Banco de Dados

### Diagrama de Relacionamentos (Principais)

```
Tenant ──┬── TenantMember ──── User
         ├── BrandingConfig
         ├── TenantSetting
         ├── Community ──── CommunityMember ──── User
         ├── Event ──── EventRegistration ──── User
         ├── StudyCategory ──── StudyMaterial
         ├── TzedakaCampaign ──── TzedakaDonation
         ├── LibraryCategory ──── LibraryItem
         ├── LibraryAuthor ──── LibraryItem
         ├── NewsCategory ──── NewsArticle ──── User (author)
         ├── RabbiProfile ──── RabbiAnswer
         ├── RabbiQuestion ──── User ──── RabbiAnswer
         ├── AIConversation ──── AIMessage
         ├── CertificateTemplate ──── Certificate
         ├── Notification ──── User
         ├── AuditLog ──── User
         ├── Page (CMS)
         └── Banner
```

### Índices Principais

| Tabela | Índice | Tipo |
|--------|--------|------|
| Tenant | slug | UNIQUE |
| User | email | UNIQUE |
| TenantMember | tenantId_userId | UNIQUE |
| Community | tenantId_slug | UNIQUE |
| NewsArticle | tenantId_slug | UNIQUE |
| Page | tenantId_slug | UNIQUE |
| Event | tenantId + dateTime | INDEX |
| StudyMaterial | tenantId + categoryId | INDEX |
| AuditLog | tenantId + createdAt | INDEX |
| Notification | userId + readAt | INDEX |

---

## Padrões de API

### tRPC (Principal)

```
GET  /api/trpc/[trpc]?batch=1&input={...}
POST /api/trpc/[trpc]
```

### REST (Complementar)

```
POST /api/auth/register        → Registro
POST /api/auth/forgot-password  → Recuperação
POST /api/auth/reset-password   → Reset
POST /api/upload               → Upload
GET  /api/branding             → Branding
```

### Padrão de Resposta tRPC

```typescript
// Sucesso
{ result: { data: { ... } } }

// Erro
{ error: { message: "Mensagem", code: "UNAUTHORIZED" } }
```

---

## Segurança

### Camadas de Proteção

1. **Middleware**: Resolução de tenant, rate limiting
2. **NextAuth**: Autenticação JWT
3. **tRPC Middleware**: Verificação de sessão e role
4. **Zod**: Validação de entrada
5. **Prisma**: Proteção contra SQL Injection
6. **Sanitização**: Proteção contra XSS

### Headers de Segurança

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Performance

### Estratégias

| Estratégia | Implementação |
|-----------|--------------|
| Cache | Redis (query cache, session cache) |
| Lazy Loading | `next/dynamic` para componentes pesados |
| Code Splitting | Automático pelo Next.js |
| Imagens | `next/image` com otimização automática |
| SSR/SSG | Páginas públicas em SSG, admin em SSR |
| Database | Índices, paginação por cursor |

---

*Documentação técnica atualizada em Julho 2026.*
