# CI/CD Workflows - GitHub Actions (AUTOMATIZADOS)

> ✅ **CONFIGURACIÓN ACTUAL**: Todos los workflows se ejecutan **automáticamente** al hacer push/PR para proporcionar integración y despliegue continuos completos.

Conjunto de workflows automatizados que implementan un pipeline DevOps completo para integración continua, escaneo de seguridad, construcción de imágenes Docker y despliegue, ejecutándose **automáticamente en cada cambio relevante**.

## 📋 Descripción

Este directorio contiene **8 workflows de GitHub Actions** diseñados para:
- ✅ **Ejecución automática en push/PR** para CI/CD tradicional
- ✅ **Path filters inteligentes** para ejecutar solo cuando sea necesario
- ✅ **Scans de seguridad automáticos** semanales + en cada cambio
- ✅ **Docker builds automáticos** cuando cambia código o Dockerfiles
- ✅ **Pipeline completo end-to-end** en cada push a main

**Estado actual**: Configurado para ejecución automática completa (DevOps tradicional)

## 🔄 Workflows Disponibles

### 1. `ci.yml` - Continuous Integration ⚡ AUTOMÁTICO

**Propósito**: Pipeline básico de CI para validar código en cada cambio

**Triggers**:
- ✅ **Push a `main` o `develop`** (automático con path filters)
- ✅ **Pull Requests a `main`** (automático)
- 🔘 **workflow_dispatch** (también permite ejecución manual)

**Path Filters** (solo se ejecuta si cambias):
- `backend/**`
- `frontend/**`
- `package*.json`
- `.github/workflows/ci.yml`

**Optimizaciones aplicadas**:
- ✅ Consolidación: 3 jobs → 1 job con matriz
- ✅ Cache de npm con `cache-dependency-path`
- ✅ Path filters para evitar ejecuciones en cambios irrelevantes
- ✅ `continue-on-error` para resiliencia

**Jobs**:
```yaml
build-and-test:
  strategy:
    matrix:
      component: [backend, frontend]
  steps:
    - checkout
    - setup-node (v18)
    - install-deps (npm ci --prefer-offline)
    - run tests (--passWithNoTests)
    - lint (ESLint)
    - upload artifacts (1 day retention)
```

**Duración aproximada**: 3-4 minutos por push

**Ejecución**:
- **Automática**: Al hacer `git push` con cambios en backend/frontend
- **Manual**: `gh workflow run ci.yml`

---

### 2. `docker-build.yml` - Docker Image Build 🐳 AUTOMÁTICO

**Propósito**: Construir y pushear imágenes Docker automáticamente

**Triggers**:
- ✅ **Push a `main`** (automático con path filters)
- ✅ **Pull Requests a `main`** (automático)
- 🔘 **workflow_dispatch** (manual con opciones)
  - `component`: backend | frontend | both
  - `push_to_hub`: true | false

**Path Filters** (solo se ejecuta si cambias):
- `backend/**`
- `frontend/**`
- `**/Dockerfile`

**Optimizaciones aplicadas**:
- ✅ Builds automáticos en cada push relevante
- ✅ Docker Buildx con cache de GitHub Actions
- ✅ Multi-platform support (amd64, arm64)
- ✅ Push automático a Docker Hub en push a main
- ✅ Smart component detection (construye lo que cambió)

**Jobs**:
```yaml
build:
  steps:
    - checkout
    - setup-buildx
    - determine-components (automático)
    - login-dockerhub
    - build-and-push-backend
    - build-and-push-frontend
      - cache: type=gha (GitHub Actions cache)
      - tags: latest + SHA
```

**Secrets requeridos**:
- `DOCKERHUB_USERNAME` ⚠️ **Obligatorio**
- `DOCKERHUB_TOKEN` ⚠️ **Obligatorio**

**Duración aproximada**: 4-6 minutos por push

**Ejecución**:
- **Automática**: Al hacer push con cambios en código o Dockerfiles
- **Manual**: `gh workflow run docker-build.yml -f component=both -f push_to_hub=true`

---

### 3. `complete-pipeline.yml` - End-to-End Pipeline 🚀 AUTOMÁTICO

**Propósito**: Workflow completo de build, test, security y deploy en cada push

**Triggers**:
- ✅ **Push a `main`** (automático con path filters)
- 🔘 **workflow_dispatch** (manual con opciones)
  - `environment`: development | staging | production
  - `skip_tests`: boolean

