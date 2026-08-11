/**
 * AI Signals Route
 * GET  /api/ai-signals         — list signals + bot stats
 * POST /api/ai-signals/execute — execute a single trade signal
 */
import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { executeTradeSignal, getBotStats } from '../controllers/bot-execution.js';
import pb from '../utils/pbClient.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /api/ai-signals
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user?.id;
  try {
    let botActive = false;
    try {
      const config = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);
      botActive = Boolean(config?.isActive);
    } catch (_) {
      // No config means bot not started
    }

    if (!botActive) {
      return res.json({ success: true, signals: [], botActive: false, message: 'Bot is not active' });
    }

    const stats = await getBotStats(userId);
    return res.json({ success: true, signals: [], botActive: true, stats });
  } catch (error) {
    logger.error('[AISignals] GET error:', error?.message);
    return res.json({ success: false, code: 'SIGNALS_ERROR', message: 'Failed to get signals' });
  }
});

// POST /api/ai-signals/execute
router.post('/execute', authMiddleware, async (req, res) => {
  const userId = req.user?.id;
  const { signal } = req.body || {};

  if (!signal) {
    return res.status(400).json({ success: false, code: 'INVALID_SIGNAL', message: 'Signal is required' });
  }

  try {
    const result = await executeTradeSignal(userId, signal);
    if (!result.success) {
      return res.json({ success: false, code: result.code, message: result.reason });
    }
    return res.json({ success: true, message: result.message, orderId: result.orderId });
  } catch (error) {
    logger.error('[AISignals] execute error:', error?.message);
    return res.json({ success: false, code: 'EXECUTION_ERROR', message: 'Failed to execute signal' });
  }
});

export default router;
