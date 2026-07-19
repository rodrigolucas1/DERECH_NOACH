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

## Fase 3 — Consolidação e Qualidade

**Status**: 🔄 Em andamento  
**Período**: Julho 2026

### Objetivos
Consolidar a plataforma, preparando-a para versões Beta e 1.0.

### Sub-fases Planejadas

#### 3A — Organização e Documentação
- Realocação do projeto para diretório definitivo
- README.md completo (PT-BR)
- CHANGELOG.md
- HISTORICO_DO_PROJETO.md
- Manuais: instalação, desenvolvimento, deploy, backup, recuperação
- Documentação técnica (arquitetura, banco, APIs)
- Estrutura definitiva de pastas

#### 3B — Segurança
- Proteção de rotas admin via middleware
- Sistema de auditoria (AuditLog)
- Rate limiting
- Headers de segurança
- Revisão de RBAC
- Validação de entrada

#### 3C — Performance
- Integração com Redis para cache
- Lazy loading de páginas/componentes
- Componentes reutilizáveis (DataTable, PageHeader, etc.)
- Otimização de queries
- Compressão de imagens

#### 3D — Analytics
- Painel administrativo com indicadores
- Métricas: usuários, comunidades, eventos, downloads
- Gráficos e visualizações

#### 3E — Notificações
- Infraestrutura de notificações in-app
- Sino de notificações no Header
- Integração com Resend (e-mail)
- Preferências de notificação

#### 3F — Certificados
- Templates de certificado
- Geração automática
- Verificação pública

#### 3G — Módulo de IA
- Assistente inteligente
- Interface de chat
- Histórico de conversas
- Memória de contexto
- Arquitetura multi-provedor

#### 3H — Integrações
- Arquitetura para WhatsApp, Google Meet, Zoom, YouTube
- Gerenciamento de configurações de integração
- Webhook infrastructure

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