**Path Filters**:
- `backend/**`
- `frontend/**`
- `**/Dockerfile`
- `package*.json`

**Optimizaciones aplicadas**:
- ✅ Se ejecuta automáticamente en cada push relevante
- ✅ Jobs secuenciales con condicionales
- ✅ Environment deployment automático
- ✅ Health checks POST-deploy

**Jobs** (en secuencia):
```mermaid
graph LR
    A[Build & Test] --> B[Security Scan]
    B --> C[Deploy to Render]
    C --> D[Health Check]
```

1. **build-and-test**: CI completo (skippable en manual)
2. **security-scan**: Análisis de vulnerabilidades
3. **deploy**: Trigger Render deployment hook (automático)
4. **health-check**: Verificación POST-deploy

**Duración aproximada**: 8-12 minutos por push

**Ejecución**:
- **Automática**: En cada push a main con cambios relevantes
- **Manual**: `gh workflow run complete-pipeline.yml -f environment=production`

---

### 4. `codeql.yml` - Code Security Analysis 🔒 OPTIMIZADO

**Propósito**: Análisis estático de código con GitHub CodeQL

**Triggers**:
- 🔘 **workflow_dispatch** (manual)
- Push a `main` (solo si cambios en: `**.js`, `**.jsx`, `**.ts`, `**.tsx`)
- Pull Requests a `main`
- Schedule: **Lunes a las 6 AM UTC** (semanal, no diario)

**Optimizaciones aplicadas**:
- ✅ Path filters (solo archivos JavaScript/TypeScript)
- ✅ Schedule reducido: semanal vs diario
- ✅ Queries: security-and-quality

**Lenguajes analizados**:
- JavaScript/TypeScript

**Checks**:
- ✅ Inyección SQL
- ✅ XSS (Cross-Site Scripting)
- ✅ Path traversal
- ✅ Hardcoded secrets
- ✅ Command injection

**Resultados**: Visibles en **Security → Code scanning alerts**

**Duración aproximada**: 2-4 minutos

**Consumo mensual**: ~1 ejecución/semana = ~8-16 min/mes (vs ~60-120 min/mes anterior)

---

### 5. `zap-scan.yml` - OWASP ZAP Security Scan 🛡️ OPTIMIZADO

**Propósito**: Escaneo de vulnerabilidades web con OWASP ZAP

**Triggers**:
- 🔘 **workflow_dispatch** (manual)
  - `target_url`: URL a escanear
  - `scan_type`: baseline | full
- Schedule: **Miércoles a las 10 AM UTC** (semanal)

**Optimizaciones aplicadas**:
- ✅ Solo ejecución manual + 1 schedule semanal
- ✅ Selección de tipo de scan (baseline vs full)
- ✅ URL configurable como input
- ✅ Reporte uploadado como artifact (30 días)
- ✅ Summary en GitHub Step Summary

**Target por defecto**: `https://crud-frontend-cerx.onrender.com`

**Tipos de escaneo**:
- **Baseline Scan**: Escaneo pasivo rápido (~5-8 min)
- **Full Scan**: Escaneo activo completo (~30-60 min, solo manual)

**Vulnerabilidades detectadas**:
- SQL Injection
- XSS
- CSRF
- Insecure headers
- SSL/TLS issues

**Reporte**: `report_html.html` (artifact)

**Duración aproximada**: 5-10 minutos (baseline) / 30-60 min (full)

**Consumo mensual**: ~4 scans/mes = ~20-40 min/mes (vs ~160-320 min/mes anterior)

**Uso**:
```bash
# Scan baseline de producción
gh workflow run zap-scan.yml -f target_url=https://crud-frontend-cerx.onrender.com -f scan_type=baseline

# Full scan (solo cuando sea necesario)
gh workflow run zap-scan.yml -f target_url=https://tu-app.com -f scan_type=full
```

---

### 6. `trivy-scan.yml` - Container Security Scan 🔍 AUTOMÁTICO

**Propósito**: Escanear imágenes Docker por vulnerabilidades automáticamente

**Triggers**:
- ✅ **Push a `main`** (automático con path filters)
- ✅ **Pull Requests** (automático)
- � **Schedule: Martes 9 AM UTC** (semanal adicional)
- �🔘 **workflow_dispatch** (manual)
  - `component`: backend | frontend | both
  - `severity`: CRITICAL,HIGH (default)

**Path Filters**:
- `backend/**`
- `frontend/**`
- `**/Dockerfile`

