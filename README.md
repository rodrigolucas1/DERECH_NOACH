# Portal Comunidade Bnei Noach

**Projeto DERECH NOACH** — Plataforma multi-tenant para comunidades Bnei Noach do Brasil.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#licença)

---

## Visão Geral

O **Portal Comunidade Bnei Noach** é uma plataforma web multi-tenant, escalável e moderna, projetada para servir como hub central da comunidade Bnei Noach no Brasil. A plataforma permite a gestão de comunidades, eventos, estudos, biblioteca digital, notícias, tzedaká, fóruns, e interação com rabinos.

### Características Principais

- **Multi-tenant**: Uma única instância atende múltiplos estados/regiões, cada um com identidade visual própria
- **RBAC completo**: Controle de acesso baseado em papéis (Super Admin, Admin, Líder, Membro)
- **Modular**: Arquitetura modular com 13+ módulos independentes
- **Type-safe**: APIs tipadas de ponta a ponta com tRPC + Zod
- **Responsivo**: Interface adaptável para desktop, tablet e mobile
- **Seguro**: Autenticação JWT, validação de entrada, proteção CSRF/XSS

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | tRPC v11, Prisma 7.8, Node.js |
| Banco | PostgreSQL 16 |
| Cache | Redis 7 |
| UI | shadcn/ui, Lucide Icons |
| Auth | NextAuth v5 (JWT + Credentials) |
| Validação | Zod v4 |
| Email | Resend |
| Deploy | Vercel / Docker |

---

## Estrutura do Projeto

```
DERECH_NOACH/
├── prisma/                  # Schema, migrações e seed
│   ├── schema.prisma        # 61 modelos de banco
│   ├── seed.ts              # Dados iniciais
│   └── migrations/          # Migrações do banco
├── src/
│   ├── app/                 # Rotas Next.js (App Router)
│   │   ├── (public)/        # Páginas públicas
│   │   ├── (auth)/          # Autenticação
│   │   ├── (admin)/         # Painel administrativo
│   │   └── api/             # APIs REST + tRPC
│   ├── client/              # Código do lado do cliente
│   │   ├── components/      # Componentes React
│   │   ├── hooks/           # Hooks customizados
│   │   └── lib/             # Utilitários cliente
│   ├── server/              # Código do lado do servidor
│   │   ├── db/              # Cliente Prisma
│   │   ├── trpc/            # Routers e contexto tRPC
│   │   ├── services/        # Lógica de negócio
│   │   └── utils/           # Utilitários servidor
│   ├── components/ui/       # Componentes shadcn/ui
│   ├── lib/                 # Utilitários compartilhados
│   └── types/               # Tipos TypeScript
├── docs/                    # Documentação
│   ├── INSTALACAO.md        # Manual de instalação
│   ├── DESENVOLVIMENTO.md   # Manual do desenvolvedor
│   ├── DEPLOY.md            # Manual de deploy
│   ├── BACKUP.md            # Manual de backup
│   └── ARQUITETURA.md       # Documentação técnica
├── scripts/                 # Scripts utilitários
├── public/                  # Arquivos estáticos
├── docker-compose.yml       # Infraestrutura local
└── HISTORICO_DO_PROJETO.md  # Histórico oficial
```

---

## Início Rápido

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16
- npm ou yarn

### Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd DERECH_NOACH

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Gere o Prisma Client
npx prisma generate

# 5. Execute as migrações
npx prisma migrate dev

# 6. Popule o banco com dados iniciais
npm run db:seed

# 7. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

### Credenciais Padrão (Seed)

| Campo | Valor |
|-------|-------|
| E-mail | admin@bneinoach.org |
| Senha | admin123 |
| Tenant | MG (Minas Gerais) |

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Iniciar em produção |
| `npm run lint` | Verificar código (ESLint) |
| `npm run lint:fix` | Corrigir código automaticamente |
| `npm run format` | Formatar código (Prettier) |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:push` | Sincronizar schema com banco |
| `npm run db:migrate` | Criar migração |
| `npm run db:migrate:prod` | Aplicar migrações em produção |
| `npm run db:seed` | Popular banco com dados iniciais |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:reset` | Resetar banco de dados |

---

## Módulos da Plataforma

### Fase 1 (Completa)
- Autenticação (login, registro, recuperação de senha)
- Painel administrativo (dashboard, usuários, configurações)
- Sistema de branding multi-tenant
- RBAC e controle de permissões
- Navegação (Header, Sidebar, Footer)

### Fase 2 (Completa)
- Comunidades (CRUD, membros, eventos)
- Eventos (CRUD, inscrições, presença)
- Estudos (materiais, categorias)
- Biblioteca digital (itens, autores, categorias, tags)
- Notícias e artigos (CRUD, categorias, tags, publicação)
- CMS de páginas
- Banners e propagandas
- Tzedaká (campanhas, doações)
- Pergunte ao Rabino (perfis, perguntas, respostas)
- Upload de arquivos

### Fase 3 (Em Andamento)
- Organização e documentação
- Segurança e auditoria
- Performance e cache
- Analytics administrativo
- Sistema de notificações
- Certificados automáticos
- Módulo de Inteligência Artificial
- Arquitetura de integrações

---

## Arquitetura Multi-Tenant

A plataforma utiliza um modelo **shared database, shared schema** onde:

1. Cada tenant é identificado por **subdomínio** (ex: `mg.bneinoach.org`)
2. Em desenvolvimento, o tenant é resolvido pelo header `x-tenant-id`
3. Todas as tabelas possuem coluna `tenantId` para isolamento de dados
4. O middleware do Next.js resolve o tenant e reescreve as rotas
5. O contexto tRPC propaga o `tenantId` para todas as queries

---

## Banco de Dados

O schema Prisma contém **61 modelos** organizados em domínios:

- **Core**: Tenant, User, Account, Session, TenantMember
- **Comunidades**: Community, CommunityMember
- **Eventos**: Event, EventRegistration, LiveStream
- **Estudos**: StudyCategory, StudyMaterial
- **Tzedaká**: TzedakaCampaign, TzedakaDonation, TzedakaAllocation
- **Biblioteca**: LibraryItem, LibraryAuthor, LibraryCategory, LibraryTag
- **Fórum**: ForumCategory, ForumTopic, ForumPost
- **Rabbi**: RabbiProfile, RabbiQuestion, RabbiAnswer
- **Notícias**: NewsArticle, NewsCategory, NewsTag
- **CMS**: Page, Banner
- **IA**: AIConversation, AIMessage
- **Certificados**: CertificateTemplate, Certificate
- **Notificações**: Notification
- **Auditoria**: AuditLog
- **Galeria**: GalleryAlbum, GalleryMedia
- **Parcerias**: PartnerInstitution, InstitutionRepresentative
- **Voluntariado**: VolunteerOpportunity, VolunteerSignup
- **Mentoria**: MentorProfile, Mentorship
- **Oração**: PrayerRequest, PrayerResponse

---

## Segurança

- Autenticação via NextAuth v5 com JWT
- Senhas hasheadas com bcryptjs
- Validação de entrada com Zod em todas as APIs
- Rate limiting (em implementação)
- Headers de segurança (CSP, X-Frame-Options)
- Proteção contra SQL Injection (Prisma ORM)
- Proteção contra XSS (sanitização de entrada)
- RBAC com hierarchy de papéis
- Auditoria de ações (AuditLog)

---

## Licença

Proprietária. Uso interno da comunidade Bnei Noach do Brasil.

---

**Projeto DERECH NOACH** — Construído com dedicação para a comunidade Bnei Noach.
