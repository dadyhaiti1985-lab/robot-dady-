/**
 * GET /api/user/balance
 *
 * Returns the real-time Coinbase account balance for the authenticated user.
 * - Credentials are fetched from PocketBase (oracle_credentials), decrypted
 *   server-side with AES-256-GCM, and NEVER returned to the client.
 * - Full user isolation: only the authenticated user's own credentials are used.
 * - Cached per-user for up to 15 seconds to avoid hammering Coinbase.
 */

import crypto from 'crypto';
import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import pb from '../utils/pbClient.js';
import logger from '../utils/logger.js';
import { buildCoinbaseHeaders, isCdpKey } from '../utils/coinbase-auth.js';

const router = Router();

// ── In-process balance cache (userId → { data, expiresAt }) ────────────────
const CACHE_TTL_MS = 15_000; // 15 s
const balanceCache = new Map();
// Negative cache for hard failures (bad creds) so we stop hammering Coinbase
const FAILURE_TTL_MS = 120_000; // 2 min
const failureCache = new Map();

function cacheFailure(userId, status, payload) {
  failureCache.set(userId, { status, payload, expiresAt: Date.now() + FAILURE_TTL_MS });
}

function getCached(userId) {
  const entry = balanceCache.get(userId);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}

function setCache(userId, data) {
  balanceCache.set(userId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── AES-256-GCM helpers (same scheme as oracle-trader-pro.js) ──────────────
function getEncryptionKey() {
  const secret = process.env.ORACLE_CREDENTIALS_ENCRYPTION_KEY;
  if (!secret) throw new Error('ORACLE_CREDENTIALS_ENCRYPTION_KEY is not set');
  return crypto.createHash('sha256').update(secret).digest();
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
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

// Auth headers are now handled by ../utils/coinbase-auth.js (dual CDP JWT + legacy HMAC)

/** Fetch USD exchange rate for a crypto symbol via Coinbase public API. */
async function getCryptoUSDRate(currency) {
  try {
    const res = await fetch(
      `https://api.coinbase.com/v2/exchange-rates?currency=${encodeURIComponent(currency)}`,
      { signal: AbortSignal.timeout(5_000) }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return parseFloat(data?.data?.rates?.USD ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Fetches ALL Coinbase accounts across all portfolios (handles pagination),
 * converts each asset to USD, and returns { total, available, currency, breakdown }.
 * Retries up to 3 times on network/5xx errors with exponential backoff.
 */
async function fetchCoinbaseBalance(apiKey, apiSecret) {
  const MAX_RETRIES = 3;
  let lastErr;

  /** Fetch one page of accounts, returning { accounts, cursor } */
  async function fetchAccountsPage(cursor, attempt) {
    let path = '/api/v3/brokerage/accounts?limit=250';
    if (cursor) path += `&cursor=${encodeURIComponent(cursor)}`;
    const url = `https://api.coinbase.com${path}`;
    const headers = buildCoinbaseHeaders(apiKey, apiSecret, 'GET', path);
    logger.info(`[user/balance] GET ${path} (attempt ${attempt}) auth=${isCdpKey(apiKey) ? 'CDP_JWT' : 'HMAC'}`);

    const res = await fetch(url, { method: 'GET', headers, signal: AbortSignal.timeout(10_000) });
    const body = await res.text().catch(() => '');
    logger.info(`[user/balance] Coinbase HTTP ${res.status} body[:300]: ${body.slice(0, 300)}`);

    if (!res.ok) {
      const err = { coinbaseStatus: res.status, message: `Coinbase API error: ${res.status} ${res.statusText}`, body };
      throw err;
    }
    const data = JSON.parse(body);
    return {
      accounts: Array.isArray(data.accounts) ? data.accounts : [],
      hasNext: !!data.has_next,
      cursor: data.cursor ?? null,
    };
  }

  // Collect all accounts with retry on network / 5xx
  let allAccounts = [];
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      allAccounts = [];
      let cursor = null;
      let hasNext = true;
      while (hasNext) {
        const page = await fetchAccountsPage(cursor, attempt);
        allAccounts.push(...page.accounts);
        hasNext = page.hasNext;
        cursor = page.cursor;
        if (!hasNext) break;
      }
      break; // success — exit retry loop
    } catch (fetchErr) {
      lastErr = fetchErr;
      const status = fetchErr?.coinbaseStatus ?? 0;
      // Don't retry auth errors
      if (status >= 400 && status < 500) throw fetchErr;
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      } else {
        throw lastErr;
      }
    }
  }

  logger.info(`[user/balance] Total accounts fetched: ${allAccounts.length}`);

  // Price cache so we don't hit exchange-rate API twice for same symbol
  const priceCache = {};
  async function getUSDRate(currency) {
    const sym = currency.toUpperCase();
    if (sym === 'USD' || sym === 'USDC' || sym === 'USDT') return 1;
    if (priceCache[sym] !== undefined) return priceCache[sym];
    const rate = await getCryptoUSDRate(sym);
    priceCache[sym] = rate;
    return rate;
  }

  let totalBalance = 0;
  let availableBalance = 0;
  const breakdown = [];

  for (const acct of allAccounts) {
    const curr = (acct.currency || '').toUpperCase();
    const avail = parseFloat(acct.available_balance?.value ?? 0);
    const hold  = parseFloat(acct.hold?.value ?? 0);
    const total = avail + hold;

    // Skip zero-balance accounts
    if (total <= 0) continue;

    const rate = await getUSDRate(curr);
    if (rate === 0) {
      logger.info(`[user/balance] Skipping ${curr} — no USD price available`);
      continue;
    }

    const totalUSD = total * rate;
    const availUSD = avail * rate;

    totalBalance     += totalUSD;
    availableBalance += availUSD;

    breakdown.push({
      account: acct.name || acct.uuid || curr,
      currency: curr,
      balance: parseFloat(total.toFixed(8)),
      availableBalance: parseFloat(avail.toFixed(8)),
      balanceInUSD: parseFloat(totalUSD.toFixed(2)),
    });
  }

  logger.info(`[user/balance] Aggregated: totalBalance=${totalBalance.toFixed(2)} availableBalance=${availableBalance.toFixed(2)} accounts=${breakdown.length}`);

  return {
    total: parseFloat(totalBalance.toFixed(2)),
    available: parseFloat(availableBalance.toFixed(2)),
    currency: 'USD',
    breakdown,
  };
}

// ── Route ──────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  logger.info(`[user/balance] Request from user ${userId}`);

  // Return cached data if fresh
  const cached = getCached(userId);
  if (cached) {
    logger.info(`[user/balance] Returning cached balance for user ${userId}`);
    return res.json({ success: true, cached: true, ...cached });
  }

  // Fetch encrypted credentials from PocketBase
  let record;
  try {
    record = await pb.collection('oracle_credentials').getFirstListItem(`owner = "${userId}"`);
  } catch (err) {
    if (err?.status === 404 || /No items found/i.test(err?.message || '')) {
      return res.status(400).json({
        success: false,
        error: 'API credentials not configured. Please add your Coinbase API keys in the dashboard.',
        code: 'NO_CREDENTIALS',
      });
    }
    logger.error(`[user/balance] PocketBase error for user ${userId}: ${err?.message}`);
    return res.status(503).json({
      success: false,
      error: 'Database service temporarily unavailable. Please try again.',
      code: 'PB_UNAVAILABLE',
    });
  }

  // Decrypt
  let apiKey, apiSecret;
  try {
    apiKey = decryptSecret(record.apiKeyCipher);
    apiSecret = decryptSecret(record.apiSecretCipher);
  } catch (err) {
    logger.error(`[user/balance] Decryption failed for user ${userId}: ${err?.message}`);
    return res.status(503).json({
      success: false,
      error: 'Credential decryption failed. Please re-enter your API keys.',
      code: 'DECRYPT_FAILED',
    });
  }

  if (!apiKey || !apiSecret) {
    return res.status(400).json({
      success: false,
      error: 'API credentials are incomplete. Please re-enter your API keys.',
      code: 'INCOMPLETE_CREDENTIALS',
    });
  }

  // ── Validate CDP private key format before attempting JWT generation ──────
  const keyType = isCdpKey(apiKey) ? 'CDP_JWT' : 'LEGACY_HMAC';
  if (keyType === 'CDP_JWT') {
    if (!apiSecret.includes('-----BEGIN') || !apiSecret.includes('-----END')) {
      logger.error(`[user/balance] Decrypted CDP key missing PEM headers for user ${userId}`);
      return res.status(400).json({
        success: false,
        error: 'Your stored API secret is not in valid PEM format. Please re-enter your Coinbase credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }
    try {
      const { createPrivateKey } = await import('crypto');
      const pkcs8Pem = apiSecret
        .replace('-----BEGIN EC PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----')
        .replace('-----END EC PRIVATE KEY-----', '-----END PRIVATE KEY-----');
      let parsed = false;
      for (const opts of [
        { key: apiSecret, format: 'pem' },
        { key: pkcs8Pem, format: 'pem', type: 'pkcs8' },
        { key: apiSecret, format: 'pem', type: 'sec1' },
      ]) {
        try { createPrivateKey(opts); parsed = true; break; } catch (_) { /* try next */ }
      }
      if (!parsed) throw new Error('All parse formats failed');
      logger.info(`[user/balance] CDP key pre-validated for user ${userId}`);
    } catch (err) {
      logger.error(`[user/balance] CDP key pre-validation failed for user ${userId}: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: 'Your stored API credentials appear corrupted. Please re-enter your Coinbase API credentials.',
        code: 'INVALID_CREDENTIALS',
        detail: err.message.slice(0, 200),
      });
    }
  }
  logger.info(`[user/balance] Credentials validated — keyType=${keyType} apiKey length=${apiKey.length} keyPrefix=${apiKey.slice(0,8)}...`);

  // Only Coinbase is supported for live balance; others return placeholder
  const exchange = (record.exchange || '').toLowerCase();
  if (exchange && !exchange.includes('coinbase')) {
    logger.info(`[user/balance] Exchange "${record.exchange}" — live balance fetch not yet supported; returning placeholder`);
    const placeholder = { balance: { total: 0, available: 0, currency: 'USD' }, exchange: record.exchange, live: false };
    setCache(userId, placeholder);
    return res.json({ success: true, cached: false, ...placeholder });
  }

  // Negative cache: if Coinbase recently rejected these creds, don't re-hit it
  const failEntry = failureCache.get(userId);
  if (failEntry && failEntry.expiresAt > Date.now()) {
    logger.info(`[user/balance] Returning cached failure for user ${userId} (${failEntry.payload.code})`);
    return res.status(200).json(failEntry.payload);
  }

  // Call Coinbase
  let balanceData;
  try {
    balanceData = await fetchCoinbaseBalance(apiKey, apiSecret);
    logger.info(`[user/balance] Coinbase balance fetched for user ${userId}: total=${balanceData.total} ${balanceData.currency}`);
  } catch (err) {
    const status = err.coinbaseStatus ?? 0;
    logger.error(`[user/balance] Coinbase call failed for user ${userId}: status=${status} message=${err?.message} body=${err?.body?.slice?.(0,200) ?? ''}`);
    if (status === 401 || status === 403) {
      const payload = {
        success: false,
        balance: 0,
        error: 'Coinbase rejected the API credentials. Please verify your API keys and permissions.',
        code: 'COINBASE_UNAUTHORIZED',
        message: 'Coinbase API keys are invalid or unconfigured. Please update your API Keys in Settings.',
        detail: err?.body?.slice?.(0, 200),
      };
      cacheFailure(userId, 200, payload);
      return res.status(200).json(payload);
    }
    if (status >= 400 && status < 500) {
      const payload = {
        success: false,
        balance: 0,
        error: `Coinbase returned error ${status}. Please check your API credentials.`,
        code: 'COINBASE_CLIENT_ERROR',
        message: 'Coinbase API error. Please verify your API keys in Settings.',
        detail: err?.body?.slice?.(0, 200),
      };
      cacheFailure(userId, 200, payload);
      return res.status(200).json(payload);
    }
    // Key parse failure is permanent — different code so frontend stops retrying
    const msg = err?.message || '';
    if (msg.includes('parse failed') || msg.includes('too long') || msg.includes('DER') || msg.includes('corrupted')) {
      return res.status(200).json({
        success: false,
        balance: 0,
        error: 'API secret appears corrupted. Please re-enter your Coinbase API credentials.',
        code: 'CDP_KEY_PARSE_FAILED',
        message: 'API secret appears corrupted. Please re-enter your Coinbase API credentials in Settings.',
        detail: msg.slice(0, 200),
      });
    }
    return res.status(200).json({
      success: false,
      balance: 0,
      error: 'Unable to reach Coinbase at this moment. Please try again shortly.',
      code: 'COINBASE_UNAVAILABLE',
      message: 'Coinbase API is unavailable. Please try again in a few moments.',
      detail: msg,
    });
  }

  const responseData = {
    balance: {
      total: balanceData.total,
      available: balanceData.available,
      totalBalance: balanceData.total,
      availableBalance: balanceData.available,
      currency: balanceData.currency,
      breakdown: balanceData.breakdown ?? [],
      fetchedAt: new Date().toISOString(),
    },
    exchange: record.exchange,
    live: true,
  };

  setCache(userId, responseData);
  failureCache.delete(userId);

  return res.json({ success: true, cached: false, ...responseData });
});

export default router;