**Optimizaciones aplicadas**:
- ✅ Ejecución automática en cada cambio relevante
- ✅ Scan semanal programado adicional
- ✅ Severity configurable
- ✅ Resultados en SARIF → GitHub Security
- ✅ Reporte legible en artifacts (30 días)

**Escanea**:
- `crud-backend:scan` (construido localmente)
- `crud-frontend:scan` (construido localmente)

**Severity levels**:
- 🔴 CRITICAL
- 🟠 HIGH
- 🟡 MEDIUM
- 🟢 LOW

**Reporte**: SARIF + archivo de texto en artifacts

**Duración aproximada**: 3-5 minutos

**Ejecución**:
- **Automática**: Al hacer push con cambios en código/Dockerfiles
- **Semanal**: Martes 9 AM (adicional)
- **Manual**: `gh workflow run trivy-scan.yml -f component=both`

---

### 7. `matrix-test.yml` - Cross-Environment Testing 🧪 OPTIMIZADO

**Propósito**: Probar compatibilidad (reducido a Node 18 LTS)

**Triggers**:
- 🔘 **workflow_dispatch** (manual)
  - `node_versions`: versiones a probar
  - `test_backend`: boolean
  - `test_frontend`: boolean
- Schedule: **Domingo a las 8 AM UTC** (semanal)

**Optimizaciones aplicadas**:
- ✅ Solo Node 18.x (versión actual) vs 3 versiones anteriores
- ✅ Removido matrix de databases (Postgres solo)
- ✅ Cache de npm optimizado
- ✅ `continue-on-error` para no bloquear
- ✅ Artifacts con 7 días de retención

**Matrix Strategy**:
```yaml
strategy:
  matrix:
    node-version: [18.x]  # Solo versión actual
    component: [backend, frontend]
```

**Combinaciones probadas**: 2 (1 versión × 2 componentes)

**Duración aproximada**: 4-5 minutos

**Consumo mensual**: ~4 ejecuciones/mes = ~16-20 min/mes (vs ~80-120 min/mes anterior)

**Uso**:
```bash
# Test de ambos componentes
gh workflow run matrix-test.yml

# Test solo backend
gh workflow run matrix-test.yml -f test_backend=true -f test_frontend=false
```

---

### 8. `deploy-aws.yml` - AWS Deployment (DESHABILITADO) ☁️

**Propósito**: Deployment manual a AWS ECR (preparado para futuro)

**Estado**: ⚠️ **DESHABILITADO** - No se usa actualmente (despliegue en Render)

**Triggers**:
- 🔘 **workflow_dispatch SOLAMENTE** (requiere confirmación "DEPLOY")

**Optimizaciones aplicadas**:
- ✅ Completamente deshabilitado para auto-triggers
- ✅ Requiere confirmación explícita tipo "DEPLOY"
- ✅ Validación de confirmación en job separado
- ✅ Selección de environment y component

**Parámetros**:
- `component`: backend | frontend
- `environment`: dev | staging | production
- `confirm_deploy`: debe escribir "DEPLOY"

**Steps**:
```yaml
validate: Verificar confirmación
deploy:
  - Configure AWS credentials
  - Build Docker image
  - Login to ECR
  - Push to ECR (latest + SHA)
  - Deployment summary
```

**Secrets requeridos** (si se habilita):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

**⚠️ Nota**: Este workflow está preparado pero no se ejecuta. El proyecto usa Render con auto-deploy desde GitHub.

**Duración aproximada**: 8-10 minutos (solo si se ejecuta manualmente con confirmación)

**Consumo mensual**: 0 min/mes (deshabilitado)

## 📊 Resumen de Ejecución Automática

### Estado Actual de Triggers

| Workflow | Push Auto | PR Auto | Schedule | Manual | Consumo/Push |
|----------|-----------|---------|----------|--------|--------------|
| `ci.yml` | ✅ | ✅ | - | ✅ | ~4 min |
| `docker-build.yml` | ✅ | ✅ | - | ✅ | ~6 min |
| `complete-pipeline.yml` | ✅ | - | - | ✅ | ~12 min |
| `codeql.yml` | ✅ | ✅ | Lunes | ✅ | ~3 min |
| `zap-scan.yml` | - | - | Miércoles | ✅ | ~8 min |
| `trivy-scan.yml` | ✅ | ✅ | Martes | ✅ | ~4 min |
| `matrix-test.yml` | - | - | Domingo | ✅ | ~5 min |
| `deploy-aws.yml` | - | - | - | ✅ | Deshabilitado |

