# Instrucciones para Configurar Grafana en Render

## 🎯 Variables a Configurar

Copia y pega estas 3 variables exactamente como están:

### Variable 1: GRAFANA_PUSH_URL
```
https://prometheus-prod-56-prod-us-east-2.grafana.net/api/prom/push
```

### Variable 2: GRAFANA_USERNAME
```
2781601
```

### Variable 3: GRAFANA_API_KEY
```
glc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(Reemplaza con tu API Key real de Grafana Cloud)

## 📋 Pasos en Render Dashboard

1. Ve a https://dashboard.render.com/
2. Click en tu servicio **crud-backend-1o29**
3. En el menú lateral izquierdo, click **Environment**
4. Scroll hasta la sección **Environment Variables**
5. Click botón **Add Environment Variable**

### Agregar Variable 1:
- **Key**: `GRAFANA_PUSH_URL`
- **Value**: `https://prometheus-prod-56-prod-us-east-2.grafana.net/api/prom/push`
- Click **Save Changes**

### Agregar Variable 2:
- Click **Add Environment Variable** de nuevo
- **Key**: `GRAFANA_USERNAME`
- **Value**: `2781601`
- Click **Save Changes**

### Agregar Variable 3:
- Click **Add Environment Variable** de nuevo
- **Key**: `GRAFANA_API_KEY`
- **Value**: `glc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (Tu API Key de Grafana Cloud)
- Click **Save Changes**

## ⏱️ Después de Guardar

1. Render automáticamente hará **redeploy** (2-3 minutos)
2. Ve a **Logs** tab
3. Espera a ver estos mensajes:

   **✅ Éxito:**
   ```
   🚀 Grafana Cloud Metrics Push enabled
      URL: https://prometheus-prod-56-prod-us-east-2.grafana.net/api/prom/push
      Username: 2781601
      Interval: 30s
   ✅ [timestamp] Metrics pushed to Grafana Cloud (200)
   ```

   **❌ Error de autenticación:**
   ```
   ❌ Failed to push metrics to Grafana: 401
   ```

## 🔍 Verificar Datos en Grafana (5 minutos después)

1. Ve a Grafana Cloud: https://devopsproyecto.grafana.net
2. Click en **Explore** (icono 🧭 en el menú lateral)
3. En "Data source", selecciona **"grafanacloud-devopsproyecto-prom"** (tu Prometheus)
4. En el campo de query, escribe: `http_requests_total`
5. Click **Run query**

**Deberías ver**: Gráfica con datos de tu backend ✅

## 🚨 Si No Aparecen Datos

### Esperar 2-3 minutos
- El push se hace cada 30 segundos
- Necesitas al menos 3-4 pushes para ver datos

### Verificar en Logs de Render
```bash
# Busca este mensaje cada 30 segundos:
✅ [2025-11-06T23:XX:XX.XXX] Metrics pushed to Grafana Cloud (200)
```

### Probar Query Más Simple
En Grafana Explore, prueba:
```
up
```
O:
```
process_cpu_user_seconds_total
```

## 🎯 Resumen

1. ✅ Agregar 3 variables en Render Environment
2. ✅ Esperar redeploy (2-3 min)
3. ✅ Verificar logs: "Metrics pushed to Grafana Cloud (200)"
4. ✅ Esperar 2-3 minutos más
5. ✅ En Grafana Explore: query `http_requests_total`

**Total**: ~5-8 minutos desde configurar hasta ver datos
