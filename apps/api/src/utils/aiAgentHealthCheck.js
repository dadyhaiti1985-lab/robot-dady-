/**
 * AIAgentHealthCheck — verifies all services the AI agent depends on.
 */
import logger from './logger.js';

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';

export class AIAgentHealthCheck {
  async checkHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'HEALTHY',
      services: {},
    };

    health.services.pocketbase = await this.checkPocketBase();
    health.services.integratedAi = await this.checkIntegratedAiRoute();
    health.services.configuration = this.checkConfiguration();

    const allHealthy = Object.values(health.services).every(s => s.status === 'HEALTHY');
    health.status = allHealthy ? 'HEALTHY' : 'DEGRADED';

    logger.info('[AIAgentHealthCheck] status=' + health.status);
    return health;
  }

  async checkPocketBase() {
    try {
      const res = await fetch(`${POCKETBASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
      return {
        status: res.ok ? 'HEALTHY' : 'UNHEALTHY',
        message: res.ok ? 'PocketBase connected' : `Status ${res.status}`,
      };
    } catch (err) {
      return { status: 'UNHEALTHY', error: err.message };
    }
  }

  async checkIntegratedAiRoute() {
    // The integrated-ai route is internal — just verify Express is running
    try {
      const res = await fetch('http://localhost:3001/health', { signal: AbortSignal.timeout(2000) });
      return { status: res.ok ? 'HEALTHY' : 'UNHEALTHY', message: 'API server reachable' };
    } catch (err) {
      return { status: 'UNHEALTHY', error: err.message };
    }
  }

  checkConfiguration() {
    const optional = ['POCKETBASE_URL', 'ENCRYPTION_KEY'];
    const missing = optional.filter(v => !process.env[v]);
    return {
      status: 'HEALTHY', // these have defaults
      missing,
      message: missing.length ? `Using defaults for: ${missing.join(', ')}` : 'All config present',
    };
  }
}

export default AIAgentHealthCheck;