### Consumo Estimado por Push a Main

```
Un push típico con cambios en backend/frontend ejecuta:
┌─────────────────────────────────────────────┐
│  1. ci.yml              ~4 min              │
│  2. docker-build.yml    ~6 min              │
│  3. complete-pipeline   ~12 min             │
│  4. codeql.yml          ~3 min              │
│  5. trivy-scan.yml      ~4 min              │
│  ─────────────────────────────────────────  │
│  TOTAL POR PUSH:        ~29 minutos         │
└─────────────────────────────────────────────┘

Con 10 pushes/semana:
- 10 pushes × 29 min = 290 min/semana
- 290 × 4 semanas = 1,160 min/mes (commits)
- + 80 min/mes (schedules semanales)
- = ~1,240 minutos/mes TOTAL

Estado: ✅ Dentro del límite de 2,000 min/mes (62% uso)
```

### Path Filters Inteligentes

Los workflows NO se ejecutan si solo cambias:
- ❌ README.md
- ❌ Documentación
- ❌ .gitignore
- ❌ Archivos de configuración no críticos

**Ejemplo**:
```powershell
# Este push NO ejecuta workflows
git commit -m "docs: update README"
git push  # 0 minutos consumidos ✅

# Este push SÍ ejecuta workflows
git commit -m "feat: add new API endpoint in backend"
git push  # ~29 minutos consumidos
```

---

## 🚀 Cómo Usar los Workflows Optimizados

### Método 1: Ejecutar Workflow Manualmente (GitHub UI)

1. Ve a tu repositorio en GitHub
2. Click en pestaña **"Actions"**
3. En el panel izquierdo, selecciona el workflow
4. Click botón **"Run workflow"** (esquina superior derecha)
5. Selecciona rama (**main**)
6. Configura parámetros de entrada (si los hay)
7. Click botón verde **"Run workflow"**

**Ejemplo visual**:
```
Actions → CI Pipeline → [Run workflow ▼] → Select: main → [Run workflow]
```

### Método 2: GitHub CLI (Línea de Comandos)

```powershell
# Instalar GitHub CLI (si no lo tienes)
winget install GitHub.cli

# Autenticarse
gh auth login

# Ejecutar workflows
gh workflow run ci.yml
gh workflow run docker-build.yml -f component=both -f push_to_hub=true
gh workflow run complete-pipeline.yml -f environment=development -f skip_tests=false
gh workflow run trivy-scan.yml -f component=backend -f severity="CRITICAL,HIGH"
gh workflow run zap-scan.yml -f target_url=https://crud-frontend-cerx.onrender.com -f scan_type=baseline

# Ver estado de ejecuciones
gh run list --workflow=ci.yml --limit 5
gh run watch  # Monitorear ejecución en tiempo real
gh run view <run-id> --log  # Ver logs completos
```

### Método 3: Act (Ejecutar Localmente)

```powershell
# Instalar Act
winget install nektos.act

# Ejecutar workflow localmente (testing)
act workflow_dispatch -W .github/workflows/ci.yml

# Con variables de entorno
act workflow_dispatch -W .github/workflows/docker-build.yml `
  --input component=backend `
  --input push_to_hub=false

# Dry run (ver qué se ejecutaría)
act workflow_dispatch --dryrun
```

### Ver Resultados y Logs

```powershell
# Opción 1: GitHub UI
# Repository → Actions → Click en workflow run → Ver jobs → Ver logs

# Opción 2: GitHub CLI
gh run list --workflow=ci.yml
gh run view <run-id>
gh run view <run-id> --log
gh run view <run-id> --log-failed  # Solo errores

# Descargar artifacts
gh run download <run-id>

# Ver workflow status en tiempo real
gh run watch
```

### Monitorear Failures y Notificaciones

**Email notifications**: 
- Settings → Notifications → GitHub Actions
- Configurar para recibir solo en failures

**Verificar consumo de minutos**:
```powershell
# Ver uso de Actions
gh api /repos/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions/cache/usage

# O en UI: Settings → Billing and plans → Plans and usage
```

---

## 🔒 Secrets Configurados

### Secrets Requeridos (Settings → Secrets → Actions)

### Secrets Requeridos (Settings → Secrets → Actions)

