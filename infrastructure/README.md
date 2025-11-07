# Infrastructure as Code (IaC)

Configuración de infraestructura para el proyecto DevOps utilizando Terraform para provisioning en Render y Kubernetes para orquestación de contenedores.

## 📋 Descripción

Esta carpeta contiene todos los archivos de Infraestructura como Código (IaC) que permiten:
- Provisionar servicios en Render via Terraform
- Desplegar aplicaciones en Kubernetes con manifiestos YAML
- Monitorear con Prometheus y queries PromQL
- Gestionar base de datos PostgreSQL

## 📁 Estructura del Directorio

```
infrastructure/
├── terraform/                  # Archivos Terraform (raíz)
│   ├── main.tf                 # Provider configuration (Render)
│   ├── variables.tf            # Variables de entrada
│   └── service.tf              # Definición de servicios
├── k8s/                        # Manifiestos Kubernetes
│   ├── deployment.yaml         # Deployment con 3 replicas
│   └── service.yaml            # Service tipo LoadBalancer
├── monitoring/                 # Configuración de monitoreo
│   ├── prometheus.yml          # Scrape config Prometheus
│   └── queries/                # Queries PromQL predefinidas
│       ├── cpu-usage.promql
│       ├── error-rate.promql
│       └── slo-latency.promql
├── db.sql                      # Schema inicial PostgreSQL
└── README.md                   # Este archivo
```

## 🔧 Terraform Configuration

### Archivos Terraform

#### `main.tf`
Configura el provider de Render para gestionar infraestructura:

```hcl
terraform {
  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.0"
    }
  }
}

provider "render" {
  api_key = var.render_api_key
}
```

#### `variables.tf`
Define variables de entrada para flexibilidad:

```hcl
variable "render_api_key" {
  description = "Render API Key para autenticación"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "crud-devops"
}
```

#### `service.tf`
Define los servicios a crear en Render:

```hcl
resource "render_web_service" "backend" {
  name         = "crud-backend"
  plan         = "free"
  region       = "oregon"
  environment  = "node"
  
  # Auto-deploy desde GitHub
  github_repo  = "LeonarDPeace/DevOps_freeCodeCamp_Proyecto"
  github_branch = "main"
  
  # Variables de entorno
  env_vars = {
    DATABASE_URL = var.database_url
  }
}
```

### Uso de Terraform

#### Inicializar

```bash
cd infrastructure
terraform init
```

#### Planificar Cambios

```bash
# Ver qué recursos se crearán/modificarán
terraform plan -var="render_api_key=YOUR_API_KEY"
```

#### Aplicar Infraestructura

```bash
terraform apply -var="render_api_key=YOUR_API_KEY"
```

#### Destruir Recursos

```bash
terraform destroy
```

**⚠️ Nota**: Actualmente el proyecto se despliega manualmente en Render. Terraform está configurado pero no se usa activamente.

## ☸️ Kubernetes Manifests

### `k8s/deployment.yaml`

Deployment para el backend con 3 réplicas y health checks:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crud-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crud-backend
  template:
    metadata:
      labels:
        app: crud-backend
    spec:
      containers:
      - name: backend
        image: your-registry/crud-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: database-url
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readiness
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Características**:
- ✅ 3 réplicas para alta disponibilidad
- ✅ Liveness probe en `/healthz`
- ✅ Readiness probe en `/readiness`
- ✅ Secrets para DATABASE_URL
- ✅ Resource limits (opcional, descomentar si se añaden)

### `k8s/service.yaml`

Service tipo LoadBalancer para exponer el backend:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: crud-backend-service
spec:
  type: LoadBalancer
  selector:
    app: crud-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

**Características**:
- Tipo `LoadBalancer` para acceso externo
- Mapea puerto 80 (externo) → 3000 (contenedor)
- Selector `app: crud-backend` vincula al Deployment

### Despliegue en Kubernetes

```bash
# Crear namespace (opcional)
kubectl create namespace devops-crud

# Aplicar manifiestos
kubectl apply -f k8s/deployment.yaml -n devops-crud
kubectl apply -f k8s/service.yaml -n devops-crud

# Verificar estado
kubectl get deployments -n devops-crud
kubectl get pods -n devops-crud
kubectl get services -n devops-crud

# Ver logs de un pod
kubectl logs <pod-name> -n devops-crud

# Escalar deployment
kubectl scale deployment crud-backend --replicas=5 -n devops-crud
```

## 📊 Monitoring Configuration

### `monitoring/prometheus.yml`

Configuración de Prometheus para scraping de métricas:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'crud-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
    scheme: http
