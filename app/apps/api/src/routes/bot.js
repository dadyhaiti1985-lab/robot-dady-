import express from 'express';
import logger from '../utils/logger.js';
import pb from '../utils/pbClient.js';
import { analyzeMultiTimeframe, calculateWeightedSignalStrength } from '../utils/multiTimeframeAnalyzer.js';
import { getBotStatus } from '../services/advancedBotService.js';
import * as coinbase from '../utils/coinbase.js';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * Multi-tenancy: every account-scoped endpoint below is authenticated and
 * reads ONLY records owned by the caller (userId = req.user.id). Platform
 * (env) exchange keys are never used to build a user's balances, portfolio or
 * transactions, so no account can ever see another account's data.
 */
const OWNED = ['/config', '/status', '/trades', '/start', '/stop', '/accounts', '/portfolio', '/balance', '/transactions', '/dashboard-data'];
router.use(OWNED, authMiddleware);

const ownFilter = (req) => `userId = "${req.user.id}"`;

async function ownBalance(req) {
  try {
    const rec = await pb.collection('bot_account_balance').getFirstListItem(ownFilter(req), { sort: '-created' });
    return {
      total: Number(rec.total ?? 0),
      available: Number(rec.available ?? 0),
      hold: Number(rec.hold ?? 0),
      currency: rec.currency || 'USD',
      last_24h_change: Number(rec.last_24h_change ?? 0),
      timestamp: rec.timestamp,
    };
  } catch {
    // No balance record for this user yet -> zeroed defaults, never someone else's.
    return { total: 0, available: 0, hold: 0, currency: 'USD', last_24h_change: 0, timestamp: null };
  }
}

async function ownPortfolio(req) {
  try {
    const list = await pb.collection('bot_portfolio').getList(1, 50, { filter: ownFilter(req), sort: '-created' });
    return list.items.map((h) => ({
      asset: h.asset,
      amount: Number(h.amount ?? 0),
      price: Number(h.price ?? 0),
      value: Number(h.value ?? 0),
      percentage: Number(h.percentage ?? 0),
    }));
  } catch {
    return [];
  }
}

async function ownTransactions(req, limit = 10) {
  try {
    const list = await pb.collection('bot_transactions').getList(1, Number(limit) || 10, {
      filter: ownFilter(req),
      sort: '-created',
    });
    return list.items.map((t) => ({
      type: t.type,
      asset: t.asset,
      amount: Number(t.amount ?? 0),
      price: Number(t.price ?? 0),
      date: t.date || t.created,
      status: t.status || 'completed',
    }));
  } catch {
    return [];
  }
}

router.get('/accounts', async (req, res) => {
  const portfolio = await ownPortfolio(req);
  const balance = await ownBalance(req);
  res.json(
    portfolio.length
      ? portfolio.map((p) => ({ id: p.asset, currency: p.asset, balance: p.amount, available: p.amount, hold: 0 }))
      : [{ id: 'USD', currency: balance.currency, balance: balance.total, available: balance.available, hold: balance.hold }],
  );
});

router.get('/portfolio', async (req, res) => {
  res.json(await ownPortfolio(req));
});

router.get('/balance', async (req, res) => {
  res.json(await ownBalance(req));
});

router.get('/transactions', async (req, res) => {
  res.json(await ownTransactions(req, req.query.limit));
});

router.get('/dashboard-data', async (req, res) => {
  const [balance, portfolio, transactions] = await Promise.all([
    ownBalance(req),
    ownPortfolio(req),
    ownTransactions(req, 10),
  ]);

  let status = { userId: req.user.id, isActive: false, symbol: DEFAULT_BOT_CONFIG.symbol, strategy: DEFAULT_BOT_CONFIG.strategy };
  try {
    const config = await pb.collection('botConfig').getFirstListItem(ownFilter(req));
    status = {
      userId: req.user.id,
      isActive: Boolean(config.isActive),
      symbol: config.symbol,
      strategy: config.strategy,
      lastUpdated: config.updated,
    };
  } catch {
    // no config yet — defaults above
  }

  res.json({ balance, portfolio, transactions, status, timestamp: Date.now(), cached: false });
});