| Secret | Estado | Uso | Workflows |
|--------|--------|-----|-----------|
| `DOCKERHUB_USERNAME` | ⚠️ Requerido | Login Docker Hub | docker-build.yml |
| `DOCKERHUB_TOKEN` | ⚠️ Requerido | Auth Docker Hub | docker-build.yml, complete-pipeline.yml |
| `RENDER_DEPLOY_HOOK_URL` | ⚙️ Opcional | Trigger deploy Render | complete-pipeline.yml |
| `AWS_ACCESS_KEY_ID` | ⚪ No usado | AWS credentials | deploy-aws.yml (deshabilitado) |
| `AWS_SECRET_ACCESS_KEY` | ⚪ No usado | AWS credentials | deploy-aws.yml (deshabilitado) |
| `AWS_REGION` | ⚪ No usado | AWS región | deploy-aws.yml (deshabilitado) |

### Cómo Configurar Secrets

#### Opción 1: GitHub UI

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Ingresa el nombre del secret (ej: `DOCKERHUB_USERNAME`)
4. Pega el valor
5. Click **"Add secret"**

#### Opción 2: GitHub CLI

```powershell
# Agregar secret interactivamente
gh secret set DOCKERHUB_USERNAME
# Pegar valor cuando se solicite

gh secret set DOCKERHUB_TOKEN
# Pegar token cuando se solicite

# Listar secrets configurados (no muestra valores)
gh secret list

# Eliminar secret
gh secret remove SECRET_NAME
```

### Cómo Obtener Docker Hub Token

1. Ir a https://hub.docker.com/settings/security
2. Click **"New Access Token"**
3. **Description**: `github-actions-devops-proyecto`
4. **Access permissions**: **Read & Write**
5. Click **"Generate"**
6. **Copiar token** (solo se muestra una vez)
7. Agregarlo como secret `DOCKERHUB_TOKEN` en GitHub

### Cómo Obtener Render Deploy Hook (Opcional)

1. Ve a tu servicio en Render Dashboard
2. Click en **"Settings"**
3. Scroll down a **"Deploy Hook"**
4. Click **"Create Deploy Hook"**
5. Copiar la URL generada
6. Agregarla como secret `RENDER_DEPLOY_HOOK_URL`

**Nota**: Render tiene auto-deploy desde GitHub, este secret es opcional.

---

## 📈 Métricas de CI/CD

### KPIs a Monitorear

| Métrica | Target | Actual (Optimizado) | Estado |
|---------|--------|-------------------|--------|
| Build Success Rate | >95% | - | ✅ Monitoreando |
| Average Build Time | <10 min | ~4-8 min | ✅ Cumplido |
| Time to Deploy | <15 min | ~8-12 min | ✅ Cumplido |
| Security Scan Pass Rate | 100% | - | ✅ Monitoreando |
| Monthly Minutes Used | <2,000 | ~200-300 | ✅ 85% bajo límite |

### Dashboard de Métricas (GitHub Insights)

**Ver en**: Actions → Management → View workflow insights

Métricas disponibles:
- ✅ Workflow runs por semana/mes
- ✅ Success vs Failed runs (tasa de éxito)
- ✅ Duración promedio por workflow
- ✅ Billable minutes consumidos
- ✅ Jobs ejecutados por runner

### Comandos para Monitoreo

```powershell
# Ver últimas 20 ejecuciones
gh run list --limit 20

# Ver solo failures
gh run list --status failure

# Ver consumo de almacenamiento (artifacts/cache)
gh api /repos/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions/cache/usage

# Estadísticas de workflows
gh api /repos/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions/workflows | ConvertFrom-Json | Select-Object -ExpandProperty workflows | Format-Table name, state, created_at

# Ver workflow específico con estadísticas
gh workflow view ci.yml
```

---

## 🛠️ Troubleshooting

## 🛠️ Troubleshooting

### ❌ Problema: "Account locked due to billing issue"

**Causa**: Excediste el límite de 2,000 minutos/mes del plan gratuito

**Solución**:

1. **Hacer commit de workflows optimizados** (ya lo tienes):
   ```powershell
   git add .github/workflows/
   git commit -m "optimize: convert workflows to manual-only to resolve billing issue"
   git push origin main
   ```

2. **Verificar que no hay workflows ejecutándose**:
   ```powershell
   gh run list --status in_progress
   # Si hay alguno, cancelar:
   gh run cancel <run-id>
   ```

3. **Contactar GitHub Support**:
   - Ve a https://support.github.com
   - Selecciona: "Actions" → "Billing"
   - Explica: "He optimizado mis workflows para usar solo triggers manuales y reducir consumo en ~85%. Solicito desbloqueo de cuenta."
   - Adjunta screenshot de workflows optimizados

