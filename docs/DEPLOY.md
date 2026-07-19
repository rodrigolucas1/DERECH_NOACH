# Manual de Deploy — Projeto DERECH NOACH

Guia completo para deploy da plataforma em produção.

---

## Opções de Deploy

### 1. Vercel (Recomendado para Início)

A plataforma é otimizada para deploy na Vercel.

#### Passo a Passo

1. Conecte o repositório à Vercel
2. Configure as variáveis de ambiente (veja abaixo)
3. A Vercel detecta automaticamente o Next.js
4. Deploy automático a cada push na `main`

#### Configuração

- **Framework Preset**: Next.js
- **Build Command**: `npx prisma generate && next build`
- **Install Command**: `npm install`
- **Root Directory**: `/`

### 2. Docker (Produção Completa)

```bash
# Build da imagem
docker build -t derech-noach .

# Executar
docker run -p 3000:3000 --env-file .env derech-noach
```

#### Docker Compose (Produção)

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - postgres
      - redis
    restart: always

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: portal_bneinoach
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

volumes:
  pgdata:
```

### 3. VPS / Servidor Próprio

```bash
# 1. Instalar dependências do sistema
sudo apt update && sudo apt install -y nodejs npm postgresql redis-server

# 2. Clonar o repositório
git clone <url-do-repo>
cd DERECH_NOACH

# 3. Instalar dependências
npm install

# 4. Configurar ambiente
cp .env.example .env
# Editar .env

# 5. Gerar Prisma Client
npx prisma generate

# 6. Aplicar migrações
npx prisma migrate deploy

# 7. Popular banco (primeira vez)
npm run db:seed

# 8. Build de produção
npm run build

# 9. Iniciar com PM2
npm install -g pm2
pm2 start npm --name "derech-noach" -- start
pm2 save
```

---

## Variáveis de Ambiente

### Obrigatórias

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@host:5432/portal_bneinoach"

# NextAuth
NEXTAUTH_SECRET="chave-secreta-minimo-32-caracteres"
NEXTAUTH_URL="https://seudominio.com"
```

### Opcionais

```env
# Redis (cache)
REDIS_URL="redis://localhost:6379"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM="noreply@seudominio.com"

# Armazenamento (Cloudflare R2)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY=""
R2_SECRET_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""

# Sentry (monitoramento)
SENTRY_DSN=""

# Analytics (Plausible)
PLAUSIBLE_DOMAIN=""
```

---

## Migrações em Produção

```bash
# NUNCA usar migrate dev em produção
# Usar sempre migrate deploy
npx prisma migrate deploy

# Verificar migrações pendentes
npx prisma migrate status
```

---

## Checklist Pós-Deploy

- [ ] Site acessível na URL correta
- [ ] Login funcionando
- [ ] Registro funcionando
- [ ] Admin dashboard carregando
- [ ] Upload de arquivos funcionando
- [ ] Branding do tenant carregando
- [ ] Banco de dados conectado
- [ ] Redis conectado (se configurado)
- [ ] Email funcionando (se configurado)
- [ ] SSL/HTTPS ativo
- [ ] Headers de segurança configurados
- [ ] Rate limiting ativo
- [ ] Logs configurados
- [ ] Backup automatizado

---

## Performance em Produção

- **CDN**: Usar CDN para assets estáticos (Vercel faz automaticamente)
- **Cache**: Configurar Redis para cache de queries frequentes
- **Imagens**: Usar next/image para otimização automática
- **Compressão**: Ativar gzip/brotli no servidor
- **Lazy Loading**: Implementar para componentes pesados

---

## Monitoramento

### Sentry (Recomendado)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Logs

Em produção, usar structured logging:

```typescript
console.log(JSON.stringify({
  level: "info",
  message: "Upload realizado",
  userId: ctx.userId,
  tenantId: ctx.tenantId,
  timestamp: new Date().toISOString(),
}));
```

---

*Manual atualizado em Julho 2026.*