const DEFAULT_BOT_CONFIG = {
  symbol: 'BTC-USD',
  strategy: 'EMA_RSI',
  stopLoss: 2,
  takeProfit: 5,
  isActive: false,
};


/**
 * GET /bot/debug-credentials - Debug endpoint to check if Coinbase credentials are set
 * Returns: { api_key_set, api_secret_set, api_passphrase_set, api_key_length, api_secret_length, api_passphrase_length, env_loaded, timestamp }
 */
router.get('/debug-credentials', async (req, res) => {
  const apiKey = process.env.COINBASE_API_KEY;
  const apiSecret = process.env.COINBASE_API_SECRET;
  const apiPassphrase = process.env.COINBASE_API_PASSPHRASE;

  const apiKeySet = !!(apiKey && apiKey.trim() !== '');
  const apiSecretSet = !!(apiSecret && apiSecret.trim() !== '');
  const apiPassphraseSet = !!(apiPassphrase && apiPassphrase.trim() !== '');

  logger.info('Debug credentials endpoint called');
  logger.debug(`Credential status: apiKey=${apiKeySet}, apiSecret=${apiSecretSet}, apiPassphrase=${apiPassphraseSet}`);

  res.json({
    api_key_set: apiKeySet,
    api_secret_set: apiSecretSet,
    api_passphrase_set: apiPassphraseSet,
    api_key_length: apiKey ? apiKey.length : 0,
    api_secret_length: apiSecret ? apiSecret.length : 0,
    api_passphrase_length: apiPassphrase ? apiPassphrase.length : 0,
    env_loaded: true,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /bot/config - Get bot configuration for a user
 * Query params: userId
 * Returns: { id, userId, symbol, strategy, stopLoss, takeProfit, isActive, created, updated }
 */
router.get('/config', async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter is required' });
  }

  try {
    // Try to fetch existing config
    const config = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);
    res.json({
      id: config.id,
      userId: config.userId,
      symbol: config.symbol,
      strategy: config.strategy,
      stopLoss: config.stopLoss,
      takeProfit: config.takeProfit,
      isActive: config.isActive,
      created: config.created,
      updated: config.updated,
    });
  } catch (error) {
    // Config doesn't exist, create default
    if (error.status === 404 || error.message.includes('No items found')) {
      const newConfig = await pb.collection('botConfig').create({
        userId,
        ...DEFAULT_BOT_CONFIG,
      });
      logger.info(`Created default bot config for user ${userId}`);
      res.json({
        id: newConfig.id,
        userId: newConfig.userId,
        symbol: newConfig.symbol,
        strategy: newConfig.strategy,
        stopLoss: newConfig.stopLoss,
        takeProfit: newConfig.takeProfit,
        isActive: newConfig.isActive,
        created: newConfig.created,
        updated: newConfig.updated,
      });
    } else {
      logger.error(`[GET /bot/config] PB error for ${userId}: status=${error?.status} msg=${error?.message}`);
      return res.status(503).json({ error: 'Config service temporarily unavailable.', code: 'PB_UNAVAILABLE' });
    }
  }
});

/**
 * POST /bot/config - Save/update bot configuration
 * Body: { userId, symbol, strategy, stopLoss, takeProfit, isActive, riskPerTrade, maxConcurrentPositions, dailyLossLimit, trailingStopPercent, assetRotationEnabled, timeframeWeights }
 * Returns: { id, userId, symbol, strategy, stopLoss, takeProfit, isActive, created, updated }
 */
router.post('/config', async (req, res) => {
  const userId = req.user.id;
  const {
    symbol,
    strategy,
    stopLoss,
    takeProfit,
    isActive,
    riskPerTrade,
    maxConcurrentPositions,
    dailyLossLimit,
    trailingStopPercent,
    assetRotationEnabled,
    timeframeWeights,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Validate inputs
  if (riskPerTrade && (riskPerTrade < 0.5 || riskPerTrade > 3)) {
    return res.status(400).json({ error: 'riskPerTrade must be between 0.5% and 3%' });
  }
  if (maxConcurrentPositions && (maxConcurrentPositions < 1 || maxConcurrentPositions > 5)) {
    return res.status(400).json({ error: 'maxConcurrentPositions must be between 1 and 5' });
  }
  if (dailyLossLimit && (dailyLossLimit < 2 || dailyLossLimit > 10)) {
    return res.status(400).json({ error: 'dailyLossLimit must be between 2% and 10%' });
  }
  if (trailingStopPercent && (trailingStopPercent < 0 || trailingStopPercent > 100)) {
    return res.status(400).json({ error: 'trailingStopPercent must be between 0% and 100%' });
  }

  try {
    // Try to fetch existing config
    const existingConfig = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);

    // Update existing config
    const updatedConfig = await pb.collection('botConfig').update(existingConfig.id, {
      ...(symbol !== undefined && { symbol }),
      ...(strategy !== undefined && { strategy }),
      ...(stopLoss !== undefined && { stopLoss }),
      ...(takeProfit !== undefined && { takeProfit }),
      ...(isActive !== undefined && { isActive }),
      ...(riskPerTrade !== undefined && { riskPerTrade }),
      ...(maxConcurrentPositions !== undefined && { maxConcurrentPositions }),
      ...(dailyLossLimit !== undefined && { dailyLossLimit }),
      ...(trailingStopPercent !== undefined && { trailingStopPercent }),
      ...(assetRotationEnabled !== undefined && { assetRotationEnabled }),
      ...(timeframeWeights !== undefined && { timeframeWeights }),
    });

    res.json({
      id: updatedConfig.id,
      userId: updatedConfig.userId,
      symbol: updatedConfig.symbol,
      strategy: updatedConfig.strategy,
      stopLoss: updatedConfig.stopLoss,
      takeProfit: updatedConfig.takeProfit,
      isActive: updatedConfig.isActive,
      riskPerTrade: updatedConfig.riskPerTrade,
      maxConcurrentPositions: updatedConfig.maxConcurrentPositions,
      dailyLossLimit: updatedConfig.dailyLossLimit,
      trailingStopPercent: updatedConfig.trailingStopPercent,
      assetRotationEnabled: updatedConfig.assetRotationEnabled,
      timeframeWeights: updatedConfig.timeframeWeights,
      created: updatedConfig.created,
      updated: updatedConfig.updated,
    });
  } catch (error) {
    // Config doesn't exist, create new
    if (error.status === 404 || error.message.includes('No items found')) {
      const newConfig = await pb.collection('botConfig').create({
        userId,
        symbol: symbol || DEFAULT_BOT_CONFIG.symbol,
        strategy: strategy || DEFAULT_BOT_CONFIG.strategy,
        stopLoss: stopLoss !== undefined ? stopLoss : DEFAULT_BOT_CONFIG.stopLoss,
        takeProfit: takeProfit !== undefined ? takeProfit : DEFAULT_BOT_CONFIG.takeProfit,
        isActive: isActive !== undefined ? isActive : DEFAULT_BOT_CONFIG.isActive,
        riskPerTrade: riskPerTrade || 1,
        maxConcurrentPositions: maxConcurrentPositions || 3,
        dailyLossLimit: dailyLossLimit || 5,
        trailingStopPercent: trailingStopPercent || 50,
        assetRotationEnabled: assetRotationEnabled !== undefined ? assetRotationEnabled : true,
        timeframeWeights: timeframeWeights || { '15m': 0.3, '4h': 0.4, '1D': 0.3 },
      });

      res.json({
        id: newConfig.id,
        userId: newConfig.userId,
        symbol: newConfig.symbol,
        strategy: newConfig.strategy,
        stopLoss: newConfig.stopLoss,
        takeProfit: newConfig.takeProfit,
        isActive: newConfig.isActive,
        riskPerTrade: newConfig.riskPerTrade,
        maxConcurrentPositions: newConfig.maxConcurrentPositions,
        dailyLossLimit: newConfig.dailyLossLimit,
        trailingStopPercent: newConfig.trailingStopPercent,
        assetRotationEnabled: newConfig.assetRotationEnabled,
        timeframeWeights: newConfig.timeframeWeights,
        created: newConfig.created,
        updated: newConfig.updated,
      });
    } else {
      logger.error(`[POST /bot/config] PB error for ${userId}: status=${error?.status} msg=${error?.message}`);
      return res.status(503).json({ error: 'Config service temporarily unavailable.', code: 'PB_UNAVAILABLE' });
    }
  }
});

/**
 * POST /bot/start - Start bot trading
 * Body: { userId }
 * Returns: { success: true, message: 'Bot started', config: {...} }
 */
router.post('/start', async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Fetch existing config
    const existingConfig = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);

    // Update config to set isActive=true
    const updatedConfig = await pb.collection('botConfig').update(existingConfig.id, {
      isActive: true,
    });

    logger.info(`Bot started for user ${userId}`);

    res.json({
      success: true,
      message: 'Bot started',
      config: {
        id: updatedConfig.id,
        userId: updatedConfig.userId,
        symbol: updatedConfig.symbol,
        strategy: updatedConfig.strategy,
        stopLoss: updatedConfig.stopLoss,
        takeProfit: updatedConfig.takeProfit,
        isActive: updatedConfig.isActive,
        created: updatedConfig.created,
        updated: updatedConfig.updated,
      },
    });
  } catch (error) {
    // Config doesn't exist, create default and start
    if (error.status === 404 || error.message.includes('No items found')) {
      const newConfig = await pb.collection('botConfig').create({
        userId,
        ...DEFAULT_BOT_CONFIG,
        isActive: true,
      });

      logger.info(`Bot started for user ${userId} (new config created)`);

      res.json({
        success: true,
        message: 'Bot started',
        config: {
          id: newConfig.id,
          userId: newConfig.userId,
          symbol: newConfig.symbol,
          strategy: newConfig.strategy,
          stopLoss: newConfig.stopLoss,
          takeProfit: newConfig.takeProfit,
          isActive: newConfig.isActive,
          created: newConfig.created,
          updated: newConfig.updated,
        },
      });
    } else {
      logger.error(`[POST /bot/start] PB error for ${userId}: status=${error?.status} msg=${error?.message}`);
      return res.status(503).json({ success: false, error: 'Bot start service temporarily unavailable.', code: 'PB_UNAVAILABLE' });
    }
  }
});

