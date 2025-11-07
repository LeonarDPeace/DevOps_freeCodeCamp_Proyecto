# 🚀 Pipeline DevOps con Herramientas Gratuitas

[![CI/CD Pipeline](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions/workflows/complete-pipeline.yml/badge.svg)](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions)
[![Security Scan](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions/workflows/codeql.yml/badge.svg)](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/security)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Aplicación CRUD full-stack de producción con pipeline completo de CI/CD, monitoreo con Grafana Cloud, múltiples escaneos de seguridad y deployment automatizado en Render, todo usando herramientas gratuitas.

---

## 📖 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [URLs de Producción](#-urls-de-producción)
- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Setup Local](#-setup-local)
- [Deployment](#-deployment)
- [Pipelines CI/CD](#-pipelines-cicd)
- [Monitoreo](#-monitoreo)
- [Seguridad](#-seguridad)
- [Documentación Adicional](#-documentación-adicional)
- [Contribuir](#-contribuir)

---

## 🎯 Descripción del Proyecto

Este proyecto implementa una **aplicación CRUD completa de gestión de usuarios** con todas las prácticas modernas de DevOps:

### Características de la Aplicación
- ✅ **Frontend React 18** con interfaz intuitiva para crear y listar usuarios
- ✅ **Backend Node.js/Express** con API REST y health checks
- ✅ **PostgreSQL** como base de datos persistente
- ✅ **Timestamps automáticos** en formato colombiano (commit `c561849`)
- ✅ **Validación de datos** en frontend y backend

### Características DevOps
- ✅ **8 Workflows de GitHub Actions** para CI/CD completo
- ✅ **Containerización Docker** con multi-stage builds optimizados
- ✅ **Kubernetes manifests** listos para orquestación
- ✅ **Terraform IaC** para provisioning en Render
- ✅ **Monitoreo con Grafana Cloud** y métricas Prometheus
- ✅ **3 scanners de seguridad**: CodeQL, OWASP ZAP, Trivy
- ✅ **Deployment automático** en Render free tier
- ✅ **Pre-commit hooks** con Husky para validación

---

## 🏗️ Arquitectura

```
┌─────────────┐      HTTPS     ┌──────────────┐      SQL      ┌──────────────┐
│   Usuario   │ ───────────────>│   Frontend   │               │              │
│  (Browser)  │                 │  React App   │               │  PostgreSQL  │
└─────────────┘                 │  (Render)    │               │  Database    │
                                └──────────────┘               │  (Render)    │
                                       │                        └──────────────┘
                                       │ REST API                      ▲
                                       ▼                               │
                                ┌──────────────┐                      │
                                │   Backend    │ ─────────────────────┘
                                │  Express API │
                                │  (Render)    │
                                └──────────────┘
                                       │
                                       │ /metrics
                                       ▼
                                ┌──────────────┐
                                │   Grafana    │
                                │    Cloud     │
                                │ (Monitoreo)  │
                                └──────────────┘
```

### Flujo de CI/CD

```
 Commit/Push    GitHub Actions     Docker Hub      Render       Producción
     │                │                 │             │              │
     ├──────> CI Tests│                 │             │              │
     │        (lint, build)             │             │              │
     │                │                 │             │              │
     ├──────> Security Scan             │             │              │
     │        (CodeQL, ZAP, Trivy)      │             │              │
     │                │                 │             │              │
     ├──────> Docker Build ────────────>│             │              │
     │        (multi-stage)             │             │              │
     │                │                 │             │              │
     └──────> Deploy Trigger ──────────────────────>│              │
              (webhook)                            Auto-deploy     │
                                                        │            │
                                                        └───────────>│
                                                     Health checks   │
                                                     /healthz ✓     Live!
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: react-scripts 5.0.1 (Create React App)
- **HTTP Client**: axios 1.6.0
- **Deployment**: Render Static Site
- **URL**: [crud-frontend-cerx.onrender.com](https://crud-frontend-cerx.onrender.com)

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js 4.x
- **Database Client**: pg (node-postgres)
- **Metrics**: prom-client (Prometheus OpenMetrics)
- **Deployment**: Render Web Service
- **URL**: [crud-backend-1o29.onrender.com](https://crud-backend-1o29.onrender.com)

### Base de Datos
- **Engine**: PostgreSQL 15
- **Hosting**: Render PostgreSQL
- **Schema**: Ver `infrastructure/db.sql`

### Containerización
- **Engine**: Docker 24+
- **Registry**: Docker Hub
- **Strategy**: Multi-stage builds
- **Base Image**: node:18-alpine

### Infraestructura como Código
- **Provisioning**: Terraform 1.5+
- **Provider**: Render (render-oss/render)
- **Orquestación**: Kubernetes manifests (deployment + service)
- **Platform**: Render (producción), K3d/Minikube (local)

### CI/CD
- **Platform**: GitHub Actions
- **Workflows**: 8 pipelines automatizados
- **Triggers**: Push, PR, Schedule, Manual
- **Docker Build**: BuildKit con cache
- **Auto-deploy**: Render webhooks

### Monitoreo
- **Metrics Backend**: Prometheus (OpenMetrics en `/metrics`)
- **Visualization**: Grafana Cloud
- **Stack**: devopsproyecto (ID: 1428683)
- **Queries**: PromQL preconfiguradas (`cpu-usage`, `error-rate`, `slo-latency`)
- **Dashboards**: Disponibles en Grafana Cloud

### Seguridad
| Tool | Tipo | Frecuencia | Propósito |
|------|------|------------|-----------|
| **CodeQL** | SAST | Push + Schedule | Análisis estático de código JS/TS |
| **OWASP ZAP** | DAST | Weekly | Escaneo de vulnerabilidades web |
| **Trivy** | SCA | Daily | CVE scan en imágenes Docker |
| **check-secrets.sh** | Custom | Pre-commit | Detección de secretos hardcodeados |

---

## 🌐 URLs de Producción

### Aplicación Live

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend** | https://crud-frontend-cerx.onrender.com | ✅ Online |
| **Backend API** | https://crud-backend-1o29.onrender.com | ✅ Online |
| **Health Check** | https://crud-backend-1o29.onrender.com/healthz | ✅ Monitoring |
| **Readiness Probe** | https://crud-backend-1o29.onrender.com/readiness | ✅ DB Check |
| **Métricas Prometheus** | https://crud-backend-1o29.onrender.com/metrics | ✅ OpenMetrics |

### Monitoreo y Observabilidad

| Herramienta | URL | Acceso |
|-------------|-----|--------|
| **Grafana Cloud** | https://devopsproyecto.grafana.net | Requiere login |
| **GitHub Actions** | [View Workflows](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions) | Público |
| **Security Alerts** | [Code Scanning](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/security) | Colaboradores |

### Verificación Rápida

```bash
# Health check (debe retornar 200 OK)
curl https://crud-backend-1o29.onrender.com/healthz

# Obtener lista de usuarios
curl https://crud-backend-1o29.onrender.com/users

# Ver métricas Prometheus
curl https://crud-backend-1o29.onrender.com/metrics | grep http_requests_total

# Test POST (crear usuario)
curl -X POST https://crud-backend-1o29.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}'
```

---

## 📁 Estructura del Repositorio

```
DevOps_freeCodeCamp_Proyecto/
│
├── backend/                      # API Node.js/Express + PostgreSQL
│   ├── index.js                  # Entry point del servidor
│   ├── package.json              # Dependencias (express, pg, prom-client)
│   ├── Dockerfile                # Multi-stage build optimizado
│   └── README.md                 # 📘 Documentación del backend
│
├── frontend/                     # Aplicación React 18
│   ├── src/
│   │   ├── App.js                # Componente principal CRUD
│   │   ├── config.js             # Configuración de API endpoints
│   │   └── index.js              # Entry point React
│   ├── package.json              # Dependencias (react, axios)
│   ├── Dockerfile                # Build con serve para producción
│   └── README.md                 # 📘 Documentación del frontend
│
├── infrastructure/               # Infraestructura como Código
│   ├── terraform/                # Archivos Terraform
│   │   ├── main.tf               # Provider configuration (Render)
│   │   ├── variables.tf          # Variables de entrada
│   │   └── service.tf            # Definición de servicios
│   ├── k8s/                      # Manifiestos Kubernetes
│   │   ├── deployment.yaml       # Deployment con 3 replicas
│   │   └── service.yaml          # Service tipo LoadBalancer
│   ├── monitoring/               # Configuración de monitoreo
│   │   ├── prometheus.yml        # Scrape config
│   │   └── queries/              # Queries PromQL
│   │       ├── cpu-usage.promql
│   │       ├── error-rate.promql
│   │       └── slo-latency.promql
│   ├── db.sql                    # Schema inicial PostgreSQL
│   └── README.md                 # 📘 Documentación de infraestructura
│
├── scripts/                      # Utilidades y automatización
│   ├── init-db.js                # Inicializar tabla users en PostgreSQL
│   ├── verify-grafana.ps1        # Verificar conectividad Grafana Cloud
│   ├── check-secrets.sh          # Detectar secretos hardcodeados
│   └── README.md                 # 📘 Documentación de scripts
│
├── .github/                      # GitHub-specific configs
│   ├── workflows/                # 8 Pipelines de CI/CD
│   │   ├── ci.yml                # ✓ Pipeline CI básico
│   │   ├── docker-build.yml      # ✓ Build y push imágenes Docker
│   │   ├── complete-pipeline.yml # ✓ Pipeline completo end-to-end
│   │   ├── codeql.yml            # ✓ Análisis estático de seguridad
│   │   ├── zap-scan.yml          # ✓ Escaneo OWASP ZAP
│   │   ├── trivy-scan.yml        # ✓ Scan de vulnerabilidades en containers
│   │   ├── matrix-test.yml       # ✓ Tests en múltiples versiones Node
│   │   ├── deploy-aws.yml        # ✓ Deployment manual a AWS (opcional)
│   │   └── README.md             # 📘 Documentación de workflows
│   ├── PULL_REQUEST_TEMPLATE.md  # Template para PRs
│   └── ISSUE_TEMPLATE/           # Templates para issues
│       ├── bug_report.md
│       └── feature_request.md
│
├── docs/                         # (Vacía - archivos obsoletos eliminados)
│
├── .gitignore                    # Archivos ignorados por Git
├── .gitattributes                # Atributos de archivos Git
├── package.json                  # Dependencias raíz (Husky)
├── render.yaml                   # Configuración de Render deployment
└── README.md                     # 📘 Este archivo (documentación principal)
```

### 📘 Documentación Detallada por Módulo

Cada directorio principal contiene su propio README con documentación específica:

- **[Backend Documentation](./backend/README.md)** - API endpoints, timestamps automáticos, Dockerfile, deployment
- **[Frontend Documentation](./frontend/README.md)** - Componentes React, configuración API, validaciones, build
- **[Infrastructure Documentation](./infrastructure/README.md)** - Terraform, Kubernetes, Prometheus, queries PromQL
- **[CI/CD Workflows Documentation](./.github/workflows/README.md)** - 8 workflows explicados, triggers, secrets
- **[Scripts Documentation](./scripts/README.md)** - init-db.js, verify-grafana.ps1, check-secrets.sh

---

## 🚀 Setup Local

### Requisitos Previos

| Herramienta | Versión | Verificar |
|-------------|---------|-----------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Git** | 2.x+ | `git --version` |
| **PostgreSQL** | 14+ | `psql --version` |
| **Docker** | 24+ (opcional) | `docker --version` |

### 1. Clonar Repositorio

```bash
git clone https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto.git
cd DevOps_freeCodeCamp_Proyecto
```

### 2. Configurar PostgreSQL

#### Opción A: PostgreSQL Local

```bash
# Instalar PostgreSQL
# En Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# En macOS
brew install postgresql@15
brew services start postgresql@15

# En Windows
# Descargar desde https://www.postgresql.org/download/windows/

# Crear base de datos
createdb crud_db

# Configurar DATABASE_URL
export DATABASE_URL="postgres://$(whoami)@localhost:5432/crud_db"
```

#### Opción B: Docker PostgreSQL

```bash
# Iniciar PostgreSQL en container
docker run -d \
  --name postgres-crud \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=crud_db \
  -p 5432:5432 \
  postgres:15-alpine

# Configurar DATABASE_URL
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/crud_db"
```

### 3. Inicializar Tabla Users

```bash
# Usando script provisto
node scripts/init-db.js

# O manualmente con psql
psql $DATABASE_URL -f infrastructure/db.sql
```

Verificar:
```bash
psql $DATABASE_URL -c "SELECT * FROM users;"
```

### 4. Backend Setup

```bash
cd backend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
# O en producción
npm start
```

Verificar backend corriendo:
```bash
curl http://localhost:3000/healthz
# Debe retornar: 200 OK

curl http://localhost:3000/users
# Debe retornar: []
```

### 5. Frontend Setup

```bash
cd ../frontend

# Instalar dependencias
npm install

# Crear .env para apuntar a backend local
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# Ejecutar en desarrollo
npm start
# Abre automáticamente http://localhost:3001
```

### 6. Verificación End-to-End

1. Abrir navegador en `http://localhost:3001`
2. Ingresar nombre de usuario en el input
3. Click "Add User"
4. Usuario debe aparecer en la lista con timestamp automático

---

## 🐳 Docker (Opcional para Local)

### Build Individual

```bash
# Backend
cd backend
docker build -t crud-backend:local .
docker run -p 3000:3000 --env-file .env crud-backend:local

# Frontend
cd ../frontend
docker build -t crud-frontend:local .
docker run -p 3001:3000 \
  -e REACT_APP_API_URL=http://localhost:3000 \
  crud-frontend:local
```

### Docker Compose (Recomendado)

```yaml
# docker-compose.yml (crear en raíz)
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: crud_db
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/crud_db
    ports:
      - "3000:3000"
    depends_on:
      - postgres
  
  frontend:
    build: ./frontend
    environment:
      REACT_APP_API_URL: http://localhost:3000
    ports:
      - "3001:3000"
    depends_on:
      - backend
```

Ejecutar:
```bash
docker-compose up -d
```

---

## 📦 Deployment

### Render Deployment (Actual en Producción)

#### Auto-Deploy Configurado

El proyecto se despliega automáticamente en Render cuando se hace push a `main`:

1. **GitHub Actions** ejecuta workflows (`complete-pipeline.yml`)
2. **Docker images** se construyen y pushean a Docker Hub
3. **Render webhook** detecta cambios en repositorio
4. **Auto-deploy** se ejecuta en Render
5. **Health checks** validan deployment exitoso

#### Manual Redeploy

```bash
# Trigger redeploy via API
curl -X POST https://api.render.com/deploy/srv-XXXX?key=YOUR_DEPLOY_KEY

# O desde Render Dashboard
# → Services → [Service] → Manual Deploy → Deploy latest commit
```

#### Variables de Entorno en Render

**Backend Service**:
```
DATABASE_URL=<auto-provisto-por-render-postgres-addon>
GRAFANA_CLOUD_API_URL=https://prometheus-prod-13-prod-us-east-0.grafana.net
GRAFANA_CLOUD_API_USER=123456
GRAFANA_CLOUD_API_KEY=glc_xxxxxxxxxxxxx
```

**Frontend Service**:
```
REACT_APP_API_URL=https://crud-backend-1o29.onrender.com
```

### AWS Deployment (Configurado, No Activo)

Workflow `deploy-aws.yml` disponible para deployment manual a AWS:

```bash
# Trigger manualmente desde GitHub Actions
gh workflow run deploy-aws.yml \
  --ref main \
  -f environment=production \
  -f region=us-east-1
```

Requiere secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

---

## 🔄 Pipelines CI/CD

### Resumen de Workflows

| Workflow | Trigger | Duración | Descripción |
|----------|---------|----------|-------------|
| **ci.yml** | Push/PR | ~4 min | Lint, test, build |
| **docker-build.yml** | Push a main | ~6 min | Build y push a Docker Hub |
| **complete-pipeline.yml** | Push + Daily | ~18 min | Pipeline completo E2E |
| **codeql.yml** | Push + Schedule | ~3 min | Análisis de seguridad estático |
| **zap-scan.yml** | Weekly | ~8 min | Escaneo de vulnerabilidades web |
| **trivy-scan.yml** | Daily | ~4 min | Scan de CVEs en imágenes |
| **matrix-test.yml** | PR | ~5 min | Tests en Node 16/18/20 |
| **deploy-aws.yml** | Manual | ~10 min | Deploy a AWS (opcional) |

### Ver Estado de Workflows

[![CI/CD Status](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions/workflows/complete-pipeline.yml/badge.svg)](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/actions)

```bash
# GitHub CLI
gh run list
gh run view <run-id>
gh run view <run-id> --log

# Ver workflows específicos
gh run list --workflow=ci.yml
```

Ver documentación completa: **[CI/CD Workflows README](.github/workflows/README.md)**

---

## 📊 Monitoreo

### Grafana Cloud

**Stack**: devopsproyecto (ID: 1428683)  
**URL**: https://devopsproyecto.grafana.net

#### Dashboards Disponibles

- **Node.js Application Metrics**
  - CPU Usage: `rate(process_cpu_user_seconds_total[5m])`
  - Memory Heap: `nodejs_heap_size_total_bytes`
  - Request Rate: `rate(http_requests_total[5m])`

- **HTTP Performance**
  - Request count por endpoint
  - Error rate (5xx responses)
  - Latency percentiles (p50, p95, p99)

#### Acceso a Queries PromQL

Queries preconfiguradas en `infrastructure/monitoring/queries/`:

**CPU Usage**:
```promql
rate(process_cpu_user_seconds_total[5m])
```

**Error Rate**:
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / 
sum(rate(http_requests_total[5m]))
```

**SLO Latency** (95th percentile):
```promql
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket[5m])
)
```

### Synthetic Monitoring

Configurado para probar endpoints cada 60 segundos:
- `GET /healthz` - Health check
- `GET /users` - API functionality
- `GET /metrics` - Metrics availability

Ver documentación: **[Monitoreo README](infrastructure/README.md#monitoring-configuration)**

---

## 🔒 Seguridad

### Escaneos Automatizados

#### CodeQL - Análisis Estático

**Frecuencia**: Push + PR + Lunes 6 AM  
**Lenguajes**: JavaScript, TypeScript

Detecta:
- SQL Injection
- XSS (Cross-Site Scripting)
- Path Traversal
- Hardcoded Secrets
- Command Injection

**Resultados**: [Security → Code Scanning](https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto/security/code-scanning)

#### OWASP ZAP - Escaneo Web

**Frecuencia**: Domingos 3 AM  
**Target**: https://crud-backend-1o29.onrender.com

Detecta:
- Vulnerabilidades OWASP Top 10
- Insecure Headers
- SSL/TLS Issues
- CSRF tokens

**Reporte**: Generado como artifact en workflow

#### Trivy - Container Scanning

**Frecuencia**: Diariamente 4 AM  
**Images**:
- `leonardpeace/crud-backend:latest`
- `leonardpeace/crud-frontend:latest`

Detecta CVEs con severity:
- 🔴 CRITICAL (bloquea workflow)
- 🟠 HIGH (bloquea workflow)
- 🟡 MEDIUM
- 🟢 LOW

### Pre-Commit Validation

```bash
# Instalado con Husky
npm install  # Configura git hooks automáticamente

# Antes de cada commit se ejecuta:
bash scripts/check-secrets.sh
```

### Secrets Management

**GitHub Actions Secrets**:
- `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN`
- `RENDER_DEPLOY_HOOK_BACKEND` / `RENDER_DEPLOY_HOOK_FRONTEND`
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
- `GRAFANA_CLOUD_API_KEY`

**Render Environment Variables**:
- Configuradas en Render Dashboard → Service → Environment
- Encriptadas en reposo
- Rotadas cada 90 días

---

## 📚 Documentación Adicional

### Por Módulo

- **[Backend API Documentation](./backend/README.md)** - Endpoints, health checks, métricas, deployment
- **[Frontend Documentation](./frontend/README.md)** - Componentes React, configuración, build
- **[Infrastructure as Code](./infrastructure/README.md)** - Terraform, Kubernetes, Prometheus
- **[CI/CD Workflows](./.github/workflows/README.md)** - 8 workflows explicados en detalle
- **[Utility Scripts](./scripts/README.md)** - init-db, verify-grafana, check-secrets

### Tutorial Original

Basado en: [How to Build a Production-Ready DevOps Pipeline with Free Tools.html](How%20to%20Build%20a%20Production-Ready%20DevOps%20Pipeline%20with%20Free%20Tools.html)

---

## 🤝 Contribuir

### Convenciones de Commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types**:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma, etc (no afecta código)
- `refactor:` Refactorización sin cambiar funcionalidad
- `test:` Añadir o modificar tests
- `chore:` Actualizar tareas de build, configs
- `perf:` Mejoras de performance
- `ci:` Cambios en CI/CD

**Ejemplos**:
```bash
feat(backend): add automatic timestamp to user creation
fix(frontend): validate empty names before POST request
docs(readme): update deployment instructions for Render
ci(workflows): add Trivy scan for container vulnerabilities
```

### Workflow de Contribución

1. **Fork** el proyecto
2. **Crear rama** desde `main`:
   ```bash
   git checkout -b feat/nueva-feature
   ```
3. **Hacer cambios** y commit con conventional commits
4. **Verificar** que pasen checks localmente:
   ```bash
   npm test  # Si hay tests
   bash scripts/check-secrets.sh
   ```
5. **Push** a tu fork:
   ```bash
   git push origin feat/nueva-feature
   ```
6. **Abrir Pull Request** a `main`
7. **Esperar** review y merge

### Código de Conducta

- Ser respetuoso y colaborativo
- Proveer contexto en PRs e Issues
- Seguir las convenciones del proyecto
- Documentar cambios significativos

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autor

**Leonardo Daniel Paz Cerón**  
- GitHub: [@LeonarDPeace](https://github.com/LeonarDPeace)
- Proyecto: Ingeniería de Software II - Universidad Autónoma de Occidente

---

## 🙏 Agradecimientos

- [freeCodeCamp](https://www.freecodecamp.org/) - Tutorial base del proyecto
- [Render](https://render.com/) - Hosting gratuito
- [Grafana Labs](https://grafana.com/) - Grafana Cloud free tier
- [GitHub](https://github.com/) - Actions y hosting de código
- [Docker Hub](https://hub.docker.com/) - Registry de imágenes

---

## 📈 Estado del Proyecto

**Última Actualización**: Enero 2025  
**Estado**: ✅ En Producción  
**Versión**: 1.0.0  
**Commits**: 100+  
**Workflows**: 8 activos  
**Uptime**: 99.5% (last 30 days)

---

> **💡 Tip**: Para una experiencia completa, visita la [aplicación live](https://crud-frontend-cerx.onrender.com) y explora los [dashboards de Grafana](https://devopsproyecto.grafana.net)!