4. **Esperar desbloqueo** (usualmente 24-48 horas)

5. **Verificar funcionamiento**:
   ```powershell
   # Cuando se desbloquee, probar workflow simple
   gh workflow run ci.yml
   ```

---

### ❌ Workflow Falla Consistentemente

**Diagnóstico**:

```powershell
# Ver logs completos
gh run view <run-id> --log

# Ver solo errores
gh run view <run-id> --log-failed

# Descargar logs
gh run download <run-id>
```

**Solución**: Añadir debug logging en workflow:

```yaml
- name: Debug Environment
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    ls -la
    env | sort
```

---

### ❌ Secret No Encontrado

**Error**: `Error: Secret DOCKERHUB_TOKEN not found`

**Verificación**:

```powershell
# Listar secrets (no muestra valores, solo nombres)
gh secret list

# Output esperado:
# DOCKERHUB_USERNAME  Updated 2025-11-07
# DOCKERHUB_TOKEN     Updated 2025-11-07
```

**Solución**:

```powershell
# Agregar secret faltante
gh secret set DOCKERHUB_TOKEN
# Pegar valor cuando se solicite

# Verificar
gh secret list
```

**Alternativa UI**: Settings → Secrets and variables → Actions → Verify secret exists

---

### ❌ Docker Build Timeout

**Error**: `Error: The operation was canceled`

**Causa**: Build de Docker tarda más de 60 minutos (timeout default)

**Solución 1**: Aumentar timeout en workflow:

```yaml
jobs:
  docker-build:
    timeout-minutes: 90  # Default: 60
```

**Solución 2**: Optimizar Dockerfile con cache:

```yaml
- name: Build with cache
  uses: docker/build-push-action@v5
  with:
    context: ./backend
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Solución 3**: Build en 2 stages:

```yaml
# Stage 1: Dependencies
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: backend/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('backend/package-lock.json') }}

# Stage 2: Build
- name: Build Docker image
  run: docker build --cache-from crud-backend:latest -t crud-backend:latest ./backend
```

---

### ❌ Tests Fallan Solo en CI (Funcionan Local)

**Diagnóstico**:

```yaml
- name: System Diagnostics
  run: |
    echo "OS: $(uname -a)"
    echo "Node: $(node --version)"
    echo "NPM: $(npm --version)"
    echo "Timezone: $(date)"
    echo "ENV vars:"
    env | sort | grep -v SECRET
```

**Causas comunes**:

1. **Versión de Node diferente**:
   ```yaml
   - uses: actions/setup-node@v3
     with:
       node-version: '18.17.0'  # Especificar versión exacta
   ```

2. **Timezone diferente**:
   ```yaml
   - name: Set timezone
     run: |
       export TZ=America/Bogota
       npm test
   ```

3. **Variables de entorno faltantes**:
   ```yaml
   env:
     NODE_ENV: test
     DATABASE_URL: postgresql://test:test@localhost:5432/test_db
   ```

---

### ❌ Workflow No Aparece en Actions Tab

**Causa**: Archivo YAML con error de sintaxis

**Verificación**:

```powershell
# Validar sintaxis YAML localmente
npm install -g js-yaml
js-yaml .github/workflows/ci.yml

# O usar herramienta online
# https://www.yamllint.com/
```

**Solución**: Corregir errores de sintaxis y hacer push

**Verificación en GitHub**:
- El workflow debe aparecer en Actions después de push
- Si no aparece, hay error de sintaxis

---

### ❌ Path Filters No Funcionan

**Problema**: Workflow se ejecuta aunque no haya cambios en paths especificados

**Causa**: Path filters solo funcionan en `push` y `pull_request`, no en `workflow_dispatch`

**Verificación correcta**:

```yaml
on:
  workflow_dispatch:  # NO usa path filters
  push:
    branches: [main]
    paths:  # Solo aplica a push
      - 'backend/**'
      - 'frontend/**'
```

**Solución**: Path filters funcionan correctamente, `workflow_dispatch` ignora paths (esperado)

---

### ❌ Cache No Funciona

**Problema**: Dependencies se reinstalan cada vez

**Verificación**:

```yaml
- name: Cache node modules
  id: cache-npm
  uses: actions/cache@v3
  with:
    path: backend/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('backend/package-lock.json') }}

- name: Check cache hit
  run: |
    if [ "${{ steps.cache-npm.outputs.cache-hit }}" == 'true' ]; then
      echo "✅ Cache hit!"
    else
      echo "❌ Cache miss"
    fi
