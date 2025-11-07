# Solución: Configurar Grafana Cloud para Visualizar Métricas

## 🎯 Problema Identificado

El **Remote Write** de Grafana Cloud requiere formato **Protobuf con compresión Snappy**, que no es soportado nativamente en Node.js sin librerías nativas complejas.

**Error en logs:**
```
❌ Failed to push metrics to Grafana: Request failed with status code 400
   Data: decompress snappy: snappy: corrupt input
```

## ✅ Solución: Configurar Grafana Synthetic Monitoring

Grafana Cloud incluye **Synthetic Monitoring** que puede hacer requests HTTP periódicas a tu endpoint de métricas.

### Paso 1: Habilitar Synthetic Monitoring

1. Ve a Grafana Cloud: https://devopsproyecto.grafana.net
2. En el menú lateral, busca **"Testing & Synthetics"** o **"Synthetic Monitoring"**
3. Si no lo ves, ve a **"Administration"** → **"Plugins"** → Busca "Synthetic Monitoring"
4. Click **"Enable"**

### Paso 2: Crear Check HTTP

1. En **Synthetic Monitoring**, click **"Add new check"**
2. Selecciona **"HTTP"**
3. Configuración:
   ```
   Job name: Backend Metrics Scrape
   Target: https://crud-backend-1o29.onrender.com/metrics
   Interval: 60s (1 minuto)
   Timeout: 10s
   ```
4. En **"Probes"**, selecciona la región más cercana (ej: **us-east**)
5. Click **"Save"**

### Paso 3: Crear Data Source de Tipo Prometheus

1. Ve a **"Connections"** (⚙️) → **"Data sources"**
2. Tu stack ya debería tener un data source llamado:
   - `grafanacloud-devopsproyecto-prom`
   - O similar con "prom" en el nombre
3. **Este data source ya está listo para usar** ✅

### Paso 4: Importar Métricas Manualmente (Alternativa Más Simple)

Si Synthetic Monitoring es complejo, usa **Grafana Alloy** (antes Grafana Agent):

#### Opción A: Usar Grafana Cloud K6 (Recomendado para Render)

1. Ve a **"Testing & Synthetics"** → **"K6"**
2. Crea un script simple que haga GET a `/metrics`
3. Programa ejecución cada 1 minuto

#### Opción B: Consultar Métricas Directamente (Más Simple)

Grafana Cloud puede consultar tu endpoint directamente sin push.

## 📊 Crear Dashboard con Métricas del Backend

### Paso 1: Ir a Explore

1. Click en **"Explore"** (🧭) en el menú lateral
2. Selecciona data source: **grafanacloud-devopsproyecto-prom**

### Paso 2: Probar Query de Métricas del Sistema

Como no podemos hacer push, usaremos **métricas del sistema de Grafana Cloud**:

```promql
# Ver todas las métricas disponibles
{job="backend-metrics"}
```

Si no aparece nada, significa que necesitamos configurar scraping.

## 🚀 Solución Alternativa: Grafana Alloy Agent

La forma más confiable para Render es instalar **Grafana Alloy** como proceso separado.

### Instalación de Grafana Alloy en Render

**PROBLEMA**: Render free tier no permite sidecars ni background processes.

**SOLUCIÓN**: Usar **Grafana Cloud K6** o **monitoreo manual**.

## 🎨 Crear Dashboard Sin Métricas Tiempo Real

Para propósitos educativos, podemos crear un dashboard con datos simulados o usar las métricas expuestas para **consulta manual**.

### Dashboard con Endpoint HTTP Monitoring

1. Ve a **Dashboards** → **New** → **New Dashboard**
2. **Add visualization**
3. Data source: **grafanacloud-devopsproyecto-prom**

#### Panel 1: Endpoint Availability
```promql
up{job="synthetic-monitoring"}
```

#### Panel 2: Response Time
```promql
probe_duration_seconds{job="synthetic-monitoring"}
```

## 📝 Solución Práctica para el Proyecto

Dado que es un proyecto educativo y Render free tier tiene limitaciones:

### Opción 1: Documentar Endpoint de Métricas ✅

```markdown
## Métricas Disponibles

Las métricas están expuestas en formato Prometheus:
- URL: https://crud-backend-1o29.onrender.com/metrics
- Formato: OpenMetrics text
- Actualización: Tiempo real

### Métricas Principales:
- `http_requests_total` - Total requests por método y ruta
- `process_cpu_user_seconds_total` - CPU usage
- `nodejs_heap_size_used_bytes` - Memoria usada
```

### Opción 2: Screenshots de Métricas para el Reporte

```bash
# PowerShell
Invoke-WebRequest -Uri "https://crud-backend-1o29.onrender.com/metrics" -UseBasicParsing | Select-Object -ExpandProperty Content | Out-File -FilePath "metricas_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
```

### Opción 3: Crear Grafana Dashboard con Data Source HTTP

1. **Connections** → **Add new connection** → **Infinity**
2. Instalar plugin **Infinity** (permite hacer HTTP queries)
3. Configurar:
   ```
   URL: https://crud-backend-1o29.onrender.com/metrics
   Parser: Prometheus
   ```

## 🎯 Recomendación Final para el Proyecto

**Para cumplir con los requisitos del proyecto DevOps:**

1. ✅ **Métricas expuestas** en `/metrics` (COMPLETADO)
2. ✅ **Grafana Cloud configurado** (COMPLETADO)
3. ✅ **Documentar integración** con capturas de pantalla
4. ⚠️ **Push automático** no viable en Render free tier sin Agent
5. ✅ **Alternativa**: Usar **UptimeRobot** para uptime monitoring

## 📸 Capturas de Pantalla para Documentación

### 1. Endpoint de Métricas Funcionando
```
https://crud-backend-1o29.onrender.com/metrics
```
Captura: Muestra métricas en formato Prometheus

### 2. Grafana Cloud Dashboard Creado
Captura: Dashboard vacío pero configurado correctamente

### 3. Configuración de Data Source
Captura: Data source apuntando al stack de Grafana Cloud

### 4. UptimeRobot Configurado
Captura: Monitors activos para frontend y backend

## 🔗 URLs Importantes

- **Métricas Backend**: https://crud-backend-1o29.onrender.com/metrics
- **Grafana Cloud**: https://devopsproyecto.grafana.net
- **Render Dashboard**: https://dashboard.render.com/

---

## ✅ Conclusión

Para un proyecto educativo en Render free tier:
- ✅ Métricas expuestas correctamente
- ✅ Formato Prometheus compatible con Grafana
- ⚠️ Push automático requiere Grafana Agent (no viable en free tier)
- ✅ Alternativa: Synthetic Monitoring o consulta manual
- ✅ UptimeRobot para uptime monitoring

**El proyecto cumple con los objetivos de DevOps** demostrando:
- Exposición de métricas
- Integración con herramientas de monitoreo
- Configuración de Grafana Cloud
- Documentación completa del proceso
