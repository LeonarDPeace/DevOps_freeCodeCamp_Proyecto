# Dashboard de Grafana - Configuración

## Importar Dashboard

1. Ir a Grafana Cloud → Dashboards → Import
2. Usar las siguientes queries de Prometheus

## Panel 1: CPU Usage
```promql
avg(rate(cpu_usage_seconds_total[1m])) by (instance)
```

## Panel 2: Error Rate
```promql
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
  / 
sum(rate(http_requests_total[5m])) by (service)
```

## Panel 3: Request Duration (SLO)
```promql
rate(http_request_duration_seconds_bucket{le="0.2"}[5m]) 
  / rate(http_request_duration_seconds_count[5m])
```

## Panel 4: Total Requests
```promql
sum(rate(http_requests_total[5m])) by (method, route)
```

## Panel 5: Active Connections
```promql
nodejs_active_handles_total
```

## Alertas

### Alert 1: High Error Rate
```promql
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
```
**Acción:** Enviar notificación cuando error rate > 5%

### Alert 2: Slow Response Time
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
```
**Acción:** Enviar notificación cuando p95 > 500ms

### Alert 3: Service Down
```promql
up{job="crud-backend"} == 0
```
**Acción:** Enviar notificación inmediata
