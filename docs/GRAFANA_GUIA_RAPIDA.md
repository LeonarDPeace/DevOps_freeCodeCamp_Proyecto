# Configuración Rápida de Grafana Cloud

## 🎯 Objetivo
Conectar Grafana Cloud con tu backend en Render para visualizar métricas.

## 📋 Opción 1: Configuración Manual (Más Simple)

### Paso 1: Crear Data Source de tipo Prometheus

1. En Grafana Cloud, ve a **Configuration** (⚙️) → **Data Sources**
2. Click **"Add data source"**
3. Busca y selecciona **"Prometheus"**
4. Configuración:
   ```
   Name: Render Backend Metrics
   URL: https://crud-backend-1o29.onrender.com/metrics
   ```
5. En **"HTTP Method"**, selecciona **GET**
6. **Scrape interval**: `30s` (opcional)
7. Click **"Save & Test"**

### ⚠️ Problema Esperado
```
HTTP Error Bad Gateway
```

**Por qué falla**: Grafana Cloud no puede hacer scraping directo a Render porque:
- Render bloquea IPs externas frecuentes
- Free tier de Render tiene rate limits
- Grafana necesita autenticación

## 📋 Opción 2: Push Metrics a Grafana (Recomendado)

Esta opción ya está implementada en tu código. Solo necesitas configurar las variables.

### Paso 1: Obtener Credenciales de Grafana Cloud

1. En Grafana Cloud, ve a **My Account** (icono usuario arriba derecha)
2. Click en tu **Stack** → **Details** o **"Send data"**
3. Busca la sección **"Prometheus"** o **"Send metrics"**
4. Verás algo como:

   ```yaml
   Remote Write Endpoint:
     https://prometheus-prod-XX-prod-XX-central-X.grafana.net/api/prom/push
   
   Username / Instance ID:
     123456
   
   Password / API Key:
     [Generate now] ← Click aquí
   ```

5. **Copia estos 3 valores**:
   - Remote Write URL
   - Username (Instance ID)
   - Password (API Key generado)

### Paso 2: Configurar en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Selecciona tu servicio **Backend** (crud-backend-1o29)
3. Ve a **Environment** → **Add Environment Variable**

Agrega estas 3 variables:

#### Variable 1:
```
Key: GRAFANA_PUSH_URL
Value: https://prometheus-prod-XX-prod-XX-central-X.grafana.net/api/prom/push
```

#### Variable 2:
```
Key: GRAFANA_USERNAME
Value: 123456
```
(Tu Instance ID de Grafana)

#### Variable 3:
```
Key: GRAFANA_API_KEY
Value: glc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(El API Key que generaste)

4. Click **"Save Changes"**
5. **Espera 2-3 minutos** para que Render redeploy automáticamente

### Paso 3: Verificar Push en Logs de Render

1. En Render Dashboard → Backend Service → **Logs**
2. Busca estos mensajes:

   **✅ Configurado correctamente:**
   ```
   🚀 Grafana Cloud Metrics Push enabled
      URL: https://prometheus-prod-XX...
      Username: 123456
      Interval: 30s
   ✅ [2025-11-06T...] Metrics pushed to Grafana Cloud (200)
   ```

   **❌ Error de configuración:**
   ```
   ⚠️ Grafana Cloud push disabled - missing configuration
   ```
   → Verifica que las 3 variables estén configuradas

   **❌ Error de autenticación:**
   ```
   ❌ Failed to push metrics to Grafana: 401
   ```
   → Regenera el API Key en Grafana

### Paso 4: Verificar Datos en Grafana

1. En Grafana Cloud, ve a **Explore** (🧭 icono de brújula)
2. En **"Data source"**, selecciona el Prometheus de tu Stack (por defecto)
3. En **"Metric"**, escribe: `http_requests_total`
4. Click **"Run query"**

**Deberías ver**:
- Gráfica con datos ✅
- Mensaje: "No data" → Espera 1-2 minutos más

### Paso 5: Crear Dashboard

1. Ve a **Dashboards** → **New** → **New Dashboard**
2. Click **"Add visualization"**
3. Selecciona tu Prometheus data source

#### Panel 1: Total Requests per Second
```promql
sum(rate(http_requests_total[5m])) by (method)
```
- **Visualization**: Time series
- **Title**: HTTP Requests/sec
- **Legend**: {{method}}

#### Panel 2: Requests by Endpoint
```promql
sum(rate(http_requests_total[5m])) by (route)
```
- **Visualization**: Bar chart
- **Title**: Requests by Endpoint

#### Panel 3: Error Rate
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m])) 
/ sum(rate(http_requests_total[5m])) * 100
```
- **Visualization**: Stat
- **Title**: Error Rate (%)
- **Unit**: Percent (0-100)
- **Thresholds**: 0-1 (green), 1-5 (yellow), 5+ (red)

