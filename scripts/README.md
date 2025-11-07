# Scripts de Utilidad

Colección de scripts auxiliares para inicialización de base de datos, verificación de conectividad y validación de seguridad.

## 📋 Descripción

Esta carpeta contiene **3 scripts** que facilitan tareas comunes de DevOps:
- Inicialización automática del schema de PostgreSQL
- Verificación de conectividad con Grafana Cloud
- Detección de secretos hardcodeados en el código

## 📁 Scripts Disponibles

### 1. `init-db.js` - Inicialización de Base de Datos

**Lenguaje**: Node.js  
**Propósito**: Crear tabla `users` en PostgreSQL automáticamente

#### Uso

```bash
# Desde la raíz del proyecto
node scripts/init-db.js

# O desde la carpeta scripts
cd scripts
node init-db.js
```

#### Requisitos

- Node.js instalado
- Variable de entorno `DATABASE_URL` configurada
- Paquete `pg` instalado (viene en dependencias del backend)

#### ¿Qué hace?

```javascript
// 1. Lee DATABASE_URL desde variables de entorno
const DATABASE_URL = process.env.DATABASE_URL;

// 2. Se conecta a PostgreSQL
const client = new Client({ connectionString: DATABASE_URL });

// 3. Ejecuta query DDL
const query = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );
`;

// 4. Inserta datos de ejemplo (opcional)
INSERT INTO users (name) VALUES 
  ('Usuario Demo 10:00:00'),
  ('Test User 11:30:45');

// 5. Cierra conexión
client.end();
```

#### Salida Esperada

```
Conectando a PostgreSQL...
✓ Tabla 'users' creada exitosamente
✓ 2 usuarios de ejemplo insertados
Conexión cerrada
```

#### Variables de Entorno Requeridas

```bash
# .env o shell export
DATABASE_URL=postgres://user:password@host:5432/dbname

# Ejemplo Render
DATABASE_URL=postgres://crud_user:xxxxx@dpg-xxxxx.oregon-postgres.render.com/crud_db
```

#### Troubleshooting

**Error: "DATABASE_URL is not defined"**
```bash
# Verificar variable
echo $DATABASE_URL

# Configurarla
export DATABASE_URL="postgres://..."

# O crear .env en raíz
echo "DATABASE_URL=postgres://..." > .env
```

**Error: "ECONNREFUSED"**
- PostgreSQL no está corriendo
- Host/puerto incorrecto en DATABASE_URL
- Firewall bloqueando conexión

**Error: "permission denied for schema public"**
- Usuario de DB no tiene permisos CREATE
- Conectar como superuser o otorgar permisos

---

### 2. `verify-grafana.ps1` - Verificación de Grafana Cloud

**Lenguaje**: PowerShell  
**Propósito**: Probar conectividad y autenticación con Grafana Cloud Prometheus

#### Uso

```powershell
# Windows PowerShell
.\scripts\verify-grafana.ps1

# Con parámetros personalizados
.\scripts\verify-grafana.ps1 `
  -Url "https://prometheus-prod-13-prod-us-east-0.grafana.net" `
  -User "123456" `
  -ApiKey "glc_xxxxxxxxxxxxx"
```

#### Parámetros

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `-Url` | String | URL de Grafana Cloud Prometheus | `$env:GRAFANA_CLOUD_PROMETHEUS_API_URL` |
| `-User` | String | User ID de Grafana Cloud | `$env:GRAFANA_CLOUD_API_USER` |
| `-ApiKey` | String | API Key de Grafana Cloud | `$env:GRAFANA_CLOUD_API_KEY` |

#### ¿Qué hace?

```powershell
# 1. Lee credenciales (parámetros o env vars)
$Url = $env:GRAFANA_CLOUD_PROMETHEUS_API_URL
$User = $env:GRAFANA_CLOUD_API_USER
$ApiKey = $env:GRAFANA_CLOUD_API_KEY

# 2. Construye autenticación Basic
$base64Auth = [Convert]::ToBase64String(
  [Text.Encoding]::ASCII.GetBytes("$($User):$($ApiKey)")
)

# 3. Envía request de prueba a /api/prom/api/v1/query
Invoke-RestMethod -Uri "$Url/api/prom/api/v1/query" `
  -Headers @{Authorization = "Basic $base64Auth"} `
  -Method GET

# 4. Muestra resultado
Write-Host "✓ Conexión exitosa con Grafana Cloud" -ForegroundColor Green
```

