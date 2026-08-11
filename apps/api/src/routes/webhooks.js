/**
 * POST /webhooks/coinbase
 *
 * Receives Coinbase CDP webhook events, verifies the HMAC-SHA256 signature,
 * then persists relevant events (trade fills, balance updates) to PocketBase.
 *
 * Coinbase expects an HTTP 200 response within a few seconds — we respond
 * immediately and process the payload in the same synchronous tick (no async
 * queue needed at this scale).
 */

import crypto from 'crypto';
import { Router } from 'express';
import pb from '../utils/pbClient.js';
import logger from '../utils/logger.js';

const router = Router();

const WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;

// ── Signature verification ────────────────────────────────────────────────
function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) {
    logger.warn('[webhook] COINBASE_WEBHOOK_SECRET not set — skipping signature check');
    return true; // allow through so events still work before secret is configured
  }
  if (!signature || typeof signature !== 'string') return false;
  const computed = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (computed.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
}

// ── Event handlers ────────────────────────────────────────────────────────

/**
 * 'trading.order.filled'
 * Upserts a trade record into `botTrades` and logs the fill.
 */
async function handleOrderFilled(data) {
  logger.info(`[webhook] order.filled: orderId=${data?.order_id} symbol=${data?.product_id} side=${data?.side}`);
  try {
    await pb.collection('botTrades').create({
      userId: data?.user_id || 'webhook',
      symbol: data?.product_id || 'UNKNOWN',
      side: (data?.side || 'BUY').toUpperCase(),
      quantity: Number(data?.filled_size || 0),
      price: Number(data?.average_filled_price || data?.price || 0),
      entryPrice: Number(data?.average_filled_price || data?.price || 0),
      orderId: data?.order_id || '',
    });
    logger.info(`[webhook] trade record created for orderId=${data?.order_id}`);
  } catch (err) {
    logger.error(`[webhook] failed to save trade: ${err?.message}`);
  }
}

/**
 * 'wallet.account.updated'
 * Updates (or creates) the user's balance record in `bot_account_balance`.
 */
async function handleAccountUpdated(data) {
  const userId = data?.user_id;
  const currency = (data?.currency || 'USD').toUpperCase();
  const total = Number(data?.balance || data?.amount || 0);
  const available = Number(data?.available_balance || data?.balance || 0);
  logger.info(`[webhook] wallet.account.updated: userId=${userId} currency=${currency} total=${total}`);

  if (!userId) {
    logger.warn('[webhook] wallet.account.updated event missing user_id — skipping DB write');
    return;
  }

  try {
    let existing = null;
    try {
      existing = await pb.collection('bot_account_balance').getFirstListItem(`userId = "${userId}"`);
    } catch (_) {
      // no record yet
    }

    const payload = { userId, currency, total, available, hold: Math.max(0, total - available) };

    if (existing) {
      await pb.collection('bot_account_balance').update(existing.id, payload);
    } else {
      await pb.collection('bot_account_balance').create(payload);
    }
    logger.info(`[webhook] balance updated for userId=${userId}: ${currency} ${total}`);
  } catch (err) {
    logger.error(`[webhook] failed to update balance: ${err?.message}`);
  }
}

// ── Route ─────────────────────────────────────────────────────────────────

// main.js stores raw bytes via express.json({ verify }) into req.rawBody.
router.post(
  '/coinbase',
  async (req, res) => {
    // req.rawBody is populated by the verify callback in main.js
    const rawBody = req.rawBody;
    const signature = req.headers['x-cc-webhook-signature'] || '';

    // ── 1. Verify signature ──────────────────────────────────────────────
    if (!verifySignature(rawBody, signature)) {
      logger.error('[webhook] Invalid signature — request rejected');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // ── 2. Parse payload ─────────────────────────────────────────────────
    let event;
    try {
      const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody);
      event = typeof rawBody === 'object' && !Buffer.isBuffer(rawBody)
        ? rawBody
        : JSON.parse(bodyStr);
    } catch (err) {
      logger.error(`[webhook] JSON parse error: ${err?.message}`);
      return res.status(400).json({ error: `Parse error: ${err.message}` });
    }

    logger.info(`[webhook] event received: type=${event?.type}`);

    // ── 3. Respond 200 immediately (Coinbase requirement) ─────────────────
    res.status(200).json({ received: true });

    // ── 4. Process event (fire-and-forget after 200 sent) ────────────────
    const eventType = event?.type || '';
    const data = event?.data || {};

    switch (eventType) {
      case 'trading.order.filled':
        await handleOrderFilled(data).catch((e) =>
          logger.error(`[webhook] handleOrderFilled error: ${e?.message}`),
        );
        break;

      case 'wallet.account.updated':
        await handleAccountUpdated(data).catch((e) =>
          logger.error(`[webhook] handleAccountUpdated error: ${e?.message}`),
        );
        break;

      default:
        logger.info(`[webhook] unhandled event type: ${eventType}`);
    }
  },
);

export default router;
