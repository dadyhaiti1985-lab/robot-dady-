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

async function fetchCoinbaseJson(apiKey, apiSecret, path, logLabel) {
  const url = `https://api.coinbase.com${path}`;
  const headers = buildCoinbaseHeaders(apiKey, apiSecret, 'GET', path);
  logger.info(`[user/balance] GET ${path} auth=${isCdpKey(apiKey) ? 'CDP_JWT' : 'HMAC'} ${logLabel ? `(${logLabel})` : ''}`);

  const res = await fetch(url, { method: 'GET', headers, signal: AbortSignal.timeout(10_000) });
  const body = await res.text().catch(() => '');

  if (!res.ok) {
    const err = { coinbaseStatus: res.status, message: `Coinbase API error: ${res.status} ${res.statusText}`, body };
    throw err;
  }

  return body ? JSON.parse(body) : {};
}

function normalizePortfolioList(payload) {
  const portfolios = Array.isArray(payload?.portfolios)
    ? payload.portfolios
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

  return portfolios.map((portfolio, index) => ({
    id: portfolio.uuid || portfolio.portfolio_uuid || portfolio.id || `portfolio-${index}`,
    name: portfolio.name || portfolio.display_name || portfolio.portfolio_name || `Portfolio ${index + 1}`,
    isDefault: Boolean(portfolio.default || portfolio.is_default || portfolio.isDefault),
    type: portfolio.type || portfolio.portfolio_type || 'spot',
  }));
}

async function fetchCoinbasePortfolios(apiKey, apiSecret) {
  try {
    const payload = await fetchCoinbaseJson(apiKey, apiSecret, '/api/v3/brokerage/portfolios', 'portfolios');
    return normalizePortfolioList(payload);
  } catch (error) {
    logger.warn(`[user/balance] Portfolio list unavailable: ${error?.message || error}`);
    return [];
  }
}

async function fetchCoinbaseOpenOrders(apiKey, apiSecret) {
  try {
    const payload = await fetchCoinbaseJson(apiKey, apiSecret, '/api/v3/brokerage/orders/historical/batch?order_status=OPEN&limit=250', 'open-orders');
    const orders = Array.isArray(payload?.orders)
      ? payload.orders
      : Array.isArray(payload?.sequence)
        ? payload.sequence
        : Array.isArray(payload)
          ? payload
          : [];

    return {
      total: orders.length,
      buy: orders.filter((order) => String(order.side || order.order_side || '').toUpperCase() === 'BUY').length,
      sell: orders.filter((order) => String(order.side || order.order_side || '').toUpperCase() === 'SELL').length,
    };
  } catch (error) {
    logger.warn(`[user/balance] Open order summary unavailable: ${error?.message || error}`);
    return { total: 0, buy: 0, sell: 0 };
  }
}

async function getStoredBalanceChange(userId) {
  try {
    const rec = await pb.collection('bot_account_balance').getFirstListItem(`userId = "${userId}"`, { sort: '-created' });
    return Number(rec?.last_24h_change ?? 0);
  } catch {
    return 0;
  }
}

