# Manual de Instalação — DERECH NOACH

## Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação Passo a Passo](#instalação-passo-a-passo)
4. [Configuração do Ambiente](#configuração-do-ambiente)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Docker para Desenvolvimento Local](#docker-para-desenvolvimento-local)
7. [Primeiro Acesso](#primeiro-acesso)
8. [Solucionando Problemas Comuns](#solucionando-problemas-comuns)

---

## Visão Geral

Este manual descreve o processo completo de instalação e configuração do sistema **DERECH NOACH**, permitindo o desenvolvimento e execução do projeto em ambiente local.

O sistema é construído com **Next.js 14+**, **TypeScript**, **tRPC**, **Prisma ORM** e **PostgreSQL**, utilizando arquitetura multi-tenant com isolamento de dados por `organizationId`.

---

## Pré-requisitos

### Software Necessário

| Software       | Versão Mínima | Versão Recomendada | Comando de Verificação       |
|----------------|---------------|---------------------|------------------------------|
| Node.js        | 20.x          | 20.11+              | `node --version`             |
| npm            | 10.x          | 10.x+               | `npm --version`              |
| PostgreSQL     | 16            | 16.x                | `psql --version`             |
| Git            | 2.x           | 2.40+               | `git --version`              |
| Docker (opc.)  | 24.x          | 24.x+               | `docker --version`           |
| Docker Compose | 2.x           | 2.20+               | `docker compose version`     |

### Contas Necessárias

- **GitHub**: Acesso ao repositório do projeto
- **Vercel** (opcional): Para deploy em produção
- **Banco de dados**: Acesso a uma instância PostgreSQL (local ou remota)

### Recomendações do Sistema

- **Sistema Operacional**: Windows 10/11, macOS 12+ ou Ubuntu 22.04+
- **RAM**: Mínimo 8 GB (recomendado 16 GB)
- **Espaço em disco**: Mínimo 2 GB livres
- **Editor**: VS Code com extensões推荐adas:
  - ESLint
  - Prettier
  - Prisma (extensão oficial)
  - Tailwind CSS IntelliSense
  - TypeScript Nightly

---

## Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-org/derech-noach.git
cd derech-noach
```

### 2. Instale as Dependências

```bash
npm install
```

> **Nota**: O projeto utiliza npm como gerenciador de pacotes. Não utilize yarn ou pnpm, pois as versões podem apresentar incompatibilidades com o lockfile.

### 3. Verifique a Instalação

```bash
npm run build
```

Se o build ocorrer sem erros, a instalação está concluída. Caso contrário, verifique a seção de [Solucionando Problemas](#solucionando-problemas-comuns).

---

## Configuração do Ambiente

### 1. Crie o Arquivo `.env`

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.example .env
```

### 2. Variáveis de Ambiente Explicadas

#### Banco de Dados

```env
# URL de conexão com o PostgreSQL
# Formato: postgresql://USUARIO:SENHA@HOST:PORTA/NOME_BANCO?schema=public
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/derech_noach?schema=public"

# URL para o Prisma Studio (pode ser igual ao DATABASE_URL)
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/derech_noach?schema=public"
```

| Variável       | Descrição                                         | Obrigatória |
|----------------|---------------------------------------------------|-------------|
| `DATABASE_URL` | String de conexão com o PostgreSQL                 | Sim         |
| `DIRECT_URL`   | URL direta para operações do Prisma (sem pooling)  | Sim         |

#### Autenticação

```env
# Chave secreta para a sessão JWT (gere uma chave aleatória de 32+ caracteres)
AUTH_SECRET="sua-chave-secreta-aqui-mude-para-producao"

# URL base da aplicação (sem barra final)
NEXTAUTH_URL="http://localhost:3000"

# Provedor OAuth (opcional — apenas se utilizar login social)
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

| Variável        | Descrição                                              | Obrigatória |
|-----------------|--------------------------------------------------------|-------------|
| `AUTH_SECRET`   | Segredo para criptografia de sessões JWT                | Sim         |
| `NEXTAUTH_URL`  | URL base da aplicação (use `http://localhost:3000`)     | Sim         |

#### Armazenamento de Arquivos

```env
# Chaves do AWS S3 ou compatível (Cloudflare R2, MinIO local)
S3_BUCKET_NAME="derech-noach-uploads"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_ENDPOINT=""
```

| Variável               | Descrição                                    | Obrigatória |
|------------------------|----------------------------------------------|-------------|
| `S3_BUCKET_NAME`       | Nome do bucket de armazenamento              | Sim         |
| `S3_REGION`            | Região do serviço S3                         | Sim         |
| `S3_ACCESS_KEY_ID`     | Chave de acesso                              | Sim         |
| `S3_SECRET_ACCESS_KEY` | Chave secreta de acesso                      | Sim         |
| `S3_ENDPOINT`          | Endpoint (necessário para S3 compatíveis)    | Condicional |

#### Variáveis Adicionais

```env
# Modo de depuração (true/false)
DEBUG="false"

# Porta do servidor de desenvolvimento
PORT=3000

# Ambiente de execução
NODE_ENV="development"
```

### 3. Valide a Configuração

Após preencher o `.env`, verifique se o Prisma consegue acessar o banco:

```bash
npx prisma db push
```

Se a mensagem de sucesso aparecer, a configuração está correta.

---

## Configuração do Banco de Dados

### Método 1: PostgreSQL Local

1. Instale o PostgreSQL 16
2. Crie um banco de dados:

```sql
CREATE DATABASE derech_noach;
```

3. Execute as migrations:

```bash
npx prisma migrate dev
```

4. (Opcional) Popule com dados de exemplo:

```bash
npx prisma db seed
```

### Método 2: PostgreSQL via Docker

Execute apenas se não tiver o PostgreSQL instalado localmente:

```bash
docker run -d \
  --name derech-noach-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=derech_noach \
  -p 5432:5432 \
  postgres:16-alpine
```

Em seguida, execute as migrations:

```bash
npx prisma migrate dev
```

### Comandos Úteis do Prisma

```bash
# Gerar o cliente Prisma
npx prisma generate

# Aplicar migrations no banco atual
npx prisma migrate deploy

# Criar uma nova migration após alterar o schema
npx prisma migrate dev --name descricao_da_mudanca

# Resetar o banco (ATENÇÃO: apaga todos os dados)
npx prisma migrate reset

# Abrir o Prisma Studio (interface visual)
npx prisma studio

# Sincronizar schema com o banco (sem criar migration)
npx prisma db push
```

---

## Docker para Desenvolvimento Local

### Pré-requisitos

- Docker 24+ instalado
- Docker Compose v2+ instalado

### Início Rápido

Execute todos os serviços com um único comando:

```bash
docker compose up -d
```

Isso iniciará:
- **PostgreSQL 16**: Porta `5432`
- **pgAdmin** (interface visual para o banco): Porta `5050`

### Acesse o pgAdmin

1. Abra `http://localhost:5050` no navegador
2. Login: `admin@derechnoach.com`
3. Senha: `admin`
4. Adicione o servidor PostgreSQL:
   - Host: `derech-noach-db` (ou `localhost` se acessando externamente)
   - Porta: `5432`
   - Usuário: `postgres`
   - Senha: `postgres`

### Configuração do Docker Compose

O arquivo `docker-compose.yml` do projeto contém a configuração padrão. Para personalizar:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: derech_noach
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    restart: unless-stopped
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@derechnoach.com
      PGADMIN_DEFAULT_PASSWORD: admin
    depends_on:
      - db

volumes:
  postgres_data:
```

### Parar os Serviços

```bash
docker compose down
```

### Parar e Remover Todos os Dados

```bash
docker compose down -v
```

---

## Primeiro Acesso

### 1. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

### 2. Acesse o Sistema

- **Página Inicial**: `http://localhost:3000`
- **Painel Admin**: `http://localhost:3000/admin`
- **Login**: Utilize as credenciais padrão ou crie uma conta

### 3. Credenciais Iniciais (se aplicável)

> As credenciais iniciais são criadas pelo seed do banco de dados.

| Campo      | Valor Padrão                |
|------------|-----------------------------|
| E-mail     | `admin@derechnoach.com`     |
| Senha      | `admin123`                  |

> **IMPORTANTE**: Altere a senha padrão após o primeiro acesso!

### 4. Verifique o Funcionamento

1. Faça login com as credenciais
2. Acesse o painel administrativo
3. Verifique se as menus e funcionalidades estão visíveis
4. Navegue entre as páginas para confirmar o roteamento

---

## Solucionando Problemas Comuns

### Erro: `P1001 - Can't reach database server`

**Causa**: O PostgreSQL não está rodando ou a porta está incorreta.

**Solução**:
```bash
# Verifique se o PostgreSQL está rodando
docker ps

# Ou, se usando PostgreSQL local (Windows)
services.msc  # Procure por "postgresql"

# Reinicie o serviço
docker compose restart db
```

### Erro: `P3009 - Migration failed`

**Causa**: Migrações anteriores falharam ou o banco está em estado inconsistente.

**Solução**:
```bash
# Resetar o banco (cuidado: apaga dados)
npx prisma migrate reset

# Reaplicar migrations
npx prisma migrate dev
```

### Erro: `AUTH_SECRET is not set`

**Causa**: A variável `AUTH_SECRET` não está definida no `.env`.

**Solução**:
```bash
# Gere uma chave aleatória
openssl rand -base64 32

# Cole o resultado no arquivo .env como valor de AUTH_SECRET
```

### Erro: `Module not found` ao executar `npm run dev`

**Causa**: Dependências não instaladas corretamente.

**Solução**:
```bash
# Remova node_modules e reinstale
rm -rf node_modules
rm package-lock.json
npm install
```

### Erro: `Port 3000 already in use`

**Causa**: Outra aplicação está usando a porta 3000.

**Solução**:
```bash
# Encontre o processo que usa a porta (Windows)
netstat -ano | findstr :3000

# Finalize o processo (substitua <PID>)
taskkill /PID <PID> /F

# Ou execute na porta 3001
PORT=3001 npm run dev
```

### Erro: Prisma Client não gerado

**Causa**: O Prisma Client não foi gerado após instalação.

**Solução**:
```bash
npx prisma generate
```

### Erro: `EACCES` ou permissão negada (Linux/macOS)

**Causa**: Problemas de permissão no diretório do projeto.

**Solução**:
```bash
sudo chown -R $USER:$USER /caminho/para/derech-noach
```

### Erro de Conexão com S3

**Causa**: Credenciais do S3 incorretas ou bucket não existe.

**Solução**:
1. Verifique as variáveis `S3_*` no arquivo `.env`
2. Confirme que o bucket existe na AWS/R2
3. Verifique se as credenciais têm permissão de escrita

---

## Próximos Passos

Após a instalação bem-sucedida, consulte:

- **[Manual de Desenvolvimento](DESENVOLVIMENTO.md)** — Guia completo para contribuir com o projeto
- **[Manual de Arquitetura](ARQUITETURA.md)** — Entenda a estrutura do sistema
- **[Manual de Deploy](DEPLOY.md)** — Publique o sistema em produção

---

## Suporte

Se encontrar problemas não listados neste manual:

1. Verifique as [Issues](https://github.com/seu-org/derech-noach/issues) no GitHub
2. Consulte os logs do servidor: `npm run dev` exibe logs no terminal
3. Consulte os logs do banco: `docker compose logs db`
4. Abra uma nova issue com detalhes do erro e ambiente
