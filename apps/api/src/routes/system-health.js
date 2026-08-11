/**
 * GET /system-health — comprehensive health check for the AI agent and bot toggle.
 */
import { AIAgentHealthCheck } from '../utils/aiAgentHealthCheck.js';

export default async (req, res) => {
  const healthCheck = new AIAgentHealthCheck();
  const health = await healthCheck.checkHealth();
  const statusCode = health.status === 'HEALTHY' ? 200 : 503;
  res.status(statusCode).json(health);
};