```

**Soluciones**:

1. **Verificar path correcto**:
   ```yaml
   # Debe ser node_modules, no node_modules/
   path: backend/node_modules
   ```

2. **Usar cache-dependency-path en setup-node**:
   ```yaml
   - uses: actions/setup-node@v3
     with:
       node-version: '18'
       cache: 'npm'
       cache-dependency-path: backend/package-lock.json
   ```

3. **Limpiar cache corrupto**:
   ```powershell
   # Via GitHub CLI
   gh cache list
   gh cache delete <cache-id>
   
   # O en UI: Actions → Caches → Delete
   ```

---

## 📚 Best Practices Implementadas

### ✅ Optimizaciones Aplicadas

| Best Practice | Implementación | Workflow |
|---------------|----------------|----------|
| **Triggers manuales** | `workflow_dispatch` | Todos |
| **Path filters** | Solo archivos relevantes | ci.yml, codeql.yml |
| **Caching** | npm cache + Docker cache | ci.yml, docker-build.yml |
| **Job consolidation** | Matrix strategy | ci.yml, matrix-test.yml |
| **Fail-fast** | `continue-on-error: true` | ci.yml |
| **Artifacts retention** | 1-30 días según criticidad | Todos |
| **Secrets rotation** | Documentado en README | - |
| **Schedule optimization** | Semanal vs diario | Security scans |
| **Confirmation gates** | "DEPLOY" required | deploy-aws.yml |

### ✅ Recomendaciones de Uso

**DO** ✅:
- Ejecutar workflows manualmente según necesidad
- Revisar logs de failures inmediatamente
- Monitorear consumo mensual de minutos
- Rotar secrets cada 90 días
- Usar cache para dependencies
- Consolidar jobs cuando sea posible
- Configurar notifications para failures

**DON'T** ❌:
- Habilitar auto-triggers sin path filters
- Hardcodear credenciales en workflows
- Ignorar security scan failures (CodeQL/Trivy)
- Ejecutar full scans diariamente (usar baseline)
- Dejar artifacts con retention indefinida
- Ejecutar matrix tests en múltiples OS sin necesidad

---

## 🎓 Para Presentación/Sustentación

### Puntos Clave a Demostrar

1. **Problema Identificado**:
   - "Nuestra cuenta se bloqueó por exceder 2,000 min/mes"
   - "Workflows automáticos consumían ~2,200 min/mes"

2. **Solución Implementada**:
   - "Convertimos todos a triggers manuales"
   - "Agregamos path filters inteligentes"
   - "Consolidamos jobs paralelos"
   - "Reducimos schedules de diario a semanal"

3. **Resultados**:
   - "Reducción de ~85% en consumo mensual"
   - "De ~2,200 min/mes → ~200-300 min/mes"
   - "Manteniendo 100% de funcionalidad"
   - "Control total sobre ejecuciones"

4. **Demostración en Vivo**:
   ```powershell
   # Mostrar workflows optimizados
   gh workflow list
   
   # Ejecutar manualmente ci.yml
   gh workflow run ci.yml
   
   # Monitorear en tiempo real
   gh run watch
   
   # Mostrar resultados
   gh run view --web
   ```

5. **Métricas de Éxito**:
   - Settings → Billing → Usage this month
   - Actions → Workflows → Success rate
   - Security → Code scanning alerts

### Script de Demostración

```powershell
# 1. Mostrar optimizaciones
echo "=== Workflows Optimizados ==="
gh workflow list

# 2. Ejecutar CI pipeline
echo "=== Ejecutando CI Pipeline ==="
gh workflow run ci.yml
gh run watch

# 3. Ver resultados
echo "=== Resultados ==="
gh run list --workflow=ci.yml --limit 1

# 4. Mostrar artifacts
gh run view --web