/**
 * POST /bot/stop - Stop bot trading
 * Body: { userId }
 * Returns: { success: true, message: 'Bot stopped', config: {...} }
 */
router.post('/stop', async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Fetch existing config
  const existingConfig = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);

  // Update config to set isActive=false
  const updatedConfig = await pb.collection('botConfig').update(existingConfig.id, {
    isActive: false,
  });

  logger.info(`Bot stopped for user ${userId}`);

  res.json({
    success: true,
    message: 'Bot stopped',
    config: {
      id: updatedConfig.id,
      userId: updatedConfig.userId,
      symbol: updatedConfig.symbol,
      strategy: updatedConfig.strategy,
      stopLoss: updatedConfig.stopLoss,
      takeProfit: updatedConfig.takeProfit,
      isActive: updatedConfig.isActive,
      created: updatedConfig.created,
      updated: updatedConfig.updated,
    },
  });
});

/**
 * GET /bot/status - Get current bot status
 * Query params: userId
 * Returns: { userId, isActive, symbol, strategy, lastUpdated }
 */
router.get('/status', async (req, res) => {
  const userId = req.user?.id;
  console.log('[GET /bot/status] received — userId:', userId || 'MISSING');

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 'NO_USER' });
  }

  try {
    const config = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);
    console.log('[GET /bot/status] config found — isActive:', config.isActive);
    return res.json({
      success: true,
      userId: config.userId,
      isActive: Boolean(config.isActive),
      symbol: config.symbol || DEFAULT_BOT_CONFIG.symbol,
      strategy: config.strategy || DEFAULT_BOT_CONFIG.strategy,
      lastUpdated: config.updated,
    });
  } catch (error) {
    const is404 =
      error?.status === 404 ||
      String(error?.message || '').toLowerCase().includes('not found') ||
      String(error?.message || '').includes('No items found');

    console.log('[GET /bot/status] lookup result — is404:', is404, '| status:', error?.status, '| msg:', error?.message);

    if (is404) {
      return res.json({
        success: true,
        userId,
        isActive: false,
        symbol: DEFAULT_BOT_CONFIG.symbol,
        strategy: DEFAULT_BOT_CONFIG.strategy,
        lastUpdated: null,
      });
    }

    // PocketBase unavailable or other server-side error — return 503 instead of re-throwing
    logger.error(`[GET /bot/status] PB error for ${userId}: status=${error?.status} msg=${error?.message}`);
    return res.status(503).json({
      success: false,
      error: 'Bot status service temporarily unavailable.',
      code: 'PB_UNAVAILABLE',
      isActive: false,
      userId,
    });
  }
});

