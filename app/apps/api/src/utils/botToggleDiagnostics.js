/**
 * BotToggleDiagnostics — server-side diagnostic checks for bot toggle failures.
 */
import logger from './logger.js';

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';

export class BotToggleDiagnostics {
  async diagnoseToggleFailure() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      checks: {},
    };

    diagnostics.checks.pocketbase = await this.checkPocketBase();
    diagnostics.checks.environment = this.checkEnvironmentVariables();
    diagnostics.checks.network = await this.checkNetworkConnectivity();

    const allOk = Object.values(diagnostics.checks).every(c => c.status === 'OK');
    diagnostics.overall = allOk ? 'OK' : 'DEGRADED';

    logger.info('[BotToggleDiagnostics]', JSON.stringify(diagnostics));
    return diagnostics;
  }

  async checkPocketBase() {
    try {
      const res = await fetch(`${POCKETBASE_URL}/api/health`);
      if (res.ok) return { status: 'OK', message: 'PocketBase connected' };
      return { status: 'FAILED', message: `PocketBase returned ${res.status}` };
    } catch (err) {
      return { status: 'FAILED', message: err.message };
    }
  }

  checkEnvironmentVariables() {
    const required = ['POCKETBASE_URL', 'ENCRYPTION_KEY'];
    const missing = required.filter(v => !process.env[v]);
    return {
      status: missing.length === 0 ? 'OK' : 'DEGRADED',
      missing,
      message: missing.length === 0 ? 'All env vars present' : `Missing: ${missing.join(', ')}`,
    };
  }

  async checkNetworkConnectivity() {
    try {
      const res = await fetch('https://www.google.com', { method: 'HEAD', signal: AbortSignal.timeout(3000) });
      return { status: res.ok ? 'OK' : 'FAILED', message: 'Network reachable' };
    } catch (err) {
      return { status: 'FAILED', message: err.message };
    }
  }
}

export default BotToggleDiagnostics;
