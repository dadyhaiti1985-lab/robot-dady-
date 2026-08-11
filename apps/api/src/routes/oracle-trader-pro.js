import { Router } from 'express';
import crypto from 'node:crypto';
import authMiddleware from '../middleware/auth.js';
import pb from '../utils/pbClient.js';
import logger from '../utils/logger.js';
import * as coinbase from '../utils/coinbase.js';
import { executeTradeSignal } from '../controllers/bot-execution.js';
import { getOpenPositionsForPair } from '../services/order-manager.js';
import { hasTierByTitle } from '../utils/ecommerce-subscriptions.js';
import { isConnectionError } from '../utils/pbClient.js';

const router = Router();

// Every route on this router requires a signed-in user.
router.use(authMiddleware);

const SUBSCRIPTION_TITLE = 'ORACLE-TRADER-PRO';
// Admin bypass: this account is granted full access without an active subscription.
const ADMIN_EMAILS = ['meahunlimitedgroupe@gmail.com', 'dadyhaiti1985@gmail.com'];

async function hasAccess(req) {
  if (req.user?.email && ADMIN_EMAILS.includes(String(req.user.email).toLowerCase())) return true;
  try {
    return await hasTierByTitle(req.user.id, SUBSCRIPTION_TITLE);
  } catch (error) {
    // Store lookup failure must not become a 500 — treat as "no access".
    logger.error(`[oracle] subscription lookup failed for user ${req.user?.id}:`, error?.message || error);
    return false;
  }
}

/** Maps a PocketBase failure to a clear status instead of a generic 500. */
function pocketbaseFailure(res, error, context) {
  logger.error(`[oracle] ${context} failed:`, error?.message || error, error?.stack);
  if (isConnectionError(error)) {
    return res.status(503).json({
      error: 'Database service is temporarily unavailable. Please retry in a moment.',
      code: 'PB_UNAVAILABLE',
    });
  }
  if (error?.status === 400) {
    return res.status(400).json({ error: error.message || 'Invalid data', code: 'PB_VALIDATION' });
  }
  if (error?.status === 403) {
    return res.status(403).json({ error: 'Forbidden', code: 'PB_FORBIDDEN' });
  }
  return res.status(502).json({ error: 'Storage backend error. Please retry.', code: 'PB_ERROR' });
}

function normalizeSymbol(symbol) {
  return String(symbol || '').trim().replace(/[\s/]+/g, '-').replace(/_+/g, '-').toUpperCase();
}

