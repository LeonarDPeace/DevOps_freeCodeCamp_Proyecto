# Pipeline DevOps con Herramientas Gratuitas

Aplicación CRUD full-stack con pipeline de CI/CD completo usando herramientas gratuitas.

## Estructura del Proyecto

```
├── frontend/          # Aplicación React
├── backend/           # API Node.js/Express
├── infrastructure/    # Archivos Terraform, K8s e IaC
│   ├── k8s/          # Manifests de Kubernetes
│   └── monitoring/   # Configuración de Prometheus
├── scripts/          # Scripts de utilidad
└── .github/
    └── workflows/    # Pipelines CI/CD con GitHub Actions
```

## Tecnologías

- **Frontend:** React
- **Backend:** Node.js, Express
- **Base de Datos:** PostgreSQL
- **Containerización:** Docker
- **Orquestación:** Kubernetes (K3d)
- **IaC:** Terraform
- **CI/CD:** GitHub Actions
- **Monitoreo:** Grafana, Prometheus
- **Seguridad:** CodeQL, OWASP ZAP, Trivy

## Pipelines Implementados

### CI/CD
- ✅ Pipeline CI con build, test y lint
- ✅ Matrix builds para testing cross-environment
- ✅ Docker builds optimizados con BuildKit
- ✅ Deployment automático a AWS
- ✅ Pipeline completo end-to-end

### Seguridad
- ✅ CodeQL para análisis estático
- ✅ OWASP ZAP para escaneo web
- ✅ Trivy para vulnerabilidades en containers
- ✅ Detección de secretos hardcodeados

### Monitoring
- ✅ Prometheus para métricas
- ✅ Alertas configuradas
- ✅ SLO tracking

## Requisitos

- Node.js 18+
- Docker
- Git
- Terraform (opcional)
- kubectl (opcional)

## Instalación

```bash
# Clonar repositorio
git clone <repository-url>

# Instalar dependencias backend
cd backend
npm install

# Instalar dependencias frontend
cd ../frontend
npm install

# Instalar dependencias raíz (Husky)
cd ..
npm install
```

## Ejecución Local

### Backend
```bash
cd backend
DATABASE_URL=postgresql://user:pass@localhost:5432/db npm start
```

### Frontend
```bash
cd frontend
npm start
```

## Docker

```bash
# Build backend
docker build -t crud-backend:latest ./backend

# Build frontend
docker build -t crud-frontend:latest ./frontend
```

## Kubernetes

```bash
# Crear cluster K3d
k3d cluster create dev-cluster --servers 1 --agents 2 --port 8080:80@loadbalancer

# Aplicar manifests
kubectl apply -f infrastructure/k8s/

# Ver status
kubectl get pods
```

## Terraform

```bash
cd infrastructure

# Inicializar
terraform init

# Planear cambios
terraform plan

# Aplicar
terraform apply
```

## Convenciones de Commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma faltantes, etc
- `refactor:` Refactorización de código
- `test:` Añadir tests
- `chore:` Actualizar tareas de build, configuraciones, etc
- `perf:` Mejoras de performance

## Variables de Entorno

### Backend
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
PORT=3000
```

### Secrets de GitHub
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `RENDER_API_KEY` (para Terraform)

## Features

### Aplicación
- ✅ CRUD de usuarios (GET/POST)
- ✅ Health check endpoint (`/healthz`)
- ✅ API REST con Express
- ✅ Frontend React interactivo

### DevOps
- ✅ Multi-stage Docker builds
- ✅ Zero-downtime deployments
- ✅ Health checks y readiness probes
- ✅ Dependency caching
- ✅ Security scanning automático

## URLs de Producción

**Importante:** Actualizar estas URLs con tus deployments reales de Render

- **Frontend:** https://tu-app-frontend.onrender.com
- **Backend API:** https://tu-app-backend.onrender.com
- **Health Check:** https://tu-app-backend.onrender.com/healthz
- **Métricas Prometheus:** https://tu-app-backend.onrender.com/metrics
- **Grafana Dashboard:** https://[tu-instancia].grafana.net
- **UptimeRobot Dashboard:** https://uptimerobot.com/dashboard

### Verificación de Endpoints

Después del deployment, verificar que respondan:

```bash
# Health check (debe retornar {"status":"ok"})
curl https://tu-app-backend.onrender.com/healthz

# Obtener usuarios
curl https://tu-app-backend.onrender.com/users

# Métricas Prometheus
curl https://tu-app-backend.onrender.com/metrics
```

## Monitoreo

Queries Prometheus disponibles en `infrastructure/monitoring/queries/`:
- CPU usage
- Error rates
- SLO latency tracking

## Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feat/nueva-feature`)
3. Commit cambios (`git commit -m 'feat: agregar nueva feature'`)
4. Push al branch (`git push origin feat/nueva-feature`)
5. Abrir Pull Request

## Licencia

MIT