function buildPortfolioSnapshot({ accounts, rates, portfolios, openOrders, change24h }) {
  const portfolioMap = new Map(portfolios.map((portfolio) => [portfolio.id, portfolio]));
  const fallbackPortfolios = new Map();
  const treasury = [];
  const cryptoAssets = [];

  const totalsByPortfolio = new Map();
  let derivativeExposure = 0;
  let equitiesExposure = 0;
  let predictionExposure = 0;

  for (const account of accounts) {
    const currency = String(account.currency || '').toUpperCase();
    const available = Number(account.available_balance?.value ?? 0);
    const hold = Number(account.hold?.value ?? 0);
    const quantity = available + hold;
    if (quantity <= 0) continue;

    const currentPrice = currency === 'USD' || currency === 'USDC' || currency === 'USDT'
      ? 1
      : Number(rates[currency] ?? 0);
    if (!currentPrice) continue;

    const balanceUsd = Number((quantity * currentPrice).toFixed(2));
    const availableUsd = Number((available * currentPrice).toFixed(2));
    const allocation = 0;

    const portfolioId = account.retail_portfolio_id || account.portfolio_uuid || account.account_uuid || 'principal';
    if (!portfolioMap.has(portfolioId) && !fallbackPortfolios.has(portfolioId)) {
      fallbackPortfolios.set(portfolioId, {
        id: portfolioId,
        name: portfolioId === 'principal' ? 'Principal' : `Portfolio ${fallbackPortfolios.size + 1}`,
        isDefault: fallbackPortfolios.size === 0,
        type: 'spot',
      });
    }

    const bucket = totalsByPortfolio.get(portfolioId) || {
      id: portfolioId,
      label: '',
      isDefault: false,
      totalUsd: 0,
      currencies: 0,
    };
    bucket.totalUsd += balanceUsd;
    bucket.currencies += 1;
    totalsByPortfolio.set(portfolioId, bucket);

    const row = {
      portfolioId,
      name: currency,
      symbol: currency,
      balanceUsd,
      availableUsd,
      quantity: Number(quantity.toFixed(8)),
      currentPrice: Number(currentPrice.toFixed(currency === 'USD' || currency === 'USDC' || currency === 'USDT' ? 2 : 6)),
      averageEntryPrice: Number(currentPrice.toFixed(currency === 'USD' || currency === 'USDC' || currency === 'USDT' ? 2 : 6)),
      allocationPct: allocation,
      pnlUsd: 0,
      pnlPct: 0,
      holdUsd: Number((hold * currentPrice).toFixed(2)),
      type: account.type || 'ACCOUNT_TYPE_CRYPTO',
    };

    if (currency === 'USD' || currency === 'USDC' || currency === 'USDT') {
      treasury.push({
        ...row,
        principalBalanceUsd: balanceUsd,
        derivativesBalanceUsd: 0,
        predictionsBalanceUsd: 0,
        yieldPct: currency === 'USDC' ? 0 : null,
      });
    } else {
      cryptoAssets.push(row);
    }

    if (String(account.type || '').includes('DERIV')) derivativeExposure += balanceUsd;
    if (String(account.type || '').includes('FIAT') || String(account.type || '').includes('CRYPTO')) equitiesExposure += balanceUsd;
    if (String(account.platform || '').includes('PREDICTION')) predictionExposure += balanceUsd;
  }

  const mergedPortfolios = [...portfolios, ...fallbackPortfolios.values()];
  const totalPortfolioValue = [...totalsByPortfolio.values()].reduce((sum, bucket) => sum + bucket.totalUsd, 0);
  const portfolioBuckets = mergedPortfolios.map((portfolio) => {
    const totalUsd = Number((totalsByPortfolio.get(portfolio.id)?.totalUsd ?? 0).toFixed(2));
    return {
      id: portfolio.id,
      label: portfolio.isDefault ? `${portfolio.name} (Par défaut)` : portfolio.name,
      name: portfolio.name,
      isDefault: portfolio.isDefault,
      totalUsd,
      allocationPct: totalPortfolioValue > 0 ? Number(((totalUsd / totalPortfolioValue) * 100).toFixed(2)) : 0,
    };
  }).filter((bucket) => bucket.totalUsd > 0 || bucket.isDefault);

  const normalizeAllocations = (rows) => rows
    .sort((left, right) => right.balanceUsd - left.balanceUsd)
    .map((row) => ({
      ...row,
      allocationPct: totalPortfolioValue > 0 ? Number(((row.balanceUsd / totalPortfolioValue) * 100).toFixed(2)) : 0,
      allocationPctPortfolio: (() => {
        const portfolioTotal = totalsByPortfolio.get(row.portfolioId)?.totalUsd ?? 0;
        return portfolioTotal > 0 ? Number(((row.balanceUsd / portfolioTotal) * 100).toFixed(2)) : 0;
      })(),
    }));

  return {
    totalBalanceUsd: Number(totalPortfolioValue.toFixed(2)),
    change24hUsd: Number(change24h.toFixed(2)),
    change24hPct: totalPortfolioValue > 0 ? Number(((change24h / totalPortfolioValue) * 100).toFixed(2)) : 0,
    portfolioBuckets,
    treasury: normalizeAllocations(treasury),
    cryptoAssets: normalizeAllocations(cryptoAssets),
    openOrders,
    marginRate: derivativeExposure > 0 && totalPortfolioValue > 0
      ? Number(((derivativeExposure / totalPortfolioValue) * 100).toFixed(2))
      : 0,
    derivativeSections: {
      derivatives: { totalUsd: Number(derivativeExposure.toFixed(2)), count: treasury.filter((row) => String(row.type).includes('DERIV')).length },
      equities: { totalUsd: Number(equitiesExposure.toFixed(2)), count: cryptoAssets.length },
      predictions: { totalUsd: Number(predictionExposure.toFixed(2)), count: treasury.filter((row) => String(row.type).includes('PREDICTION')).length },
    },
  };
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
    rawAccounts: allAccounts,
    rates: priceCache,
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
  let portfolioList = [];
  let openOrders = { total: 0, buy: 0, sell: 0 };
  const storedChange24h = await getStoredBalanceChange(userId);
  try {
    [balanceData, portfolioList, openOrders] = await Promise.all([
      fetchCoinbaseBalance(apiKey, apiSecret),
      fetchCoinbasePortfolios(apiKey, apiSecret),
      fetchCoinbaseOpenOrders(apiKey, apiSecret),
    ]);
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

  const snapshot = buildPortfolioSnapshot({
    accounts: balanceData.rawAccounts ?? [],
    rates: balanceData.rates ?? {},
    portfolios: portfolioList,
    openOrders,
    change24h: storedChange24h,
  });

  const responseData = {
    balance: {
      total: balanceData.total,
      available: balanceData.available,
      totalBalance: balanceData.total,
      availableBalance: balanceData.available,
      currency: balanceData.currency,
      breakdown: balanceData.breakdown ?? [],
      change24h: snapshot.change24hUsd,
      change24hPct: snapshot.change24hPct,
      fetchedAt: new Date().toISOString(),
    },
    portfolioSummary: {
      totalBalanceUsd: snapshot.totalBalanceUsd,
      change24hUsd: snapshot.change24hUsd,
      change24hPct: snapshot.change24hPct,
      marginRate: snapshot.marginRate,
      openOrders: snapshot.openOrders,
    },
    portfolioBuckets: snapshot.portfolioBuckets,
    treasury: snapshot.treasury,
    cryptoAssets: snapshot.cryptoAssets,
    derivativeSections: snapshot.derivativeSections,
    exchange: record.exchange,
    live: true,
  };

  setCache(userId, responseData);
  failureCache.delete(userId);

  return res.json({ success: true, cached: false, ...responseData });
});

export default router;
