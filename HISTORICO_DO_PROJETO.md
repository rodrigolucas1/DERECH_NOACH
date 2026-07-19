# Histórico do Projeto — DERECH NOACH

Registro oficial do desenvolvimento da plataforma Portal Comunidade Bnei Noach.

---

## Fase 1 — Infraestrutura e Autenticação

**Status**: ✅ Aprovada  
**Período**: Julho 2026

### Objetivos
Estabelecer a fundação técnica da plataforma multi-tenant.

### Funcionalidades Implementadas
- Sistema de autenticação (login, registro, recuperação de senha)
- NextAuth v5 com JWT e Credentials Provider
- Painel administrativo com layout colapsável
- Dashboard com estatísticas via tRPC
- Gerenciamento de usuários (listagem, roles)
- Sistema de branding multi-tenant (cores, logo por tenant)
- BrandingProvider com variáveis CSS dinâmicas
- RBAC completo (Super Admin, Admin, Líder, Membro)
- Controle de permissões por papel
- Navegação: Header, Sidebar, Footer
- Rota de API para branding (`/api/branding`)
- Rota de upload de arquivos (`/api/upload`)
- Schema Prisma com 61 modelos
- Migração inicial do banco de dados
- Seed com tenant MG, admin, comunidades e categorias
- Configuração Docker (PostgreSQL 16 + Redis 7)

### Tecnologias Estabelecidas
- Next.js 16.2.10 (App Router)
- React 19.2.4
- TypeScript 5
- Prisma 7.8 com @prisma/adapter-pg
- tRPC v11 com superjson
- shadcn/ui com @base-ui/react
- Tailwind CSS 4
- Zod v4

### Métricas
- 22 rotas funcionais
- 61 modelos de banco
- 13 rotas tRPC
- Build limpo, zero erros TypeScript

---

## Fase 2 — Módulos Principais

**Status**: ✅ Aprovada  
**Período**: Julho 2026

### Objetivos
Implementar todos os módulos principais da plataforma com CRUD completo.

### Funcionalidades Implementadas

#### Comunidades
- CRUD completo (criar, listar, editar, excluir)
- Upload de logo e imagem de capa
- Sistema de membros com papéis
- Ativar/desativar comunidades
- Páginas públicas de listagem e detalhes

#### Eventos
- CRUD completo com suporte a presencial, online e híbrido
- Inscrições de usuários
- Vinculação a comunidades
- Agendamento com data/hora
- Toggle de ativação

#### Estudos
- CRUD de materiais de estudo
- Categorias de estudo hierárquicas
- Tipos: documento, vídeo, áudio, link
- Controle de downloads
- Páginas públicas

#### Biblioteca Digital
- CRUD de itens bibliográficos
- Sistema de autores
- Categorias e tags
- Busca por texto
- Controle de downloads

#### Notícias e Artigos
- CRUD completo com fluxo de publicação
- Categorias com cores personalizadas
- Sistema de tags
- Imagem de capa
- Destaque de artigos
- Páginas públicas com slug

#### CMS - Páginas
- CRUD de páginas estáticas
- Editor de conteúdo HTML
- Campos SEO (meta título, descrição)
- Toggle de publicação

#### Banners
- CRUD completo
- Upload de imagem
- Posicionamento configurável (Home Hero, Sidebar, etc.)
- Agendamento de exibição
- Ordenação

#### Tzedaká
- CRUD de campanhas de arrecadação
- Upload de capa
- Metas financeiras
- Controle de status (ativa, concluída, rascunho)
- Visibilidade pública/privada

#### Pergunte ao Rabino
- CRUD de perfis de rabinos
- Upload de foto
- Gestão de perguntas (aprovar, rejeitar)
- Sistema de respostas
- Toggle de visibilidade

#### Upload de Arquivos
- API de upload autenticada
- Suporte a imagens, PDFs, vídeos e áudios
- Limite de 10MB
- Armazenamento local

### Páginas Públicas
- `/communities` — Listagem de comunidades
- `/events` — Eventos agendados
- `/studies` — Materiais de estudo
- `/library` — Biblioteca digital
- `/news` — Notícias e artigos

### Métricas
- 30 rotas funcionais
- 13 rotas tRPC com CRUD completo
- 7 páginas administrativas com forms funcionais
- 5 páginas públicas
- Build limpo, zero erros TypeScript

---

## Fase 3 — Consolidação, Segurança, Performance e Funcionalidades