/**
 * POST /bot/status - Set bot active status (upsert-safe)
 * Body: { status: 'ACTIVE' | 'INACTIVE' } or { isActive: boolean }
 */
router.post('/status', async (req, res) => {
  // ── STEP 0: request received ──────────────────────────────────────────────
  console.log('POST /api/bot/status received');
  console.log('[bot/status] raw body:', JSON.stringify(req.body));

  try {
    // ── STEP 1: authenticate ────────────────────────────────────────────────
    const userId = req.user?.id;
    console.log('[bot/status] User ID:', userId || 'MISSING');

    if (!userId) {
      console.error('[bot/status] Unauthorized – no user on request');
      return res.status(401).json({ success: false, error: 'Unauthorized', code: 'NO_USER' });
    }

    // ── STEP 2: parse desired status ────────────────────────────────────────
    const raw = req.body?.status;
    let isActive;

    if (typeof req.body?.isActive === 'boolean') {
      isActive = req.body.isActive;
    } else if (typeof raw === 'string') {
      const norm = raw.trim().toUpperCase();
      if (norm !== 'ACTIVE' && norm !== 'INACTIVE') {
        console.error(`[bot/status] Invalid status value: "${raw}"`);
        return res.status(422).json({ success: false, error: "status must be 'ACTIVE' or 'INACTIVE'" });
      }
      isActive = norm === 'ACTIVE';
    } else {
      isActive = Boolean(req.body?.isActive);
    }

    console.log('[bot/status] Parsed isActive:', isActive);
    console.log('[bot/status] New status will be:', isActive ? 'ACTIVE' : 'INACTIVE');
    logger.info(`[bot/status] user=${userId} isActive=${isActive}`);

    // ── STEP 3: look up existing botConfig ──────────────────────────────────
    console.log('[bot/status] Querying botConfig collection for user:', userId);
    let config = null;
    try {
      config = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);
      console.log('[bot/status] Found existing botConfig id:', config?.id);
      logger.info(`[bot/status] found existing botConfig id=${config?.id}`);
    } catch (lookupErr) {
      const is404 =
        lookupErr?.status === 404 ||
        String(lookupErr?.message || '').toLowerCase().includes('not found') ||
        String(lookupErr?.message || '').includes('No items found');

      console.log('[bot/status] botConfig lookup result – is404:', is404, '| err status:', lookupErr?.status, '| msg:', lookupErr?.message);

      if (!is404) {
        console.error('[bot/status] PocketBase lookup error (non-404):', lookupErr?.message);
        console.error('[bot/status] Stack:', lookupErr?.stack);
        logger.error(`[bot/status] PB lookup error for ${userId}: status=${lookupErr?.status} msg=${lookupErr?.message}`);
        return res.status(503).json({
          success: false,
          error: 'Bot configuration service unavailable',
          code: 'PB_UNAVAILABLE',
          detail: lookupErr?.message,
        });
      }
      console.log('[bot/status] No existing botConfig – will create one');
    }

    // ── STEP 4: upsert botConfig ─────────────────────────────────────────────
    console.log('[bot/status] Updating database...');
    let saved;
    try {
      if (config) {
        console.log('[bot/status] Updating existing record id:', config.id);
        saved = await pb.collection('botConfig').update(config.id, { isActive });
      } else {
        console.log('[bot/status] Creating new botConfig record for user:', userId);
        saved = await pb.collection('botConfig').create({
          userId,
          symbol: DEFAULT_BOT_CONFIG.symbol,
          strategy: DEFAULT_BOT_CONFIG.strategy,
          stopLoss: DEFAULT_BOT_CONFIG.stopLoss,
          takeProfit: DEFAULT_BOT_CONFIG.takeProfit,
          isActive,
        });
      }
      console.log('[bot/status] Database update successful, saved id:', saved?.id);
    } catch (saveErr) {
      console.error('[bot/status] Database save FAILED:', saveErr?.message);
      console.error('[bot/status] PB error status:', saveErr?.status);
      console.error('[bot/status] PB error data:', JSON.stringify(saveErr?.data || {}));
      console.error('[bot/status] Stack:', saveErr?.stack);
      logger.error(`[bot/status] save failed for ${userId}: status=${saveErr?.status} msg=${saveErr?.message} data=${JSON.stringify(saveErr?.data || {})}`);
      return res.status(502).json({
        success: false,
        error: `Could not save bot status: ${saveErr?.message || 'Unknown error'}`,
        code: 'PB_SAVE_FAILED',
        detail: saveErr?.message,
        pbData: saveErr?.data || null,
      });
    }

    // ── STEP 5: success ─────────────────────────────────────────────────────
    const response = {
      success: true,
      status: isActive ? 'ACTIVE' : 'INACTIVE',
      isActive: Boolean(saved?.isActive),
      message: isActive ? 'Robo demare ak siksè!' : 'Robo a sispann',
      symbol: saved?.symbol || DEFAULT_BOT_CONFIG.symbol,
      strategy: saved?.strategy || DEFAULT_BOT_CONFIG.strategy,
      updated: saved?.updated,
      timestamp: new Date().toISOString(),
    };

    console.log('[bot/status] Response sent:', JSON.stringify(response));
    logger.info(`[bot/status] success user=${userId} -> ${isActive ? 'ACTIVE' : 'INACTIVE'}`);

    return res.status(200).json(response);

  } catch (outerErr) {
    // ── CATCH-ALL: nothing should reach here, but just in case ───────────────
    console.error('[bot/status] UNEXPECTED ERROR:', outerErr?.message);
    console.error('[bot/status] Stack:', outerErr?.stack);
    console.error('[bot/status] Failed at step: outer catch-all');
    logger.error(`[bot/status] unexpected error: ${outerErr?.message}`, outerErr);

    return res.status(500).json({
      success: false,
      error: outerErr?.message || 'Unexpected server error. Please try again.',
      stack: process.env.NODE_ENV !== 'production' ? outerErr?.stack : undefined,
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /bot/trades - Get trade history
 * Query params: userId
 * Returns: Array of trades with fields: symbol, side, quantity, price, entryPrice, exitPrice, pnl, timestamp
 */
router.get('/trades', async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter is required' });
  }

  try {
    // Fetch trades from botTrades collection
    const trades = await pb.collection('botTrades').getList(1, 50, {
      filter: `userId = "${userId}"`,
      sort: '-timestamp',
    });

    const formattedTrades = trades.items.map(trade => ({
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      pnl: trade.pnl,
      timestamp: trade.timestamp,
    }));

    res.json(formattedTrades);
  } catch (error) {
    // If collection doesn't exist or no trades found, return empty array
    if (error.status === 404 || error.message.includes('No items found')) {
      res.json([]);
    } else {
      logger.error(`[GET /bot/trades] PB error: status=${error?.status} msg=${error?.message}`);
      return res.json([]);
    }
  }
});

/**
 * GET /bot/analysis - Get current multi-timeframe analysis for specified asset
 * Query params: asset, timeframe (optional)
 * Returns: { success: true, data: {...} } or { success: false, error: string, fallback: true }
 */
router.get('/analysis', async (req, res) => {
  const { asset, timeframe } = req.query;

  if (!asset) {
    return res.status(400).json({ error: 'asset query parameter is required' });
  }

  try {
    // Analyze the asset
    const analysisResults = await analyzeMultiTimeframe(asset);

    // If timeframe specified, return only that timeframe
    if (timeframe) {
      const timeframeData = analysisResults[timeframe];
      if (!timeframeData) {
        return res.status(200).json({
          success: false,
          error: `No analysis data for timeframe ${timeframe}`,
          data: null,
          fallback: true,
        });
      }
      return res.json({
        success: true,
        data: timeframeData,
      });
    }

    // Return all timeframes
    res.json({
      success: true,
      data: analysisResults,
    });
  } catch (error) {
    logger.error(
      `Analysis endpoint error: asset=${asset}, timeframe=${timeframe}, error=${error.message}`
    );

    // Return HTTP 200 with error flag instead of crashing
    res.status(200).json({
      success: false,
      error: 'Analysis failed',
      data: null,
      fallback: true,
    });
  }
});

/**
 * GET /bot/advanced-status - Get current bot status and performance metrics
 * Returns: { activeAsset, signalStrength, openPositions, dailyPnL, dailyLossLimit, tradingPaused, winRate, profitFactor, maxDrawdown, sharpeRatio, monthlyPnL, lastUpdate }
 */
router.get('/advanced-status', async (req, res) => {
  const status = await getBotStatus();
  res.json(status);
});

/**
 * GET /bot/rotations - Get asset rotation history
 * Query params: limit (default 10)
 * Returns: Array of rotations: [{ fromAsset, toAsset, fromMomentum, toMomentum, reason, timestamp }]
 */
router.get('/rotations', async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const rotations = await pb.collection('bot_rotations').getList(1, parseInt(limit), {
      sort: '-timestamp',
    });

    const formattedRotations = rotations.items.map(rotation => ({
      fromAsset: rotation.fromAsset,
      toAsset: rotation.toAsset,
      fromMomentum: rotation.fromMomentum,
      toMomentum: rotation.toMomentum,
      fromVolatility: rotation.fromVolatility,
      toVolatility: rotation.toVolatility,
      reason: rotation.reason,
      timestamp: rotation.timestamp,
    }));

    res.json(formattedRotations);
  } catch (error) {
    if (error.status === 404 || error.message.includes('No items found')) {
      return res.json([]);
    } else {
      logger.error(`[GET /bot/rotations] PB error: status=${error?.status} msg=${error?.message}`);
      return res.json([]);
    }
  }
});

