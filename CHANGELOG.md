# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.3.0] — 2026-07-19 (Fase 3 — Concluída)

### Adicionado
- **3A — Organização**: README.md, CHANGELOG.md, HISTORICO_DO_PROJETO.md, docs/* (INSTALACAO, DESENVOLVIMENTO, DEPLOY, BACKUP, ARQUITETURA), .gitignore atualizado, git init
- **3B — Segurança**: Middleware admin guard (verificação de sessão), security headers (X-Frame-Options, X-XSS-Protection, etc.), router de Auditoria (logAction, listLogs), helper de auditoria reutilizável, rate limiter in-memory, página /admin/audit
- **3C — Performance**: Redis CacheService com fallback gracioso, componentes reutilizáveis (PageHeader, EmptyState, ConfirmDialog, DataTable), lazy loading com Suspense em 6 páginas, next.config.ts otimizado (compress, images AVIF/WebP), React Query defaults (staleTime 60s, gcTime 5min)
- **3D — Analytics**: Router de analytics (platformStats com 15 métricas, recentActivity, userGrowth 12 meses), dashboard /admin/analytics com cards e gráficos
- **3E — Notificações**: Router de notificações (list, unreadCount, markRead, markAllRead, create), componente NotificationBell com dropdown, sino no Header, página /admin/notifications
- **3F — Certificados**: Router de certificados (listTemplates, createTemplate, deleteTemplate, listCertificates, issueCertificate, verifyCertificate, myCertificates), página admin /admin/certificates (templates + emitidos), verificação pública /certificates/verify
- **3G — Módulo de IA**: Router de IA (listConversations, getConversation, createConversation, sendMessage, deleteConversation), interface de chat /ai com conversas e bubbles, arquitetura multi-provedor preparada
- **3H — Integrações**: Router de integrações (listAvailable, list, getByService, upsert, toggleActive, delete, testConnection), padrão adapter com 5 stubs (WhatsApp, Google Meet, Zoom, YouTube, Resend), página /admin/integrations com cards e configuração dinâmica

### Métricas
- 37 rotas funcionais (vs 30 na Fase 2)
- 19 rotas tRPC (vs 13 na Fase 2)
- 17 páginas admin (vs 7 na Fase 2)
- 7 páginas públicas (vs 5 na Fase 2)
- 7 componentes reutilizáveis criados
- 5 adaptadores de integração preparados

---

## [0.2.0] — 2026-07-19 (Fase 2)

### Adicionado
- **Comunidades**: CRUD completo com logo, capa, membros e eventos
- **Eventos**: CRUD com suporte presencial/online/híbrido e inscrições
- **Estudos**: CRUD de materiais com categorias
- **Biblioteca Digital**: CRUD com autores, categorias, tags e busca
- **Notícias**: CRUD com categorias, tags, capa e publicação
- **CMS Páginas**: CRUD com editor HTML e SEO
- **Banners**: CRUD com upload, posicionamento e agendamento
- **Tzedaká**: CRUD de campanhas com metas e status
- **Pergunte ao Rabino**: CRUD de perfis e gestão de perguntas
- **Upload de Arquivos**: API autenticada com suporte multimídia
- Páginas públicas: `/communities`, `/events`, `/studies`, `/library`, `/news`
- Componente `ImageUpload` reutilizável
- Realocação do projeto para `C:\Projetos\DERECH_NOACH`
- Inicialização do repositório Git

### Corrigido
- Tipo `Decimal` do Prisma renderizado corretamente nas páginas admin
- `prisma.config.ts` removido `earlyAccess` inválido

---

## [0.1.0] — 2026-07-19 (Fase 1)

### Adicionado
- **Autenticação**: Login, registro, recuperação de senha
- **NextAuth v5**: JWT + Credentials Provider
- **Painel Admin**: Dashboard, usuários, configurações
- **Branding Multi-tenant**: Cores, logo, variáveis CSS dinâmicas
- **RBAC**: Super Admin, Admin, Líder, Membro
- **Permissões**: Controle granular por papel
- **Navegação**: Header, Sidebar (colapsável), Footer
- **APIs**: `/api/branding`, `/api/upload`, `/api/auth/*`
- **Schema Prisma**: 61 modelos, 17 enums
- **Migração**: `20260719194100_init`
- **Seed**: Tenant MG, admin, 3 comunidades, 4 categorias
- **Docker**: PostgreSQL 16 + Redis 7
- **13 rotas tRPC**: tenant, auth, admin, community, event, study, tzedaka, news, library, forum, rabbi, cms, banner
- **22 rotas** funcionais
- Build limpo, zero erros TypeScript
