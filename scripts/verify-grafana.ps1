# Script de Verificación de Grafana Push
# Ejecutar desde PowerShell

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Verificación de Integración Grafana Cloud" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Variables de Grafana
$GRAFANA_URL = "https://prometheus-prod-56-prod-us-east-2.grafana.net/api/prom/push"
$GRAFANA_USERNAME = "2781601"
$GRAFANA_API_KEY = "glc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Reemplaza con tu API Key real

Write-Host "1️⃣ Verificando acceso a backend Render..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://crud-backend-1o29.onrender.com/healthz" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend responde correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Backend no responde" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "2 Obteniendo metricas del backend..." -ForegroundColor Yellow
try {
    $metrics = Invoke-WebRequest -Uri "https://crud-backend-1o29.onrender.com/metrics" -UseBasicParsing -TimeoutSec 10
    if ($metrics.StatusCode -eq 200) {
        Write-Host "   OK Metricas disponibles" -ForegroundColor Green
        $lines = $metrics.Content -split "`n"
        $metricCount = ($lines | Where-Object { $_ -match "^http_requests_total" }).Count
        Write-Host "   Lineas de metricas http_requests_total: $metricCount" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ERROR No se pueden obtener metricas" -ForegroundColor Red
}
Write-Host ""

Write-Host "3 Probando push a Grafana Cloud..." -ForegroundColor Yellow
Write-Host "   (Esto puede fallar por formato, pero indica conectividad)" -ForegroundColor Gray
try {
    # Crear credenciales Base64
    $credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${GRAFANA_USERNAME}:${GRAFANA_API_KEY}"))
    
    # Intentar push de prueba
    $headers = @{
        "Authorization" = "Basic $credentials"
        "Content-Type" = "application/x-protobuf"
    }
    
    # Test simple de conectividad
    $testResponse = Invoke-WebRequest -Uri $GRAFANA_URL -Method POST -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    
    Write-Host "   OK Conectividad a Grafana OK" -ForegroundColor Green
} catch {
    $errorCode = $_.Exception.Response.StatusCode.value__
    if ($errorCode -eq 400) {
        Write-Host "   WARN Conectividad OK (400 es esperado)" -ForegroundColor Yellow
        Write-Host "   OK Credenciales aceptadas por Grafana" -ForegroundColor Green
    } elseif ($errorCode -eq 401) {
        Write-Host "   ERROR Error de autenticacion (401)" -ForegroundColor Red
        Write-Host "   Verifica GRAFANA_API_KEY" -ForegroundColor Red
    } else {
        Write-Host "   WARN Error: $errorCode" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "4️⃣ Verificando configuración en Render..." -ForegroundColor Yellow
Write-Host "   📋 Variables necesarias en Render Backend:" -ForegroundColor Cyan
Write-Host "   - GRAFANA_PUSH_URL: $GRAFANA_URL" -ForegroundColor Gray
Write-Host "   - GRAFANA_USERNAME: $GRAFANA_USERNAME" -ForegroundColor Gray
Write-Host "   - GRAFANA_API_KEY: glc_ey... (configurada)" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣ Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Agrega las 3 variables en Render → Backend → Environment" -ForegroundColor White
Write-Host "   2. Espera redeploy (2-3 minutos)" -ForegroundColor White
Write-Host "   3. Ve a Render → Backend → Logs" -ForegroundColor White
Write-Host "   4. Busca: '✅ Metrics pushed to Grafana Cloud (200)'" -ForegroundColor White
Write-Host "   5. En Grafana Explore, query: http_requests_total" -ForegroundColor White
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  URLs de Verificación" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Render Dashboard: https://dashboard.render.com/" -ForegroundColor Blue
Write-Host "Grafana Cloud: https://devopsproyecto.grafana.net/explore" -ForegroundColor Blue
Write-Host "Backend Metrics: https://crud-backend-1o29.onrender.com/metrics" -ForegroundColor Blue
Write-Host ""