/**
 * GET /bot/test-coinbase - Test Coinbase API connection
 * Returns: { success: true/false, message: string, apiKey: 'set'/'not set', apiSecret: 'set'/'not set', apiPassphrase: 'set'/'not set', endpoint: string, testResult: { status: number, error: string } }
 */
router.get('/test-coinbase', async (req, res) => {
  const apiKey = process.env.COINBASE_API_KEY;
  const apiSecret = process.env.COINBASE_API_SECRET;
  const apiPassphrase = process.env.COINBASE_API_PASSPHRASE;

  const keyStatus = apiKey && apiKey.trim() !== '' ? 'set' : 'not set';
  const secretStatus = apiSecret && apiSecret.trim() !== '' ? 'set' : 'not set';
  const passphraseStatus = apiPassphrase && apiPassphrase.trim() !== '' ? 'set' : 'not set';

  const endpoint = 'https://api.exchange.coinbase.com';

  logger.info(
    `Testing Coinbase API connection: ` +
    `apiKey=${keyStatus}, apiSecret=${secretStatus}, apiPassphrase=${passphraseStatus}`
  );

  // Check if credentials are missing
  if (keyStatus === 'not set' || secretStatus === 'not set' || passphraseStatus === 'not set') {
    const missingCredentials = [];
    if (keyStatus === 'not set') missingCredentials.push('COINBASE_API_KEY');
    if (secretStatus === 'not set') missingCredentials.push('COINBASE_API_SECRET');
    if (passphraseStatus === 'not set') missingCredentials.push('COINBASE_API_PASSPHRASE');
    logger.warn(`Missing Coinbase credentials: ${missingCredentials.join(', ')}`);
  }

  try {
    // Test with a simple candle fetch
    const productId = 'BTC-USD';
    const granularity = 3600; // 1 hour
    const limit = 1;

    const startTime = Math.floor(Date.now() / 1000) - granularity * limit;
    const endTime = Math.floor(Date.now() / 1000);

    const url = `https://api.coinbase.com/api/v1/products/${productId}/candles`;
    const params = {
      start_time: startTime,
      end_time: endTime,
      granularity,
    };

    logger.debug(`Coinbase test request: GET ${url}`);
    logger.debug(`Params: ${JSON.stringify(params)}`);

    const response = await axios.get(url, { params });

    logger.info(`Coinbase API test successful: status=${response.status}`);

    res.json({
      success: true,
      message: 'Coinbase API connection successful',
      apiKey: keyStatus,
      apiSecret: secretStatus,
      apiPassphrase: passphraseStatus,
      endpoint,
      testResult: {
        status: response.status,
        error: null,
      },
    });
  } catch (error) {
    const statusCode = error.response?.status || 'unknown';
    const errorMessage = error.response?.data?.message || error.message;

    logger.error(
      `Coinbase API test failed: status=${statusCode}, error=${errorMessage}`
    );

    res.json({
      success: false,
      message: `Coinbase API connection failed: ${errorMessage}`,
      apiKey: keyStatus,
      apiSecret: secretStatus,
      apiPassphrase: passphraseStatus,
      endpoint,
      testResult: {
        status: statusCode,
        error: errorMessage,
      },
    });
  }
});





