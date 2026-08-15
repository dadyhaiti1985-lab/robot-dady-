/**
 * POST /api/bot/toggle
 *
 * Dedicated endpoint to toggle the trading bot ON or OFF.
 * Fully independent of Coinbase credentials / balance — updating bot state
 * never requires a working Coinbase connection.
 */
import { Router } from 'express';
import logger from '../utils/logger.js';
import authMiddleware from '../middleware/auth.js';
import pb from '../utils/pbClient.js';
import { clearAllSignalStates } from '../services/signal-state.js';

const router = Router();

const DEFAULT_CONFIG = {
  symbol: 'BTC-USD',
  strategy: 'EMA_RSI',
  stopLoss: 2,
  takeProfit: 5,
};

router.post('/', authMiddleware, async (req, res) => {
  try {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Session expired. Please log in again.', code: 'NO_USER' });
  }

  // Accept: { botActive: bool } OR { isActive: bool } OR { status: 'ACTIVE'|'INACTIVE' }
  let isActive;
  if (typeof req.body?.botActive === 'boolean') {
    isActive = req.body.botActive;
  } else if (typeof req.body?.isActive === 'boolean') {
    isActive = req.body.isActive;
  } else if (typeof req.body?.status === 'string') {
    const s = req.body.status.trim().toUpperCase();
    if (s !== 'ACTIVE' && s !== 'INACTIVE') {
      return res.status(400).json({ success: false, error: "status must be 'ACTIVE' or 'INACTIVE'", code: 'INVALID_STATUS' });
    }
    isActive = s === 'ACTIVE';
  } else {
    return res.status(400).json({ success: false, error: 'Request must include botActive (boolean) or status string', code: 'INVALID_BODY' });
  }

  logger.info(`[BOT_TOGGLE] User: ${userId}, Requested: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);

  // Check if API credentials are configured before attempting to start bot
  if (isActive) {
    try {
      const creds = await pb.collection('oracle_credentials').getFirstListItem(`owner = "${userId}"`);
      if (!creds || !creds.apiKeyCipher) {
        return res.status(400).json({
          success: false,
          code: 'NO_CREDENTIALS',
          error: 'API credentials not configured. Please add your Coinbase API keys in Settings before starting the bot.',
        });
      }
    } catch (credErr) {
      const is404 =
        credErr?.status === 404 ||
        String(credErr?.message || '').toLowerCase().includes('not found') ||
        String(credErr?.message || '').includes('No items found');
      if (is404) {
        return res.status(400).json({
          success: false,
          code: 'NO_CREDENTIALS',
          error: 'API credentials not configured. Please add your Coinbase API keys in Settings before starting the bot.',
        });
      }
      logger.error(`[BOT_TOGGLE] Credential lookup failed for ${userId}: ${credErr?.message}`);
      return res.status(503).json({ success: false, error: 'Credential service unavailable. Please try again.', code: 'PB_UNAVAILABLE' });
    }
  }

  let config = null;
  try {
    config = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);
  } catch (lookupErr) {
    const is404 =
      lookupErr?.status === 404 ||
      String(lookupErr?.message || '').toLowerCase().includes('not found') ||
      String(lookupErr?.message || '').includes('No items found');
    if (!is404) {
      logger.error(`[BOT_TOGGLE] PB lookup failed for ${userId}: ${lookupErr?.message}`);
      return res.status(503).json({ success: false, error: 'Bot configuration service unavailable. Please try again.', code: 'PB_UNAVAILABLE' });
    }
  }

  let saved;
  try {
    if (config) {
      saved = await pb.collection('botConfig').update(config.id, { isActive });
    } else {
      saved = await pb.collection('botConfig').create({
        userId,
        ...DEFAULT_CONFIG,
        isActive,
      });
    }
  } catch (saveErr) {
    logger.error(`[BOT_TOGGLE] DB save failed for ${userId}: ${saveErr?.message}`);
    return res.status(503).json({ success: false, error: 'Failed to save bot status. Please try again.', code: 'PB_SAVE_FAILED' });
  }

  const newStatus = Boolean(saved?.isActive);

  // Clear in-memory signal states when bot deactivates
  if (!newStatus) {
    clearAllSignalStates();
    logger.info(`[BOT_TOGGLE] Signal states cleared for user ${userId}`);
  }

  logger.info(`[BOT_TOGGLE] User: ${userId}, Result: ${newStatus ? 'ACTIVE' : 'INACTIVE'} — SUCCESS`);

  return res.json({
    success: true,
    botActive: newStatus,
    isActive: newStatus,
    botStatus: newStatus ? 'ACTIVE' : 'INACTIVE',
    message: newStatus ? 'Trading bot started successfully' : 'Trading bot stopped successfully',
    symbol: saved?.symbol || DEFAULT_CONFIG.symbol,
    strategy: saved?.strategy || DEFAULT_CONFIG.strategy,
    timestamp: new Date().toISOString(),
  });
  } catch (unexpectedErr) {
    logger.error(`[BOT_TOGGLE] Unexpected error: ${unexpectedErr?.message}`);
    return res.status(200).json({ success: false, error: 'An unexpected error occurred. Please try again.', code: 'BOT_TOGGLE_ERROR' });
  }
});

export default router;
