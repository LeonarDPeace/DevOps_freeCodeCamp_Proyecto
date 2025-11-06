# Guía Completa: Configurar y Conectar Grafana Cloud

## 📋 Requisitos Previos

- ✅ Backend desplegado en Render con endpoint `/metrics`
- ✅ Cuenta en Grafana Cloud (grafana.com)
- ✅ Backend exponiendo métricas en formato Prometheus

## 🚀 Paso 1: Crear Cuenta en Grafana Cloud

1. Ve a [https://grafana.com/auth/sign-up/create-user](https://grafana.com/auth/sign-up/create-user)
2. Completa el registro:
   - Email
   - Nombre de usuario
   - Contraseña
3. Verifica tu email
4. Crea tu **Stack** (instancia de Grafana):
   - Stack name: `devops-proyecto` (o el nombre que prefieras)
   - Region: Selecciona la más cercana (ej: `us-east-1`)
5. Haz clic en **"Create Stack"**

## 🔧 Paso 2: Configurar Prometheus Remote Write

### Opción A: Usar Grafana Agent (Recomendado para Render)

Grafana Agent es ligero y perfecto para scraping de métricas en servicios externos.

#### 1. Obtener credenciales de Remote Write

1. En Grafana Cloud Dashboard, ve a **"My Account"** (arriba derecha)
2. Click en **"Stack"** → Tu stack → **"Details"**
3. En la sección **"Prometheus"**, encontrarás:
   ```
   Remote Write Endpoint: https://prometheus-xxx.grafana.net/api/prom/push
   Username/Instance ID: 123456
   Password/API Key: [Click "Generate now"]
   ```
4. **Copia estos valores** (los necesitarás)

#### 2. Configurar Grafana Agent en tu Backend

**Opción 2A: Sidecar Container (Render no soporta sidecars en free tier)**

Como Render free tier no soporta múltiples containers, usaremos la **Opción B**.

### Opción B: Configurar Prometheus Pushgateway

Ya que tu backend está en Render y no puedes correr Grafana Agent fácilmente, usaremos el **endpoint de métricas directo**.

#### 1. Instalar `prom-client` con push capabilities

Tu backend ya tiene `prom-client`, pero vamos a agregar push a Grafana Cloud.

Crea un nuevo archivo en el backend:

```bash
# En terminal
cd backend
npm install axios
```

#### 2. Actualizar index.js para push metrics a Grafana

Agrega este código después de la configuración de métricas:

```javascript
// Después de registrar las métricas
const axios = require('axios');

// Push metrics a Grafana Cloud cada 15 segundos
if (process.env.GRAFANA_REMOTE_WRITE_URL && process.env.GRAFANA_API_KEY) {
  setInterval(async () => {
    try {
      const metrics = await register.metrics();
      await axios.post(
        process.env.GRAFANA_REMOTE_WRITE_URL,
        metrics,
        {
          auth: {
            username: process.env.GRAFANA_USERNAME,
            password: process.env.GRAFANA_API_KEY
          },
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );
      console.log('✅ Metrics pushed to Grafana Cloud');
    } catch (error) {
      console.error('❌ Failed to push metrics:', error.message);
    }
  }, 15000); // Push cada 15 segundos
}
```

#### 3. Configurar variables de entorno en Render

1. Ve a Render Dashboard → Backend Service
2. **Environment** → **Add Environment Variable**
3. Agrega estas variables:

```bash
GRAFANA_REMOTE_WRITE_URL=https://prometheus-xxx.grafana.net/api/prom/push
GRAFANA_USERNAME=123456
GRAFANA_API_KEY=tu_api_key_aqui
```

**⚠️ IMPORTANTE**: Reemplaza con tus valores reales de Grafana Cloud.

### Opción C: Usar Grafana Cloud Agent (Simplificado)

Si las opciones anteriores son complejas, usa esta alternativa más simple:

#### 1. Crear Data Source de tipo Prometheus en Grafana

1. En Grafana Cloud, ve a **Configuration** (⚙️) → **Data Sources**
2. Click **"Add data source"**
3. Selecciona **"Prometheus"**
4. Configuración:
   ```
   Name: Render Backend
   URL: https://crud-backend-jchh.onrender.com
   ```
5. En **"HTTP"** → **"Custom HTTP Headers"**:
   - Header: `Accept`
   - Value: `application/openmetrics-text; version=1.0.0; charset=utf-8`

6. **Save & Test**

⚠️ **Problema**: Grafana intentará hacer scraping desde su servidor, pero Render puede bloquear requests externos.

## 🎯 Paso 3: Solución Recomendada para Render

La forma más confiable es usar **Grafana Cloud Synthetic Monitoring** + **exportar métricas manualmente**.

### Implementación Práctica:

#### 1. Crear API Key en Grafana Cloud

1. Grafana Cloud → **My Account** → **API Keys**
2. Click **"Add API Key"**
3. Configuración:
   - Name: `Render Metrics`
   - Role: `Editor`
   - Time to live: `No expiration`
4. **Copy** el API Key generado

#### 2. Modificar Backend para Push Metrics

Crea archivo `backend/grafana-push.js`:

```javascript
const axios = require('axios');

class GrafanaMetricsPusher {
  constructor(register, config) {
    this.register = register;
    this.config = config;
    this.enabled = config.url && config.username && config.password;
  }

  async push() {
    if (!this.enabled) {
      console.log('⏭️  Grafana push disabled (missing credentials)');
      return;
    }

    try {
      const metrics = await this.register.metrics();
      
      await axios.post(
        this.config.url,
        metrics,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          },
          headers: {
            'Content-Type': 'application/openmetrics-text; version=1.0.0; charset=utf-8'
          }
        }
      );
      
      console.log(`✅ [${new Date().toISOString()}] Metrics pushed to Grafana`);
    } catch (error) {
      console.error(`❌ Failed to push metrics: ${error.message}`);
    }
  }

  startPushing(intervalMs = 30000) {
    if (!this.enabled) {
      console.log('⚠️  Grafana Cloud metrics pushing is disabled');
      return;
    }

    console.log(`🚀 Starting Grafana metrics push (every ${intervalMs / 1000}s)`);
    setInterval(() => this.push(), intervalMs);
    
    // Push inmediato al iniciar
    this.push();
  }
}

module.exports = GrafanaMetricsPusher;
```

#### 3. Integrar en index.js

Agrega después de la configuración de métricas:

```javascript
const GrafanaMetricsPusher = require('./grafana-push');

// ... después de definir 'register'

// Configurar push a Grafana Cloud
const grafanaPusher = new GrafanaMetricsPusher(register, {
  url: process.env.GRAFANA_PUSH_URL,
  username: process.env.GRAFANA_USERNAME,
  password: process.env.GRAFANA_API_KEY
});

// Iniciar en el listen
app.listen(port, async () => {
  // ... código existente ...
  
  // Iniciar push de métricas
  grafanaPusher.startPushing(30000); // Push cada 30 segundos
});
```

#### 4. Variables en Render

```bash
GRAFANA_PUSH_URL=https://prometheus-blocks-prod-us-central1.grafana.net/api/prom/push
GRAFANA_USERNAME=tu_username_aqui
GRAFANA_API_KEY=tu_api_key_aqui
```

## 📊 Paso 4: Crear Dashboard en Grafana

1. En Grafana Cloud, ve a **Dashboards** → **New** → **New Dashboard**
2. Click **"Add visualization"**
3. Selecciona tu Data Source (si configuraste uno)

### Panel 1: Total Requests

```promql
sum(rate(http_requests_total[5m])) by (method)
```

- Visualization: **Time series**
- Panel title: `HTTP Requests per Second`
- Legend: `{{method}}`

### Panel 2: Error Rate

```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m])) 
/ 
sum(rate(http_requests_total[5m])) * 100
```

- Visualization: **Stat**
- Panel title: `Error Rate %`
- Unit: `percent (0-100)`
- Thresholds: 
  - Green: < 1%
  - Yellow: 1-5%
  - Red: > 5%

### Panel 3: Response Time (si tienes histogram)

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

- Visualization: **Gauge**
- Panel title: `95th Percentile Response Time`
- Unit: `seconds (s)`

### Panel 4: Endpoint Breakdown

```promql
sum(rate(http_requests_total[5m])) by (route)
```

- Visualization: **Bar chart**
- Panel title: `Requests by Endpoint`

## 🔔 Paso 5: Configurar Alertas

1. En el Dashboard, selecciona un panel
2. Click **"Alert"** tab
3. **Create alert rule**:

```yaml
Alert rule:
  Name: High Error Rate
  Condition: WHEN last() OF query(A) IS ABOVE 5
  
Query A:
  sum(rate(http_requests_total{status_code=~"5.."}[5m])) 
  / sum(rate(http_requests_total[5m])) * 100

Evaluate: Every 1m for 5m
```

4. **Contact points**:
   - Email (configurar en **Alerting** → **Contact points**)
   - Slack (si tienes webhook)

## 🧪 Paso 6: Verificar que Funciona

### Probar endpoint de métricas:

```bash
# PowerShell
Invoke-WebRequest -Uri "https://crud-backend-jchh.onrender.com/metrics" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Deberías ver algo como:**

```
# HELP http_requests_total Total de requests HTTP
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/healthz",status_code="200"} 42
http_requests_total{method="GET",route="/users",status_code="200"} 15
```

### Verificar en Grafana:

1. Ve a **Explore** (🧭 icono en sidebar)
2. Selecciona tu data source
3. Query: `http_requests_total`
4. Click **Run query**
5. Deberías ver las métricas

## 📝 Resumen de URLs Importantes

| Servicio | URL |
|----------|-----|
| Grafana Cloud | https://tu-stack.grafana.net |
| Prometheus Remote Write | https://prometheus-xxx.grafana.net/api/prom/push |
| Métricas Backend | https://crud-backend-jchh.onrender.com/metrics |
| Dashboard | https://tu-stack.grafana.net/d/dashboard-id |

## 🚨 Troubleshooting

### "No data" en Grafana

- ✅ Verifica que el endpoint `/metrics` responde
- ✅ Chequea logs de Render para errores de push
- ✅ Verifica credenciales de Grafana Cloud
- ✅ Asegura que Render no está "sleeping" (cold start)

### "Authentication failed"

- ✅ Regenera API Key en Grafana Cloud
- ✅ Verifica que el username es correcto (Instance ID)
- ✅ Actualiza variables de entorno en Render

### Métricas no se actualizan

- ✅ Intervalo de push muy largo (reduce a 15-30s)
- ✅ Render free tier tiene cold start (primera request tarda)
- ✅ Verifica logs: `console.log('✅ Metrics pushed')`

## 💡 Tips Adicionales

1. **Free Tier Limits**:
   - Grafana Cloud: 10,000 series, 50 GB logs/mes
   - Render: Servicio "duerme" después de 15min inactividad

2. **Optimizar Métricas**:
   - No expongas métricas muy granulares
   - Usa labels estratégicamente
   - Limita cardinalidad (diferentes combinaciones de labels)

3. **Alternativa Simple**:
   - Usar **UptimeRobot** para uptime monitoring
   - Grafana solo para métricas internas
   - Render logs para debugging

¿Quieres que implemente alguna de estas opciones en tu código?
