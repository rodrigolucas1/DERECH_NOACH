# Ambiente de Homologação — Portal Bnei Noach

Guia de acesso e validação do ambiente de homologação (Fase 3) para o Product Owner.

---

## 1. Pré-requisitos

| Item | Versão | Status |
|------|--------|--------|
| Node.js | 18+ | ✅ Instalado |
| PostgreSQL | 16 | ✅ Rodando (porta 5432) |
| npm | 10+ | ✅ Instalado |

---

## 2. Iniciar o Servidor

```bash
cd C:\Projetos\DERECH_NOACH
npm run dev
```

O servidor inicia em **http://localhost:3000** em ~1 segundo.

---

## 3. Credenciais de Acesso

### Super Administrador (acesso total ao painel admin)
- **E-mail:** `admin@bneinoach.org`
- **Senha:** `admin123`

### Líder Comunitário (acesso parcial)
- **E-mail:** `lider@bneinoach.org`
- **Senha:** `teste123`

### Membro Comum (acesso público apenas)
- **E-mail:** `membro@bneinoach.org`
- **Senha:** `teste123`

---

## 4. Rotas de Validação

### Páginas Públicas (acesso sem login)
| Rota | Descrição |
|------|-----------|
| `http://localhost:3000` | Home page |
| `/communities` | Listagem de comunidades (3) |
| `/events` | Eventos agendados (4) |
| `/studies` | Materiais de estudo (5 categorias) |
| `/library` | Biblioteca digital (4 itens) |
| `/news` | Notícias publicadas (3) + 1 rascunho |
| `/ai` | Assistente IA (chat) |
| `/certificates/verify` | Verificação de certificados |
| `/login` | Página de login |
| `/register` | Página de registro |

### Painel Admin (requer login como Admin)
| Rota | Descrição |
|------|-----------|
| `/admin/dashboard` | Dashboard com métricas |
| `/admin/users` | Gerenciar usuários (3 cadastrados) |
| `/admin/communities` | Gerenciar comunidades (3) |
| `/admin/events` | Gerenciar eventos (4) |
| `/admin/studies` | Gerenciar estudos |
| `/admin/library` | Gerenciar biblioteca (4 itens, 3 autores, 3 categorias) |
| `/admin/news` | Gerenciar notícias (4 artigos) |
| `/admin/banners` | Gerenciar banners (3) |
| `/admin/tzedaka` | Gerenciar campanhas (3) |
| `/admin/rabbi` | Gerenciar rabinos (2) |
| `/admin/pages` | CMS de páginas (4 páginas) |
| `/admin/notifications` | Notificações (3 de teste) |
| `/admin/analytics` | Painel de analytics (15 métricas) |
| `/admin/audit` | Logs de auditoria |
| `/admin/certificates` | Gerenciar certificados |
| `/admin/integrations` | Configurar integrações (5 adaptadores) |
| `/admin/settings` | Configurações do tenant |

---

## 5. Dados de Teste Disponíveis

### Tenant
- Comunidade Bnei Noach de Minas Gerais (slug: `mg`)

### Usuários
| Nome | E-mail | Role |
|------|--------|------|
| Administrador Geral | admin@bneinoach.org | ADMIN |
| Líder Comunitário | lider@bneinoach.org | LEADER |
| Membro Comum | membro@bneinoach.org | MEMBER |

### Comunidades
1. Comunidade Bnei Noach Belo Horizonte
2. Comunidade Bnei Noach Uberlândia
3. Comunidade Bnei Noach Juiz de Fora

### Eventos
1. Estudo Semanal: As Sete Leis Universais (presencial)
2. Shabbat Comunitário Virtual (online)
3. Conferência Nacional Bnei Noach 2026 (híbrido)
4. Estudo Avançado: Talmud para Noachidas (presencial)

### Notícias (4 artigos)
- 3 publicados + 1 rascunho

### Tzedaká (3 campanhas)
- 2 ativas + 1 concluída

### Biblioteca (4 itens)
- Documento, Vídeo, Áudio, Link

### Fórum
- 3 categorias, 3 tópicos, 2 posts

### Páginas CMS
- Sobre Nós, Contato, Como Participar (publicadas)
- Termos de Uso (rascunho)

### Notificações
- 3 notificações de teste para o admin

---

## 6. Fluxos de Validação Recomendados

### 6.1 Login e RBAC
1. Acessar `/login` e fazer login como Admin
2. Verificar que o Dashboard carrega com métricas
3. Fazer logout e logar como Líder — verificar acesso limitado
4. Logar como Membro — verificar que não acessa `/admin/*`

### 6.2 CRUD de Módulos
Para cada módulo admin (Comunidades, Eventos, Estudos, etc.):
1. Listar registros existentes
2. Criar novo registro
3. Editar registro existente
4. Ativar/desativar registro
5. Excluir registro

### 6.3 Páginas Públicas
1. Navegar por todas as páginas públicas
2. Verificar que os dados aparecem corretamente
3. Testar responsividade (mobile)

### 6.4 Analytics
1. Acessar `/admin/analytics`
2. Verificar que as 15 métricas são exibidas
3. Verificar atividade recente e crescimento de usuários

### 6.5 Notificações
1. Clicar no sino no Header (após login)
2. Verificar dropdown com notificações
3. Marcar como lidas

### 6.6 Certificados
1. Acessar `/admin/certificates`
2. Criar template
3. Emitir certificado
4. Verificar em `/certificates/verify`

### 6.7 Integrações
1. Acessar `/admin/integrations`
2. Configurar um serviço (dados fictícios)
3. Testar conexão
4. Ativar/desativar

### 6.8 IA
1. Acessar `/ai`
2. Criar nova conversa
3. Enviar mensagem e receber resposta (placeholder)

---

## 7. Comandos Úteis

```bash
# Reiniciar o banco com dados limpos
npm run db:seed

# Verificar status do banco
npx prisma migrate status

# Build de produção
npm run build

# Verificar build
npm run build 2>&1 | Select-String "Route"
```

---

## 8. Métricas da Fase 3

| Métrica | Valor |
|---------|-------|
| Total de rotas | 37 |
| Rotas tRPC | 19 |
| Páginas admin | 17 |
| Páginas públicas | 7 |
| Modelos Prisma | 61 |
| Componentes reutilizáveis | 7 |
| Adaptadores de integração | 5 |
| Erros TypeScript | 0 |

---

*Documento gerado para validação do Product Owner — Fase 3 (Consolidação).*