#### Salida Esperada

```
Verificando conectividad con Grafana Cloud...
URL: https://prometheus-prod-13-prod-us-east-0.grafana.net
User: 123456

✓ Autenticación exitosa
✓ Endpoint /api/prom accesible
✓ Grafana Cloud operativo

Status Code: 200
Response: {"status":"success","data":{"resultType":"vector","result":[]}}
```

#### Variables de Entorno Requeridas

```powershell
# PowerShell
$env:GRAFANA_CLOUD_PROMETHEUS_API_URL = "https://prometheus-prod-xx-xxx.grafana.net"
$env:GRAFANA_CLOUD_API_USER = "123456"
$env:GRAFANA_CLOUD_API_KEY = "glc_xxxxxxxxxxxxx"

# CMD
set GRAFANA_CLOUD_PROMETHEUS_API_URL=https://...
set GRAFANA_CLOUD_API_USER=123456
set GRAFANA_CLOUD_API_KEY=glc_xxxxx
```

#### Troubleshooting

**Error: "401 Unauthorized"**
- API Key inválida o expirada
- User ID incorrecto
- Regenerar API Key en Grafana Cloud

**Error: "Cannot bind parameter 'Url'"**
- Parámetros mal formateados
- Usar backtick `` ` `` para continuar línea en PowerShell

**Error: "The remote name could not be resolved"**
- URL de Grafana incorrecta
- Verificar en Grafana Cloud → Connections → Prometheus

---

### 3. `check-secrets.sh` - Detector de Secretos Hardcodeados

**Lenguaje**: Bash  
**Propósito**: Escanear código en busca de credenciales o secretos hardcodeados

#### Uso

```bash
# Escanear todo el repositorio
bash scripts/check-secrets.sh

# Escanear solo backend
bash scripts/check-secrets.sh backend/

# Con Git Bash en Windows
"C:\Program Files\Git\bin\bash.exe" scripts/check-secrets.sh
```

#### ¿Qué detecta?

Patrones comunes de secretos:

```regex
# AWS Keys
AKIA[0-9A-Z]{16}