router.get('/candles', async (req, res) => {
  const symbol = normalizeSymbol(req.query.symbol || 'BTC-USD');
  const interval = Number(req.query.interval || 300);
  const limit = Math.min(Math.max(Number(req.query.limit || 48), 12), 200);

  if (!/^[A-Z0-9]+-[A-Z0-9]+$/.test(symbol)) {
    return res.status(400).json({ error: 'Invalid symbol', code: 'INVALID_SYMBOL' });
  }

  try {
    const candles = await coinbase.getCandles(symbol, interval, limit);
    const normalized = (Array.isArray(candles) ? candles : [])
      .map((c) => {
        if (Array.isArray(c)) {
          return {
            timestamp: c[0],
            open: Number(c[1]),
            high: Number(c[2]),
            low: Number(c[3]),
            close: Number(c[4]),
            volume: Number(c[5]),
          };
        }
        return {
          timestamp: Number(c.timestamp || c.time || 0),
          open: Number(c.open || 0),
          high: Number(c.high || 0),
          low: Number(c.low || 0),
          close: Number(c.close || 0),
          volume: Number(c.volume || 0),
          sma: Number(c.sma || 0),
          rsi: Number(c.rsi || 0),
        };
      })
      .map((c) => ({
        ...c,
        t: new Date((c.timestamp || Date.now()) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wick: [c.low, c.high],
        up: Number(c.close) >= Number(c.open),
      }));
    return res.json(normalized);
  } catch (error) {
    logger.error('[oracle] GET /candles failed:', error?.message || error);
    return res.status(502).json({ error: 'Failed to fetch market candles.', code: 'CANDLES_ERROR' });
  }
});

router.post('/trades', async (req, res) => {
  const signal = req.body?.signal || req.body;
  if (!signal || typeof signal !== 'object') {
    return res.status(400).json({ success: false, code: 'INVALID_SIGNAL', message: 'Trade signal is required.' });
  }

  try {
    const result = await executeTradeSignal(req.user.id, signal);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error) {
    logger.error('[oracle] POST /trades failed:', error?.message || error);
    return res.status(502).json({ success: false, code: 'EXECUTION_ERROR', message: 'Failed to execute trade.' });
  }
});

router.get('/positions', async (req, res) => {
  const symbol = req.query.symbol ? normalizeSymbol(req.query.symbol) : null;

  try {
    const positions = await getOpenPositionsForPair(req.user.id, symbol);
    return res.json(
      positions.map((pos) => ({
        id: pos.id,
        pair: pos.pair,
        side: pos.side,
        quantity: Number(pos.quantity || 0),
        price: Number(pos.price || 0),
        orderType: pos.orderType,
        status: pos.status,
        entryPrice: Number(pos.entryPrice || 0),
        stopLoss: Number(pos.stopLoss || 0),
        takeProfit: Number(pos.takeProfit || 0),
        externalOrderId: pos.externalOrderId,
        created: pos.created,
        updated: pos.updated,
      })),
    );
  } catch (error) {
    return pocketbaseFailure(res, error, 'GET /positions');
  }
});

function getEncryptionKey() {
  const secret = process.env.ORACLE_CREDENTIALS_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('ORACLE_CREDENTIALS_ENCRYPTION_KEY is not set in apps/api/.env');
  }
  // Derive a stable 32-byte key regardless of the configured secret's length.
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptSecret(plainText) {
  if (!plainText) return null;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store iv + authTag + ciphertext together, base64-encoded.
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decryptSecret(cipherBlob) {
  if (!cipherBlob) return null;
  const key = getEncryptionKey();
  const raw = Buffer.from(cipherBlob, 'base64');
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

function maskSecret(plainText) {
  if (!plainText || plainText.length < 4) return '****';
  return `${'*'.repeat(Math.max(0, plainText.length - 4))}${plainText.slice(-4)}`;
}

/**
 * GET /oracle-trader-pro/subscription
 * Verifies the caller's ORACLE-TRADER-PRO subscription status.
 * Never returns admin/platform credentials — only a boolean + plan info.
 */
router.get('/subscription', async (req, res) => {
  const active = await hasAccess(req);
  res.json({
    has_active_subscription: active,
    plan: SUBSCRIPTION_TITLE,
    price: '$35/mo',
    pricing_url: '/plans',
  });
});

/**
 * GET /oracle-trader-pro/credentials
 * Read-only: allowed for ANY authenticated user (even without an active
 * subscription) so the dashboard can render in read-only mode. Only the
 * POST endpoint below (writing new credentials) requires a subscription.
 * Returns whether the user has connected an exchange, plus masked (never raw)
 * key/secret previews and their risk parameters.
 */
router.get('/credentials', async (req, res) => {
  try {
    const record = await pb.collection('oracle_credentials').getFirstListItem(`owner = "${req.user.id}"`);
    return res.json({
      connected: true,
      exchange: record.exchange,
      apiKeyPreview: maskSecret(decryptSecret(record.apiKeyCipher)),
      apiSecretPreview: maskSecret(decryptSecret(record.apiSecretCipher)),
      maxRiskPercent: record.maxRiskPercent,
      stopLossPercent: record.stopLossPercent,
      takeProfitPercent: record.takeProfitPercent,
      updated: record.updated,
    });
  } catch (error) {
    if (error.status === 404 || /No items found/.test(error.message || '')) {
      return res.json({ connected: false });
    }
    return pocketbaseFailure(res, error, 'GET /credentials');
  }
});

/**
 * POST /oracle-trader-pro/credentials
 * Body: { exchange, apiKey, apiSecret, maxRiskPercent, stopLossPercent, takeProfitPercent }
 * Encrypts apiKey/apiSecret before writing to PocketBase (never stored/logged in plaintext).
 */
router.post('/credentials', async (req, res) => {
  // Credentials can be saved by any authenticated user — subscription is required
  // only to activate the trading bot, not to store API keys.

  const { exchange, apiKey, apiSecret, maxRiskPercent, stopLossPercent, takeProfitPercent } = req.body ?? {};

  const trimmedExchange = typeof exchange === 'string' ? exchange.trim() : '';
  const trimmedApiKey = typeof apiKey === 'string' ? apiKey.trim() : '';
  const trimmedApiSecret = typeof apiSecret === 'string' ? apiSecret.trim() : '';

  // ── Input validation ──────────────────────────────────────────────────────
  if (!trimmedExchange) {
    return res.status(400).json({ success: false, code: 'INVALID_INPUT', message: 'exchange is required.' });
  }
  if (!trimmedApiKey || !trimmedApiSecret) {
    return res.status(400).json({ success: false, code: 'INVALID_INPUT', message: 'API key and private key are required.' });
  }

  // ── Format validation (Coinbase CDP keys) ─────────────────────────────────
  if (!trimmedApiKey.includes('organizations/')) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_API_KEY_FORMAT',
      message: 'API key format is invalid. It should start with "organizations/".',
    });
  }
  if (!trimmedApiSecret.includes('BEGIN') || !trimmedApiSecret.includes('END')) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_PRIVATE_KEY_FORMAT',
      message: 'Private key format is invalid. It should be in PEM format with BEGIN/END headers.',
    });
  }

  if (!process.env.ORACLE_CREDENTIALS_ENCRYPTION_KEY) {
    logger.error('[oracle] ORACLE_CREDENTIALS_ENCRYPTION_KEY is not set in apps/api/.env');
    return res.status(503).json({
      success: false,
      code: 'ENCRYPTION_KEY_MISSING',
      message: 'Credential encryption is not configured on the server.',
    });
  }

  // ── Encrypt ───────────────────────────────────────────────────────────────
  let apiKeyCipher, apiSecretCipher;
  try {
    apiKeyCipher = encryptSecret(trimmedApiKey);
    apiSecretCipher = encryptSecret(trimmedApiSecret);
  } catch (encErr) {
    logger.error('[oracle] encryption failed:', encErr?.message || encErr);
    return res.status(400).json({ success: false, code: 'ENCRYPTION_ERROR', message: 'Failed to encrypt credentials. Please try again.' });
  }

  const payload = {
    owner: req.user.id,
    exchange: trimmedExchange,
    apiKeyCipher,
    apiSecretCipher,
    ...(maxRiskPercent !== undefined && { maxRiskPercent }),
    ...(stopLossPercent !== undefined && { stopLossPercent }),
    ...(takeProfitPercent !== undefined && { takeProfitPercent }),
  };

  // ── Upsert ────────────────────────────────────────────────────────────────
  try {
    let record;
    let isUpdate = false;

    try {
      const existing = await pb.collection('oracle_credentials').getFirstListItem(`owner = "${req.user.id}"`);
      record = await pb.collection('oracle_credentials').update(existing.id, payload);
      isUpdate = true;
      logger.info(`[oracle] credentials updated for user ${req.user.id}`);
    } catch (lookupErr) {
      if (lookupErr.status === 404 || /No items found/i.test(lookupErr.message || '')) {
        record = await pb.collection('oracle_credentials').create(payload);
        logger.info(`[oracle] credentials created for user ${req.user.id}`);
      } else {
        throw lookupErr;
      }
    }

    // ── Verify the record was persisted ──────────────────────────────────
    if (!record || !record.id) {
      logger.error('[oracle] saved record missing id');
      return res.status(500).json({ success: false, code: 'SAVE_VERIFICATION_FAILED', message: 'Credentials were not saved properly. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      code: 'CREDENTIALS_SAVED',
      connected: true,
      message: 'API keys configured successfully!',
      redirect: '/dashboard',
      data: {
        id: record.id,
        platform: trimmedExchange,
        status: 'active',
        updated: isUpdate,
        savedAt: new Date().toISOString(),
      },
      // Legacy fields kept for compatibility with existing frontend consumers
      exchange: record.exchange,
      apiKeyPreview: maskSecret(trimmedApiKey),
      apiSecretPreview: maskSecret(trimmedApiSecret),
      maxRiskPercent: record.maxRiskPercent,
      stopLossPercent: record.stopLossPercent,
      takeProfitPercent: record.takeProfitPercent,
    });
  } catch (error) {
    logger.error('[oracle] POST /credentials db error:', error?.message || error, error?.status);
    const msg = error?.message || '';
    if (/duplicate/i.test(msg)) {
      return res.status(400).json({ success: false, code: 'DUPLICATE_RECORD', message: 'Credentials already exist. Please update instead of creating new ones.' });
    }
    if (/permission/i.test(msg) || error?.status === 403) {
      return res.status(403).json({ success: false, code: 'PERMISSION_DENIED', message: 'You do not have permission to save credentials.' });
    }
    if (error?.status === 400) {
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: error.message || 'Invalid data format. Please check your input.' });
    }
    return res.status(400).json({ success: false, code: 'SAVE_ERROR', message: `Failed to save credentials: ${msg || 'unexpected error'}` });
  }
});

/**
 * GET /oracle-trader-pro/trades
 * Read-only: allowed for ANY authenticated user (even without an active
 * subscription) so the dashboard can render in read-only mode. Returns ONLY
 * the authenticated user's own trades (isolated per user via the `userId`
 * field on the `trades` collection + PocketBase access rules).
 */
router.get('/trades', async (req, res) => {
  let trades;
  try {
    trades = await pb.collection('trades').getList(1, 50, {
      filter: `userId = "${req.user.id}"`,
      sort: '-created',
    });
  } catch (error) {
    return pocketbaseFailure(res, error, 'GET /trades');
  }

  return res.json(
    trades.items.map((t) => ({
      id: t.id,
      asset: t.asset,
      type: t.type,
      amount: t.amount,
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice,
      status: t.status,
      pnl: t.pnl,
      timestamp: t.timestamp,
    })),
  );
});

export default router;
