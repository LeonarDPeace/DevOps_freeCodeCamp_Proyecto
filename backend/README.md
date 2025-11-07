# Backend - CRUD API con Node.js y PostgreSQL

API REST desarrollada con Express.js que proporciona operaciones CRUD para gestión de usuarios, con integración a PostgreSQL y métricas de Prometheus.

## 📋 Descripción

Servidor backend que expone endpoints HTTP para:
- Crear y listar usuarios en base de datos PostgreSQL
- Health checks para monitoreo de Kubernetes/Render
- Métricas en formato Prometheus para Grafana Cloud
- Timestamps automáticos en formato colombiano

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js 4.x
- **Base de Datos**: PostgreSQL
- **Cliente DB**: pg (node-postgres)
- **Métricas**: prom-client
- **HTTP Client**: axios
- **CORS**: cors middleware

## 📡 Endpoints API

### Health Checks

#### `GET /healthz`
**Descripción**: Liveness probe para Kubernetes  
**Respuesta**: `200 OK`

#### `GET /readiness`
**Descripción**: Readiness probe con verificación de conexión a BD  
**Respuesta**:
- `200 OK` - Base de datos accesible
- `503 Service Unavailable` - Error de conexión

### Operaciones de Usuarios

#### `GET /users`
**Descripción**: Obtener lista completa de usuarios  
**Respuesta**:
```json
[
  {
    "id": 1,
    "name": "Usuario Ejemplo 14:30:45"
  }
]
```

#### `POST /users`
**Descripción**: Crear nuevo usuario con timestamp automático  
**Body**:
```json
{
  "name": "Nuevo Usuario"
}
```
**Comportamiento**: Añade automáticamente timestamp en formato `HH:mm:ss` (zona horaria Colombia)  
**Respuesta**:
```json
{
  "id": 2,
  "name": "Nuevo Usuario 14:30:45"
}
```

### Métricas

#### `GET /metrics`
**Descripción**: Endpoint de métricas en formato OpenMetrics para Prometheus  
**Formato**: Texto plano compatible con Prometheus  
**Métricas expuestas**:
- `http_requests_total{method, route, status_code}` - Contador de requests HTTP
- `process_cpu_user_seconds_total` - Uso de CPU
- `nodejs_heap_size_total_bytes` - Memoria heap de Node.js

## 🔧 Variables de Entorno

```bash
# Conexión a PostgreSQL
DATABASE_URL=postgres://user:password@host:port/database

# Configuración de Grafana Cloud (opcional)
GRAFANA_CLOUD_PROMETHEUS_API_URL=https://prometheus-prod-xx-xxx.grafana.net/api/prom/push
GRAFANA_CLOUD_API_USER=12345
GRAFANA_CLOUD_API_KEY=glc_xxxxxxxxxxxxx
GRAFANA_CLOUD_PROMETHEUS_REMOTE_WRITE_URL=https://prometheus-prod-xx-xxx.grafana.net/api/prom/push

# Puerto (opcional, default: 3000)
PORT=3000
```

## 🚀 Desarrollo Local

### Requisitos Previos
- Node.js 14+ instalado
- PostgreSQL corriendo localmente o acceso a instancia remota
- Tabla `users` creada en la base de datos

### Inicializar Base de Datos

Ejecutar desde la carpeta `scripts/`:
```bash
node init-db.js
```

Esto creará la tabla `users`:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);
```

### Instalación

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install
```

### Ejecución

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 🐳 Docker

### Dockerfile Multi-Stage

El backend utiliza un Dockerfile optimizado con dos etapas:

1. **Build Stage**: Instalación de dependencias
2. **Production Stage**: Imagen final ligera solo con archivos necesarios

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

### Build Local

```bash
docker build -t crud-backend .
docker run -p 3000:3000 --env-file .env crud-backend
```

## 📊 Características Especiales

### Timestamps Automáticos

Implementado en el commit `c561849`. Cada usuario creado via POST recibe automáticamente:
- Formato: `HH:mm:ss` (24 horas)
- Locale: `es-CO` (Colombia)
- Ejemplo: `"Usuario Prueba 14:30:45"`

```javascript
const timestamp = new Date().toLocaleTimeString('es-CO', { 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit', 
  hour12: false 
});
const userNameWithTimestamp = `${name} ${timestamp}`;
```

### CORS Configurado

```javascript
const corsOptions = {
  origin: [
    'https://crud-frontend-cerx.onrender.com',
    'http://localhost:3001'
  ],
  credentials: true
};
```

### Métricas Prometheus

Contador personalizado para tracking de requests:

```javascript
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 📦 Deployment en Render

### Configuración Automática

El backend se despliega automáticamente en Render cuando se hace push a `main`:

- **URL Producción**: https://crud-backend-1o29.onrender.com
- **Auto-deploy**: GitHub Actions + Render webhooks
- **Health Checks**: `/readiness` cada 30 segundos

### Variables de Entorno en Render

Configurar en **Render Dashboard → Backend Service → Environment**:
- `DATABASE_URL`: Provisto automáticamente por Render PostgreSQL addon
- Opcionalmente: variables de Grafana Cloud para push de métricas

## 🔍 Troubleshooting

### Error: "Cannot connect to database"
- Verificar que `DATABASE_URL` esté configurada correctamente
- Comprobar que PostgreSQL esté corriendo
- Revisar firewall/red si es instancia remota

### Error: "EADDRINUSE"
- El puerto 3000 ya está en uso
- Cambiar `PORT` en variables de entorno o matar proceso existente

### Usuarios sin timestamp
- Verificar que se esté usando POST al endpoint `/users`
- El timestamp se añade en el backend, no en el cliente

## 📝 Logs y Monitoreo

- **Logs de aplicación**: Visibles en Render Dashboard → Logs
- **Métricas**: Disponibles en `/metrics` endpoint
- **Grafana Cloud**: Dashboard "devopsproyecto" (Stack ID: 1428683)

## 🔗 Enlaces Relacionados

- [Frontend README](../frontend/README.md)
- [Infrastructure README](../infrastructure/README.md)
- [Scripts de Utilidad](../scripts/README.md)
- [CI/CD Workflows](../.github/workflows/README.md)
