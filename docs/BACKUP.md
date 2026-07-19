# Manual de Backup e Recuperação — Projeto DERECH NOACH

Procedimentos para backup e recuperação da plataforma.

---

## Estratégia de Backup

### Componentes que Necessitam de Backup

| Componente | Tipo | Frequência |
|-----------|------|-----------|
| PostgreSQL | Banco de dados | Diário |
| public/uploads/ | Arquivos enviados | Diário |
| .env | Configurações | A cada alteração |
| prisma/schema.prisma | Schema do banco | A cada alteração |

---

## Backup do PostgreSQL

### Backup Manual

```bash
# Backup completo
pg_dump -U postgres -h localhost portal_bneinoach > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas estrutura
pg_dump -U postgres -h localhost -s portal_bneinoach > estrutura_$(date +%Y%m%d).sql

# Backup apenas dados
pg_dump -U postgres -h localhost -a portal_bneinoach > dados_$(date +%Y%m%d).sql
```

### Backup Automatizado (Windows)

Criar script `scripts/backup-db.ps1`:

```powershell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\Backups\DERECH_NOACH"
$backupFile = "$backupDir\backup_$timestamp.sql"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" `
  -U postgres `
  -h localhost `
  -d portal_bneinoach `
  -f $backupFile

Write-Output "Backup criado: $backupFile"
```

### Backup Automatizado (Linux/Docker)

```bash
#!/bin/bash
# scripts/backup-db.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/derech-noach"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

docker exec postgres pg_dump -U postgres portal_bneinoach > $BACKUP_FILE

# Manter apenas últimos 30 backups
ls -t $BACKUP_DIR/backup_*.sql | tail -n +31 | xargs rm -f

echo "Backup criado: $BACKUP_FILE"
```

### Cron Job (Linux)

```bash
# Editar crontab
crontab -e

# Adicionar (diariamente às 2h)
0 2 * * * /caminho/para/scripts/backup-db.sh >> /var/log/derech-noach-backup.log 2>&1
```

### Agendador de Tarefas (Windows)

1. Abrir Agendador de Tarefas
2. Criar nova tarefa
3. Ação: `powershell.exe -File "C:\Projetos\DERECH_NOACH\scripts\backup-db.ps1"`
4. Agendar: Diariamente às 02:00

---

## Backup de Arquivos

```bash
# Backup de uploads
tar -czf uploads_$(date +%Y%m%d).tar.gz public/uploads/

# Backup completo do projeto (excluindo node_modules)
tar -czf derech-noach_$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  .
```

---

## Recuperação

### Restaurar Banco de Dados

```bash
# Parar a aplicação primeiro
# Restaurar
psql -U postgres -h localhost portal_bneinoach < backup_20260719_020000.sql

# Verificar integridade
npx prisma migrate status
```

### Restaurar Arquivos

```bash
# Restaurar uploads
tar -xzf uploads_20260719.tar.gz -C /

# Restaurar projeto completo
tar -xzf derech-noach_20260719.tar.gz -C /caminho/destino
```

---

## Recuperação de Desastres

### Cenário 1: Corrupção do Banco

1. Parar a aplicação
2. Criar backup do banco corrompido (para análise)
3. Dropar o banco
4. Recriar: `createdb portal_bneinoach`
5. Restaurar do backup mais recente
6. Aplicar migrações pendentes: `npx prisma migrate deploy`
7. Reiniciar a aplicação

### Cenário 2: Perda do Servidor

1. Provisionar novo servidor
2. Instalar dependências (Node.js, PostgreSQL, Redis)
3. Clonar repositório
4. Configurar .env
5. Restaurar backup do banco
6. Restaurar uploads
7. Build e deploy

### Cenário 3: Atualização com Erro

1. Reverter para o commit anterior
2. Rebuild: `npm run build`
3. Restart da aplicação
4. Investigar o erro
5. Corrigir e re-deploy

---

## Verificação de Integridade

```bash
# Verificar migrações
npx prisma migrate status

# Verificar conexão com banco
npx prisma db pull --print | head -20

# Verificar Prisma Client
npx prisma generate
```

---

*Manual atualizado em Julho 2026.*
