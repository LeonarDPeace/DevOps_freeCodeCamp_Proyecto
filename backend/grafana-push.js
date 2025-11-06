const axios = require('axios');

/**
 * Grafana Cloud Metrics Pusher
 * Push Prometheus metrics to Grafana Cloud Remote Write endpoint
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
   */
  async push() {
    if (!this.enabled) {
      return;
    }

    try {
      const metrics = await this.register.metrics();
      
      const response = await axios.post(
        this.config.url,
        metrics,
        {
          auth: {
            username: this.config.username,
            password: this.config.password
          },
          headers: {
            'Content-Type': 'application/openmetrics-text; version=1.0.0; charset=utf-8'
          },
          timeout: 5000 // 5 segundos timeout
        }
      );
      
      console.log(`✅ [${new Date().toISOString()}] Metrics pushed to Grafana Cloud (${response.status})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to push metrics to Grafana: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
      return false;
    }
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
    console.log(`🚀 Grafana Cloud Metrics Push enabled`);
    console.log(`   URL: ${this.config.url}`);
    console.log(`   Username: ${this.config.username}`);
    console.log(`   Interval: ${intervalMs / 1000}s`);
    console.log('='.repeat(50));

    // Push inmediato al iniciar
    this.push();
    
    // Programar pushes periódicos
    setInterval(() => {
      this.push();
    }, intervalMs);
  }
}

module.exports = GrafanaMetricsPusher;