4. Click **"Apply"** en cada panel
5. Click **"Save dashboard"** (icono disco arriba derecha)
6. Nombre: `DevOps Project - Backend Metrics`

## 🧪 Comandos de Verificación

### Verificar que Render está enviando métricas:
```bash
# Ver métricas disponibles
curl https://crud-backend-1o29.onrender.com/metrics
```

### Verificar formato de métricas:
```bash
curl https://crud-backend-1o29.onrender.com/metrics | grep http_requests_total
```

**Output esperado:**
```
http_requests_total{method="GET",route="/healthz",status_code="200"} 15
http_requests_total{method="GET",route="/users",status_code="200"} 8
```

## 🚨 Troubleshooting

### Problema 1: "No data" en Grafana después de 5 minutos

**Solución**:
1. Verifica logs de Render: ¿Dice "Metrics pushed"?
2. Verifica que las 3 variables estén correctas
3. En Grafana Explore, prueba query simple: `up`

### Problema 2: Error 401 en logs de Render

**Solución**:
1. Regenera API Key en Grafana Cloud
2. Actualiza `GRAFANA_API_KEY` en Render
3. Espera redeploy

### Problema 3: Error 404 en logs de Render

**Solución**:
1. Verifica que `GRAFANA_PUSH_URL` termine en `/api/prom/push`
2. Debe ser la URL de **Remote Write**, no la URL del dashboard

### Problema 4: Render no está enviando métricas

**Verificar**:
1. ¿El servicio está corriendo? → Check `/healthz`
2. ¿Las variables están configuradas? → Render Environment
3. ¿Hay errores en logs? → Render Logs

## 📊 Métricas Disponibles

Tu backend expone estas métricas:

```
# Requests HTTP
http_requests_total{method,route,status_code}

# CPU Process
process_cpu_user_seconds_total
process_cpu_system_seconds_total

# Memoria
nodejs_heap_size_total_bytes
nodejs_heap_size_used_bytes

# Handles activos
nodejs_active_handles_total
```

## 🎯 Resumen de Pasos

1. ✅ Obtener credenciales de Grafana Cloud (Remote Write URL, Username, API Key)
2. ✅ Agregar 3 variables en Render Backend
3. ✅ Esperar redeploy (2-3 min)
4. ✅ Verificar logs: "Metrics pushed to Grafana Cloud"
5. ✅ En Grafana Explore: query `http_requests_total`
6. ✅ Crear dashboard con panels sugeridos

**Tiempo total**: ~15 minutos

## 🔗 URLs Útiles

- Grafana Cloud: https://devopsproyecto.grafana.net
- Render Dashboard: https://dashboard.render.com
- Backend Metrics: https://crud-backend-1o29.onrender.com/metrics
- Backend Health: https://crud-backend-1o29.onrender.com/healthz

---

**¿Dudas?** Revisa la guía completa en `docs/GRAFANA_SETUP_COMPLETO.md`