# 5. Verificar consumo
echo "=== Consumo de Minutos ==="
echo "Ver en: Settings → Billing and plans"
```

---

## 🔗 Enlaces Relacionados

- **[Backend README](../../backend/README.md)** - Documentación del backend Node.js/Express
- **[Frontend README](../../frontend/README.md)** - Documentación del frontend React
- **[SUSTENTACION.md](../../SUSTENTACION.md)** - Script completo de presentación
- **[GitHub Actions Docs](https://docs.github.com/en/actions)** - Documentación oficial
- **[Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)** - Referencia de sintaxis
- **[Docker Build Action](https://github.com/docker/build-push-action)** - Action oficial de Docker

---

## 📝 Changelog

### v3.0 - Noviembre 10, 2025 (AUTOMATIZACIÓN COMPLETA)

**Cambios**:
- ✅ Restaurados triggers automáticos en push/PR para CI/CD tradicional
- ✅ ci.yml: Ejecución automática en cada push con path filters
- ✅ docker-build.yml: Build y push automático de imágenes Docker
- ✅ complete-pipeline.yml: Pipeline completo automático en cada push
- ✅ trivy-scan.yml: Security scan automático + semanal
- ✅ Path filters inteligentes mantienen eficiencia
- ✅ Caching y optimizaciones preservadas

**Filosofía**:
- 🎯 **DevOps tradicional**: CI/CD automático completo
- 🎯 **Path filters inteligentes**: Solo ejecuta cuando es necesario
- 🎯 **Visibilidad inmediata**: Resultados en cada commit

**Consumo Estimado**:
- 📊 ~1,240 min/mes con 10 pushes/semana
- 📊 Dentro del límite (62% de 2,000 min)
- 📊 Path filters previenen ejecuciones innecesarias

**Migración**: Todos los workflows ahora responden automáticamente a cambios en el código.

---

### v2.0 - Noviembre 7, 2025 (OPTIMIZACIÓN MANUAL)

**Cambios**:
- Convertidos workflows a ejecución manual (workflow_dispatch)
- Reducción de ~85-90% en consumo mensual
- Implementado para resolver bloqueo de cuenta

**Impacto**:
- De ~2,200 min/mes → ~200-300 min/mes
- Control manual total

---

### v1.0 - Versión Original

- Workflows con auto-triggers sin path filters
- Consumo: ~2,200 min/mes (excedía límite)

---

## 🎯 Resumen Ejecutivo

### ✅ Estado Actual: AUTOMATIZACIÓN COMPLETA

```
┌──────────────────────────────────────────────────────────┐
│  🚀 PIPELINE DEVOPS AUTOMÁTICO                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Al hacer: git push origin main                         │
│                                                          │
│  ✅ CI Pipeline (tests + lint)         ~4 min           │
│  ✅ Docker Build & Push                ~6 min           │
│  ✅ Complete Pipeline (deploy)         ~12 min          │
│  ✅ CodeQL Security Scan               ~3 min           │
│  ✅ Trivy Container Scan               ~4 min           │
│  ─────────────────────────────────────────────           │
│  📊 TOTAL POR PUSH:                    ~29 min          │
│                                                          │
│  Con 10 pushes/semana = ~1,240 min/mes                  │
│  + Schedules semanales = ~80 min/mes                    │
│  ══════════════════════════════════════════             │
│  🎯 TOTAL: ~1,320 min/mes (66% del límite)             │
│                                                          │
│  ✅ Path filters previenen ejecuciones innecesarias     │
│  ✅ Resultados visibles inmediatamente en GitHub        │
│  ✅ CI/CD tradicional completamente funcional           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 🎨 Visualización del Pipeline

```
PUSH → main
  │
  ├─── ci.yml ────────────────────────┐
  │                                    │
  ├─── docker-build.yml ──────────────┤
  │                                    │
  ├─── complete-pipeline.yml ─────────┤→ ✅ Resultados
  │                                    │    en GitHub
  ├─── codeql.yml ────────────────────┤    Actions
  │                                    │
  └─── trivy-scan.yml ────────────────┘

SCHEDULE (Semanal)
  │
  ├─── Lunes: CodeQL
  ├─── Martes: Trivy Scan
  ├─── Miércoles: ZAP Scan
  └─── Domingo: Matrix Test
```

---

## 📞 Soporte

Si tienes problemas con los workflows:

1. **Revisar logs**: `gh run view <run-id> --log`
2. **Verificar secrets**: `gh secret list`
3. **Consultar esta documentación**: `.github/workflows/README.md`
4. **Issues del repositorio**: Crear issue describiendo el problema
5. **GitHub Support**: https://support.github.com (para problemas de billing)

---

## 🏆 Créditos

**Proyecto**: DevOps CRUD Application  
**Curso**: Ingeniería de Software II  
**Institución**: Universidad Autónoma de Occidente  
**Semestre**: 7mo  
**Año**: 2025  
**Autor**: Leonardo Paz (@LeonarDPeace)

---

**Última actualización**: Noviembre 7, 2025  
**Versión**: 2.0 (Optimizado para Free Tier)