# API Keys genéricas
api[_-]?key[_-]?=["']?[A-Za-z0-9]{20,}

# Passwords en código
password[_-]?=["']?[^"'\s]{6,}

# Tokens
(token|bearer)[_-]?=["']?[A-Za-z0-9\-._~+/]+=*

# Database URLs
postgres://[^:]+:[^@]+@[^/]+/\w+

# Private Keys
-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----
```

#### Salida Esperada

**Sin secretos encontrados**:
```
🔍 Escaneando repositorio en busca de secretos...

✓ No se encontraron secretos hardcodeados
✓ Código seguro para commit
```

**Con secretos detectados**:
```
🔍 Escaneando repositorio en busca de secretos...

⚠️  Posibles secretos encontrados:

backend/config.js:12
  → const apiKey = "sk_live_1234567890abcdef"

.env.example:5
  → DATABASE_URL=postgres://user:password@localhost/db

❌ Se encontraron 2 potenciales secretos
❌ Revisar y remover antes de commit
```

#### Integración con Git Hooks

Añadir a `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Ejecutar check de secretos
bash scripts/check-secrets.sh

# Bloquear commit si hay secretos
if [ $? -ne 0 ]; then
  echo "❌ Commit bloqueado: secretos detectados"
  exit 1
fi
```

#### Falsos Positivos

Excluir archivos legítimos:

```bash
# Editar check-secrets.sh
EXCLUDED_FILES=(
  ".env.example"
  "README.md"
  "docs/"
)

# O usar .gitignore
echo ".env" >> .gitignore
echo "secrets/" >> .gitignore
```

#### Troubleshooting

**Error: "bash: command not found" (Windows)**
```bash
# Instalar Git Bash
choco install git

# O usar WSL
wsl bash scripts/check-secrets.sh
```

**Script no encuentra archivos**
```bash
# Dar permisos de ejecución (Linux/Mac)
chmod +x scripts/check-secrets.sh

# Verificar ruta
pwd  # Debe estar en raíz del proyecto
```

---

## 🚀 Ejecución Automatizada

### En CI/CD (GitHub Actions)

```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  check-secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run secret detection
        run: bash scripts/check-secrets.sh

  init-test-db:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Initialize database
        env:
          DATABASE_URL: postgres://postgres:testpass@localhost/testdb
        run: node scripts/init-db.js
```

### Pre-commit Hook (Husky)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "bash scripts/check-secrets.sh"
    }
  }
}
```

### Cron Job (Linux/Mac)

```bash
# Verificar Grafana cada hora
0 * * * * cd /path/to/project && pwsh scripts/verify-grafana.ps1 >> logs/grafana-check.log 2>&1

# Inicializar DB diariamente (backup)
0 2 * * * cd /path/to/project && node scripts/init-db.js >> logs/db-init.log 2>&1
```

## 📊 Casos de Uso

### Caso 1: Setup Inicial de Proyecto

```bash
# 1. Clonar repo
git clone https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto.git
cd DevOps_freeCodeCamp_Proyecto

# 2. Configurar variables
export DATABASE_URL="postgres://..."
export GRAFANA_CLOUD_API_KEY="..."

# 3. Inicializar DB
node scripts/init-db.js

# 4. Verificar Grafana
pwsh scripts/verify-grafana.ps1

# 5. Check de seguridad
bash scripts/check-secrets.sh
```

### Caso 2: Pre-Deployment Checklist

```bash
# Ejecutar todos los scripts
echo "1. Verificando base de datos..."
node scripts/init-db.js

echo "2. Verificando Grafana..."
pwsh scripts/verify-grafana.ps1

echo "3. Escaneando secretos..."
bash scripts/check-secrets.sh

echo "✓ Pre-deployment checks completados"
```

### Caso 3: Troubleshooting Producción

```bash
# DB no responde
node scripts/init-db.js
# Si falla: revisar DATABASE_URL y conectividad

# Métricas no llegan a Grafana
pwsh scripts/verify-grafana.ps1
# Si falla: verificar API key y URL

# Leak de secretos reportado
bash scripts/check-secrets.sh
# Buscar y remover secretos hardcodeados
```

## 🔒 Mejores Prácticas

### ✅ DO:
- Ejecutar `init-db.js` solo en entornos dev/staging
- Rotar `GRAFANA_CLOUD_API_KEY` cada 90 días
- Correr `check-secrets.sh` en pre-commit hook
- Mantener scripts idempotentes (pueden ejecutarse múltiples veces)
- Loguear salidas para troubleshooting

### ❌ DON'T:
- Ejecutar `init-db.js` en producción sin backup
- Commitear `.env` con secretos reales
- Ignorar warnings de `check-secrets.sh`
- Hardcodear credenciales en los scripts
- Compartir API keys en Slack/email

## 🧪 Testing de Scripts

### Test `init-db.js`

```bash
# Setup DB de prueba
export DATABASE_URL="postgres://localhost/testdb"

# Ejecutar script
node scripts/init-db.js

# Verificar tabla creada
psql $DATABASE_URL -c "\dt users"

# Verificar datos
psql $DATABASE_URL -c "SELECT * FROM users;"

# Cleanup
psql $DATABASE_URL -c "DROP TABLE users;"
```

### Test `verify-grafana.ps1`

```powershell
# Mock de credenciales (fail esperado)
$env:GRAFANA_CLOUD_API_KEY = "invalid"

# Debería fallar con 401
.\scripts\verify-grafana.ps1

# Con credenciales reales (success esperado)
$env:GRAFANA_CLOUD_API_KEY = "glc_valid_key"
.\scripts\verify-grafana.ps1
```

### Test `check-secrets.sh`

```bash
# Crear archivo con secreto de prueba
echo 'const apiKey = "sk_live_12345";' > test-secret.js

# Ejecutar scanner
bash scripts/check-secrets.sh

# Debe detectar secreto
# Output esperado: ⚠️ Posibles secretos encontrados

# Cleanup
rm test-secret.js
```

## 📚 Referencias

- [PostgreSQL Node.js Client (pg)](https://node-postgres.com/)
- [Grafana Cloud API Docs](https://grafana.com/docs/grafana-cloud/reference/cloud-api/)
- [PowerShell Invoke-RestMethod](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-restmethod)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)

## 🔗 Enlaces Relacionados

- [Backend README](../backend/README.md)
- [Infrastructure README](../infrastructure/README.md)
- [CI/CD Workflows](../.github/workflows/README.md)
- [Main Project README](../README.md)
