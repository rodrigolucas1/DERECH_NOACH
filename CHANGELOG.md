# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.3.0] — 2026-07-19 (Fase 3 — Em Andamento)

### Adicionado
- README.md completo em Português Brasileiro
- CHANGELOG.md com histórico de versões
- HISTORICO_DO_PROJETO.md com registro oficial
- Documentação técnica em docs/

### Planejado (Fase 3)
- Sistema de auditoria (AuditLog)
- Proteção de rotas admin
- Cache Redis
- Componentes reutilizáveis
- Painel de analytics
- Sistema de notificações
- Módulo de certificados
- Módulo de Inteligência Artificial
- Arquitetura de integrações

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