**Status**: ✅ Concluída  
**Período**: Julho 2026

### Objetivos
Consolidar a plataforma com segurança, performance, analytics, notificações, certificados, IA e integrações — preparando-a para versões Beta e 1.0.

---

### 3A — Organização e Documentação ✅

#### Implementado
- Realocação do projeto para `C:\Projetos\DERECH_NOACH`
- `README.md` completo em PT-BR (tecnologias, arquitetura, estrutura, rodagem)
- `CHANGELOG.md` com histórico por fase
- `HISTORICO_DO_PROJETO.md` — registro oficial do projeto
- Documentação em `docs/`:
  - `INSTALACAO.md` — guia de instalação do zero
  - `DESENVOLVIMENTO.md` — workflow, convenções, comandos
  - `DEPLOY.md` — deploy manual e com Docker
  - `BACKUP.md` — rotinas de backup e recuperação
  - `ARQUITETURA.md` — diagrama de camadas, fluxo de dados
- `.gitignore` atualizado (uploads/, backups/, .env.local, IDE files)
- Repositório Git inicializado com commit baseline da Fase 2

---

### 3B — Segurança ✅

#### Implementado
- **Middleware de proteção admin**: todas as rotas `/admin/*` verificam cookie `next-auth.session-token`; redireciona para `/login` se não autenticado
- **Headers de segurança**: X-Frame-Options: DENY, X-XSS-Protection, X-Content-Type-Options: nosniff, Referrer-Policy, X-DNS-Prefetch-Control
- **Router de Auditoria** (`src/server/trpc/routers/audit.ts`):
  - `logAction` — registra ações com userId, tenantId, action, entity, entityId, details (JSON), ip, userAgent
  - `listLogs` — consulta paginada com filtros (action, entity, userId, data range)
- **Helper de Auditoria** (`src/server/utils/audit.ts`): `logAuditAction()` reutilizável em qualquer router
- **Rate Limiter** (`src/server/utils/rate-limit.ts`): limitador in-memory por IP com janela configurável
- **Página Admin de Auditoria** (`/admin/audit`): tabela com filtros, paginação, exibição de logs
- Link "Auditoria" adicionado ao Sidebar

---

### 3C — Performance ✅

#### Implementado
- **Redis Cache Service** (`src/server/utils/cache.ts`): `CacheService` com fallback gracioso (Redis indisponível → sem cache), `withCache()` helper genérico
- **Componentes Reutilizáveis**:
  - `PageHeader` — cabeçalho de página com título, descrição e botões de ação
  - `EmptyState` — estado vazio com ícone, título, descrição e CTA
  - `ConfirmDialog` — diálogo de confirmação reutilizável
  - `DataTable` — tabela de dados com headers, renderização de células
- **Lazy Loading**: `<Suspense>` com skeleton em todas as 6 páginas públicas
- **Otimização do `next.config.ts`**: compress habilitado, images (AVIF, WebP, deviceSizes), poweredByHeader: false, reactStrictMode: true
- **React Query defaults**: staleTime 60s, gcTime 5min, retry 1

---

### 3D — Analytics ✅

#### Implementado
- **Router de Analytics** (`src/server/trpc/routers/analytics.ts`):
  - `platformStats` — 15 métricas: totalUsers, activeUsers, totalCommunities, totalEvents, totalStudies, totalNews, totalLibrary, totalTzedaka, totalBanners, totalPages, totalRabbis, totalCertificates, totalNotifications, totalForumPosts, totalForumComments
  - `recentActivity` — últimas 20 ações de auditoria
  - `userGrowth` — crescimento de usuários nos últimos 12 meses (por mês)
- **Dashboard de Analytics** (`/admin/analytics`):
  - Cards de métricas em grid responsivo
  - Atividade recente com timestamps e ações
  - Crescimento de usuários (lista mensal)
- Link "Analytics" adicionado ao Sidebar e Dashboard

---

### 3E — Notificações ✅

#### Implementado
- **Router de Notificações** (`src/server/trpc/routers/notification.ts`):
  - `list` — notificações do usuário logado (paginado)
  - `unreadCount` — contagem de não lidas
  - `markRead` — marcar individual como lida
  - `markAllRead` — marcar todas como lidas
  - `create` — admin cria notificação para qualquer usuário (com tipo, título, mensagem, link)
