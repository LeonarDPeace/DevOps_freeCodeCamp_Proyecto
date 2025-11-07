# 🔍 Configurar Synthetic Monitoring en Grafana Cloud

## ¿Por qué Synthetic Monitoring?
Es la solución **MÁS SIMPLE** para monitorear tu aplicación en Grafana Cloud sin necesidad de Agents o configuraciones complejas.

---

## 📋 Pasos para Configurar

### 1. Acceder a Grafana Cloud
1. Ve a: https://devopsproyecto.grafana.net
2. Inicia sesión con tus credenciales

### 2. Navegar a Synthetic Monitoring
1. En el menú izquierdo, busca **"Testing & Synthetics"**
2. O ve directamente a: https://grafana.com/auth/sign-in/?plcmt=top-nav&cta=myaccount
3. Selecciona tu stack: **devopsproyecto**

### 3. Crear Check HTTP para Backend

#### Click en "Add New Check" → "HTTP"

**Configuración:**
```yaml
Name: Backend Health Check
URL: https://crud-backend-1o29.onrender.com/healthz
Method: GET
Frequency: Every 60 seconds (1 minute)
Timeout: 10 seconds

Locations: (selecciona 2-3)
  - US East (Ohio)
  - US West (California)
  - Europe West (Frankfurt)

Success Criteria:
  - Status Code: 200
  - Response contains: "ok"
  
Alerts: (opcional)
  - Consecutive failures: 3
  - Notify via: Email
```

**Click en "Save"**

### 4. Crear Check HTTP para Frontend

#### Click en "Add New Check" → "HTTP"

**Configuración:**
```yaml
Name: Frontend Availability
URL: https://crud-frontend-cerx.onrender.com
Method: GET
Frequency: Every 60 seconds
Timeout: 10 seconds

Locations: (mismas que backend)
  - US East (Ohio)
  - US West (California)
  - Europe West (Frankfurt)

Success Criteria:
  - Status Code: 200
  - Response contains: "root"
  
Alerts:
  - Consecutive failures: 3
  - Notify via: Email
```

**Click en "Save"**

### 5. (Opcional) Check para Métricas Endpoint

**Configuración:**
```yaml
Name: Metrics Endpoint Check
URL: https://crud-backend-1o29.onrender.com/metrics
Method: GET
Frequency: Every 300 seconds (5 minutes)
Timeout: 15 seconds

Success Criteria:
  - Status Code: 200
  - Response contains: "process_cpu"
```

---

## 📊 Ver Resultados

### Dashboard Automático
Después de crear los checks, Grafana creará automáticamente:
1. **Dashboard de Synthetic Monitoring** en:
   - Menu → Dashboards → "Synthetic Monitoring"
2. Verás:
   - ✅ Uptime %
   - 📈 Response times
   - 🌍 Checks por ubicación
   - ⏱️ Latencia promedio

### Métricas Disponibles
```
- Uptime percentage (99.9%, 99.0%, etc.)
- Response time (ms)
- SSL certificate expiry
- DNS resolution time
- Check success/failure rate
```

---

## 🔔 Configurar Alertas

### 1. En Synthetic Monitoring → Alerts
```yaml
Alert Rule: Backend Down
Condition: 3 consecutive failures
Severity: Critical
Notification: Email
```

### 2. Agregar Contact Points
1. Ve a: Alerting → Contact Points
2. Click "Add Contact Point"
3. Configura tu email:
   ```
   Name: My Email
   Type: Email
   Addresses: tu-email@universidad.edu
   ```

---

## ✅ Verificación

Después de 5 minutos, deberías ver:
- ✅ Checks apareciendo en el dashboard
- ✅ Response times graficados
- ✅ Uptime percentage calculado
- ✅ Mapa mundial con ubicaciones

---

## 🎯 Ventajas de Esta Solución

✅ **Sin código**: No requiere cambios en tu aplicación  
✅ **Sin agents**: No necesitas instalar Grafana Agent  
✅ **Gratis**: Incluido en Grafana Cloud free tier  
✅ **Multi-región**: Checks desde múltiples ubicaciones  
✅ **Alertas**: Notificaciones automáticas si algo falla  
✅ **Dashboard**: Visualización automática  

---

## 📸 Capturas de Pantalla Recomendadas

Para tu proyecto, toma screenshots de:
1. **Lista de checks** configurados
2. **Dashboard Synthetic Monitoring** mostrando uptime
3. **Gráficas de response time**
4. **Mapa mundial** con ubicaciones
5. **Configuración de alertas**

---

## 🆘 Troubleshooting

### Si no ves datos:
- Espera 5-10 minutos para primeros resultados
- Verifica que las URLs sean correctas
- Confirma que los servicios estén online

### Si los checks fallan:
- Verifica en Render que servicios estén activos
- Check manual: `curl https://crud-backend-1o29.onrender.com/healthz`
- Revisa logs en Render Dashboard

---

## 📚 Referencias

- Grafana Synthetic Monitoring Docs: https://grafana.com/docs/grafana-cloud/testing/synthetic-monitoring/
- Tu Grafana: https://devopsproyecto.grafana.net

---

**Tiempo estimado de configuración**: 10-15 minutos  
**Costo**: $0 (incluido en free tier)  
**Dificultad**: ⭐☆☆☆☆ (Muy fácil)
