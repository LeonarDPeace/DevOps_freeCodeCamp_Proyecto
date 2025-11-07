/**
 * Grafana Cloud Metrics Pusher
 * 
 * NOTA: Grafana Remote Write requiere formato Protobuf + Snappy compression
 * que no es soportado nativamente en Node.js sin librerías nativas complejas.
 * 
 * SOLUCIÓN RECOMENDADA:
 * - Opción 1: Usar Grafana Agent para scraping (requiere servidor adicional)
 * - Opción 2: Configurar Grafana Cloud para scraping directo (limitado en Render)
 * - Opción 3: Usar métricas expuestas en /metrics para consulta manual
 * 
 * Para este proyecto educativo, las métricas están disponibles en:
 * https://crud-backend-1o29.onrender.com/metrics
 */
class GrafanaMetricsPusher {
  constructor(register, config) {
    this.register = register;
    this.config = config;
    this.enabled = Boolean(
      config.url && 
      config.username && 
      config.password
    );
    
    if (!this.enabled) {
      console.log('⚠️  Grafana Cloud push disabled - missing configuration');
      console.log('   Required env vars: GRAFANA_PUSH_URL, GRAFANA_USERNAME, GRAFANA_API_KEY');
    }
  }

  /**
   * Push metrics to Grafana Cloud
   * DESHABILITADO: Remote Write requiere Protobuf + Snappy
   */
  async push() {
    if (!this.enabled) {
      return;
    }

    // Remote Write requiere formato Protobuf con compresión Snappy
    // No es viable implementar sin dependencias nativas complejas
    console.log(`ℹ️  [${new Date().toISOString()}] Metrics available at /metrics endpoint`);
    console.log(`   Configure Grafana Cloud to scrape: https://crud-backend-1o29.onrender.com/metrics`);
    return true;
  }

  /**
   * Start pushing metrics at regular intervals
   * @param {number} intervalMs - Interval in milliseconds (default: 30000 = 30s)
   */
  startPushing(intervalMs = 30000) {
    if (!this.enabled) {
      console.log('⏭️  Skipping Grafana metrics push (not configured)');
      return;
    }

    console.log('='.repeat(50));
    console.log(`� Grafana Metrics Configuration`);
    console.log(`   Metrics endpoint: https://crud-backend-1o29.onrender.com/metrics`);
    console.log(`   Format: Prometheus OpenMetrics`);
    console.log(`   \n   ⚠️  Note: Remote Write push is disabled`);
    console.log(`   Reason: Requires Protobuf + Snappy (not supported in Node.js)`);
    console.log(`   \n   ✅ Solution: Configure Grafana Cloud data source to scrape /metrics`);
    console.log(`   Or use Grafana Agent for metric collection`);
    console.log('='.repeat(50));
  }
}

module.exports = GrafanaMetricsPusher;
