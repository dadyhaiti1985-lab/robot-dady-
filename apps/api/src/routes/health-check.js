import logger from '../utils/logger.js';

export default async (req, res) => {
  logger.debug('Health check endpoint called');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};