/**
 * GET /bot/test-transactions - Test Coinbase transactions API directly
 * Returns: { status: 'success'|'failed', details: {...}, credentials_set: boolean, api_response: {...} }
 */
router.get('/test-transactions', async (req, res) => {
  const apiKey = process.env.COINBASE_API_KEY;
  const apiSecret = process.env.COINBASE_API_SECRET;
  const apiPassphrase = process.env.COINBASE_API_PASSPHRASE;

  const credentialsSet = !!(apiKey && apiSecret && apiPassphrase && apiKey.trim() !== '' && apiSecret.trim() !== '' && apiPassphrase.trim() !== '');

  logger.info('Testing Coinbase transactions API');
  logger.debug(`Credentials set: ${credentialsSet}`);

  if (!credentialsSet) {
    const missingCredentials = [];
    if (!apiKey || apiKey.trim() === '') missingCredentials.push('COINBASE_API_KEY');
    if (!apiSecret || apiSecret.trim() === '') missingCredentials.push('COINBASE_API_SECRET');
    if (!apiPassphrase || apiPassphrase.trim() === '') missingCredentials.push('COINBASE_API_PASSPHRASE');
    logger.warn(`Coinbase credentials not configured: ${missingCredentials.join(', ')}`);
    return res.json({
      status: 'failed',
      details: {
        message: 'Coinbase credentials not configured',
        apiKey: apiKey ? 'set' : 'not set',
        apiSecret: apiSecret ? 'set' : 'not set',
        apiPassphrase: apiPassphrase ? 'set' : 'not set',
      },
      credentials_set: false,
      api_response: null,
    });
  }

  try {
    logger.debug('Calling coinbase.getOrders(null, 5)');
    const orders = await coinbase.getOrders(null, 5);

    logger.info(`Test successful: received ${orders ? orders.length : 0} orders`);

    return res.json({
      status: 'success',
      details: {
        message: 'Coinbase transactions API test successful',
        ordersCount: orders ? orders.length : 0,
      },
      credentials_set: true,
      api_response: {
        status: 200,
        ordersCount: orders ? orders.length : 0,
        sampleOrder: orders && orders.length > 0 ? orders[0] : null,
      },
    });
  } catch (error) {
    const statusCode = error.response?.status || 'unknown';
    const errorMessage = error.response?.data?.message || error.message;

    logger.error(`Test failed: status=${statusCode}, error=${errorMessage}`);

    return res.json({
      status: 'failed',
      details: {
        message: `Coinbase API error: ${errorMessage}`,
        statusCode,
        errorMessage,
      },
      credentials_set: true,
      api_response: {
        status: statusCode,
        error: errorMessage,
      },
    });
  }
});


export default router;