```

**Parámetros**:
- `scrape_interval`: Frecuencia de recolección (cada 15 segundos)
- `job_name`: Identificador del servicio en Prometheus
- `targets`: Lista de endpoints a monitorear
- `metrics_path`: Ruta del endpoint de métricas

### PromQL Queries

#### `queries/cpu-usage.promql`
Monitorear uso de CPU del proceso Node.js:

```promql
rate(process_cpu_user_seconds_total[5m])
```

**Uso**: Detectar picos de CPU que puedan afectar rendimiento

#### `queries/error-rate.promql`
Calcular tasa de errores HTTP:

```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / 
sum(rate(http_requests_total[5m]))
```

**Uso**: Alertar cuando tasa de errores 5xx supere umbral (ej: >1%)

#### `queries/slo-latency.promql`
Verificar SLO de latencia (percentil 95):

```promql
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket[5m])
)
```

**Uso**: Asegurar que 95% de requests respondan en <500ms

### Integración con Grafana Cloud

Para visualizar estas queries:

1. **Importar en Grafana Cloud**:
   - Dashboard → Add Panel → Query
   - Copiar query desde archivo `.promql`
   - Configurar visualización (gráfico de líneas, gauge, etc.)

2. **Crear Alertas**:
   ```promql
   # Alertar si error rate > 5%
   (sum(rate(http_requests_total{status_code=~"5.."}[5m])) / 
    sum(rate(http_requests_total[5m]))) > 0.05
   ```

## 🗄️ Base de Datos

### `db.sql`

Schema inicial para PostgreSQL:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Índice para búsquedas por nombre
CREATE INDEX idx_users_name ON users(name);

-- Datos de ejemplo (opcional)
INSERT INTO users (name) VALUES
  ('Usuario Demo 10:00:00'),
  ('Otro Usuario 11:30:45');
```

### Aplicar Schema

```bash
# Opción 1: Usando psql
psql $DATABASE_URL -f infrastructure/db.sql

# Opción 2: Usando script init-db.js
node scripts/init-db.js

# Opción 3: En Render Dashboard
# → PostgreSQL instance → Query → Pegar contenido de db.sql
```

## 🚀 Deployment Strategies

### Blue-Green Deployment (Kubernetes)

```bash
# Crear deployment "green" con nueva versión
kubectl apply -f k8s/deployment-green.yaml

# Probar nueva versión internamente
kubectl port-forward deployment/crud-backend-green 3001:3000

# Cambiar Service para apuntar a "green"
kubectl patch service crud-backend-service \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Eliminar deployment "blue" antiguo
kubectl delete deployment crud-backend-blue
```

### Canary Deployment

```bash
# Mantener 90% en versión estable, 10% en canary
kubectl scale deployment crud-backend-stable --replicas=9
kubectl scale deployment crud-backend-canary --replicas=1

# Monitorear métricas en Grafana
# Si todo OK, migrar 100% a canary:
kubectl scale deployment crud-backend-stable --replicas=0
kubectl scale deployment crud-backend-canary --replicas=10
```

## 🔍 Troubleshooting

### Terraform

#### Error: "Invalid API key"
```bash
export RENDER_API_KEY="your-actual-key"
terraform plan -var="render_api_key=$RENDER_API_KEY"
```

#### Error: "Resource already exists"
```bash
# Importar recurso existente al state
terraform import render_web_service.backend srv-xxxxx
```

### Kubernetes

#### Pods en CrashLoopBackOff
```bash
# Ver logs del pod fallido
kubectl logs <pod-name> --previous

# Verificar configuración
kubectl describe pod <pod-name>

# Revisar secret de DATABASE_URL
kubectl get secret postgres-secret -o yaml
```

#### Service no accesible externamente
```bash
# Verificar que el Service esté tipo LoadBalancer
kubectl get svc crud-backend-service

# Si está en Pending, revisar provider de cloud
# En Minikube local, usar:
minikube tunnel
```

### Prometheus

#### No scraping metrics
1. Verificar que backend exponga `/metrics`
2. Confirmar que backend esté en puerto 3000
3. Revisar logs de Prometheus:
   ```bash
   kubectl logs -l app=prometheus
   ```

## 📚 Referencias

- [Terraform Render Provider](https://registry.terraform.io/providers/render-oss/render/latest/docs)
- [Kubernetes Deployment Best Practices](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Prometheus Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

## 🔗 Enlaces Relacionados

- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [Scripts de Utilidad](../scripts/README.md)
- [CI/CD Workflows](../.github/workflows/README.md)