- **Componente NotificationBell** (`src/client/components/NotificationBell.tsx`):
  - sino com badge de contagem
  - dropdown com lista de notificações
  - mark-as-read individual e "Marcar todas como lidas"
- **Bell no Header**: exibido para usuários autenticados
- **Página Admin de Notificações** (`/admin/notifications`): lista todas as notificações do tenant
- Link "Notificações" adicionado ao Sidebar

---

### 3F — Certificados ✅

#### Implementado
- **Router de Certificados** (`src/server/trpc/routers/certificate.ts`):
  - `listTemplates` — lista templates do tenant
  - `createTemplate` — cria template (nome,descrição, template HTML, campos personalizáveis)
  - `deleteTemplate` — remove template
  - `listCertificates` — lista certificados emitidos (admin)
  - `issueCertificate` — emite certificado para usuário (templateId, userId, dados personalizados, código de verificação único)
  - `verifyCertificate` — verifica certificado por código (público)
  - `myCertificates` — certificados do usuário logado
- **Página Admin de Certificados** (`/admin/certificates`):
  - Aba "Templates" — criar e gerenciar templates
  - Aba "Emitidos" — listar certificados emitidos com detalhes
- **Página Pública de Verificação** (`/certificates/verify`):
  - Campo de código de verificação
  - Exibe dados do certificado se válido
- Link "Certificados" adicionado ao Sidebar

---

### 3G — Módulo de IA ✅

#### Implementado
- **Router de IA** (`src/server/trpc/routers/ai.ts`):
  - `listConversations` — lista conversas do usuário
  - `getConversation` — busca conversa com mensagens
  - `createConversation` — cria nova conversa
  - `sendMessage` — envia mensagem, retorna resposta do assistente (placeholder com mensagem canned)
  - `deleteConversation` — remove conversa
- **Interface de Chat** (`/ai`):
  - Lista de conversas na lateral (com botão nova conversa)
  - Área de mensagens com bubbles (usuário à direita, assistente à esquerda)
  - Input de texto com botão de envio
  - Exclusão de conversas
- **Arquitetura Multi-Provedor**: preparada para integração com OpenAI, Anthropic, etc.
- Link "Assistente IA" adicionado ao Header e Sidebar

---

### 3H — Integrações ✅

#### Implementado
- **Router de Integrações** (`src/server/trpc/routers/integration.ts`):
  - `listAvailable` — lista adaptadores disponíveis (nome, descrição, campos de config)
  - `list` — lista configs salvas do tenant
  - `getByService` — busca config por serviço
  - `upsert` — cria ou atualiza config (apiKey, apiSecret, webhookUrl, extraConfig)
  - `toggleActive` — ativa/desativa integração
  - `delete` — remove config
  - `testConnection` — testa conexão (placeholder)
- **Padrão Adapter** (`src/server/services/integrations/`):
  - Interface `IntegrationAdapter` com configFields e testConnection
  - 5 adaptadores stub:
    - WhatsApp Business API (phoneNumberId, accessToken, businessAccountId)
    - Google Meet (clientId, clientSecret, calendarId)
    - Zoom (accountId, clientId, clientSecret)
    - YouTube (apiKey, channelId)
    - Resend Email (apiKey, fromEmail, fromName)
- **Página Admin de Integrações** (`/admin/integrations`):
  - Grid de cards (1 por serviço) com ícone, nome, descrição, status
  - Dialog de configuração com campos dinâmicos
  - Botões: Configurar, Ativar/Desativar, Testar Conexão
  - Remover integração configurada
- Link "Integrações" adicionado ao Sidebar

---

### Métricas Finais da Fase 3
- **37 rotas** funcionais (vs 30 na Fase 2)
- **19 rotas tRPC** com CRUD completo (vs 13 na Fase 2)
- **17 páginas admin** (vs 7 na Fase 2)
- **7 páginas públicas** (vs 5 na Fase 2)
- **5 adaptadores de integração** preparados
- **7 componentes reutilizáveis** criados
- Build limpo, zero erros TypeScript

---

## Funcionalidades Previstas para Fase 4

- Fórum completo (criação de tópicos, respostas, reações)
- Galeria de fotos e vídeos
- Sistema de voluntariado
- Programa de mentoria
- Pedidos de oração
- Parcerias com instituições
- Palestrantes e eventos
- Busca global
- Favoritos dos usuários
- Relatórios financeiros da Tzedaká
- App mobile (React Native)

---

*Documento atualizado automaticamente ao término de cada fase.*
