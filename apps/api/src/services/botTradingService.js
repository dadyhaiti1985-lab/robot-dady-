import 'dotenv/config';
import * as coinbase from '../utils/coinbase.js';
import * as pocketbaseUtils from '../utils/pocketbase.js';
import * as telegramUtils from '../utils/telegram.js';
import logger from '../utils/logger.js';
import pb from '../utils/pbClient.js';

// In-memory fallback state
const inMemoryState = new Map();

// Active bot loops
const activeBots = new Map();

// Per-user async execution lock — prevents concurrent ticks
const executionLocks = new Set();

// Cooldown tracker: userId → timestamp of last BUY execution
const lastBuyTime = new Map();
const MIN_BUY_COOLDOWN_MS = 5 * 60 * 1000; // 5 min between consecutive BUYs

// Circuit breaker state
const circuitBreakers = new Map();

// Retry state for failed operations
const retryState = new Map();

const TRADING_LOOP_INTERVAL = 5000; // 5 seconds
const RETRY_DELAY = 30000; // 30 seconds
const CIRCUIT_BREAKER_THRESHOLD = 2; // % volatility
const CIRCUIT_BREAKER_DURATION = 60000; // 60 seconds

/**
 * Calculate EMA (Exponential Moving Average)
 */
function calculateEMA(prices, period) {
  if (prices.length < period) return null;

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.map(c => (c > 0 ? c : 0));
  const losses = changes.map(c => (c < 0 ? -c : 0));

  const avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
}

/**
 * Get bot state from PocketBase or in-memory fallback
 */
async function getBotState(userId) {
  try {
    const config = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);
    // Merge in-memory currentPosition so it survives PocketBase save failures
    const memState = inMemoryState.get(userId);
    return {
      userId,
      isActive: config.isActive || false,
      symbol: config.symbol || 'BTC-USD',
      strategy: config.strategy || 'EMA_RSI',
      stopLoss: config.stopLoss || 2,
      takeProfit: config.takeProfit || 5,
      allocation: config.allocation || 5,
      candleGranularity: config.candleGranularity || 300,
      lastTradeTime: memState?.lastTradeTime ?? config.lastTradeTime ?? null,
      currentPosition: memState?.currentPosition ?? config.currentPosition ?? null,
      balance: memState?.balance ?? config.balance ?? 10000,
      pbId: config.id,
    };
  } catch (error) {
    logger.warn(`Failed to fetch bot state from PocketBase for user ${userId}, using in-memory fallback:`, error.message);

    // Return in-memory state or default
    if (inMemoryState.has(userId)) {
      return inMemoryState.get(userId);
    }

    const defaultState = {
      userId,
      isActive: false,
      symbol: 'BTC-USD',
      strategy: 'EMA_RSI',
      stopLoss: 2,
      takeProfit: 5,
      allocation: 5,
      candleGranularity: 300,
      lastTradeTime: null,
      currentPosition: null,
      balance: 10000,
      pbId: null,
    };

    inMemoryState.set(userId, defaultState);
    return defaultState;
  }
}

/**
 * Save bot state to PocketBase
 */
async function saveBotState(userId, state) {
  try {
    if (state.pbId) {
      await pb.collection('botConfig').update(state.pbId, {
        isActive: state.isActive,
        lastTradeTime: state.lastTradeTime,
        currentPosition: state.currentPosition,
        balance: state.balance,
      });
    } else {
      const config = await pb.collection('botConfig').create({
        userId,
        isActive: state.isActive,
        symbol: state.symbol,
        strategy: state.strategy,
        stopLoss: state.stopLoss,
        takeProfit: state.takeProfit,
        allocation: state.allocation,
        candleGranularity: state.candleGranularity,
        lastTradeTime: state.lastTradeTime,
        currentPosition: state.currentPosition,
        balance: state.balance,
      });
      state.pbId = config.id;
    }
  } catch (error) {
    logger.warn(`Failed to save bot state to PocketBase for user ${userId}:`, error.message);
    // Update in-memory fallback
    inMemoryState.set(userId, state);
  }
}

/**
 * Check circuit breaker for volatility
 */
function checkCircuitBreaker(userId, currentPrice, previousPrice) {
  const volatility = Math.abs((currentPrice - previousPrice) / previousPrice) * 100;

  if (volatility > CIRCUIT_BREAKER_THRESHOLD) {
    const breaker = circuitBreakers.get(userId) || { blockedUntil: 0 };
    breaker.blockedUntil = Date.now() + CIRCUIT_BREAKER_DURATION;
    circuitBreakers.set(userId, breaker);

    logger.warn(`Circuit breaker triggered for user ${userId}: volatility ${volatility.toFixed(2)}%`);
    telegramUtils.sendCircuitBreakerAlert('BTC-USD', volatility).catch(err => {
      logger.error('Failed to send circuit breaker alert:', err.message);
    });

    return true;
  }

  const breaker = circuitBreakers.get(userId);
  if (breaker && breaker.blockedUntil > Date.now()) {
    return true;
  }

  return false;
}

/**
 * Log trade to PocketBase
 */
async function logTrade(userId, tradeData) {
  try {
    // Field names / enum values must match the `trades` collection schema:
    // asset, type (buy|sell), amount, entryPrice, exitPrice, status (open|closed).
    const trade = await pb.collection('trades').create({
      userId,
      asset: tradeData.asset || tradeData.symbol,
      type: String(tradeData.type || tradeData.side || 'buy').toLowerCase(),
      amount: Number(tradeData.amount ?? tradeData.quantity ?? 0),
      entryPrice: Number(tradeData.entryPrice ?? tradeData.price ?? 0),
      exitPrice: tradeData.exitPrice ?? null,
      pnl: tradeData.pnl || 0,
      status: String(tradeData.status || 'open').toLowerCase(),
      reason: tradeData.reason || tradeData.orderId || 'bot',
      timestamp: new Date().toISOString(),
    });
    return trade;
  } catch (error) {
    logger.error(`Failed to log trade for user ${userId}:`, error.message);
    throw error;
  }
}

/**
 * Execute trading step for a user
 */
async function executeTradingStep(userId) {
  // Prevent concurrent execution for the same user
  if (executionLocks.has(userId)) {
    logger.debug(`[bot] Skipping tick for ${userId} — previous step still running`);
    return { executed: false, message: 'Step already in progress' };
  }
  executionLocks.add(userId);
  try {
    return await _doTradingStep(userId);
  } finally {
    executionLocks.delete(userId);
  }
}

async function _doTradingStep(userId) {
  const state = await getBotState(userId);

  if (!state.isActive) {
    return { executed: false, message: 'Bot not active' };
  }

  try {
    // Fetch candle data
    const candles = await coinbase.getCandles(state.symbol, state.candleGranularity, 100);

    if (!candles || candles.length < 20) {
      logger.warn(`Insufficient candle data for ${state.symbol}`);
      return { executed: false, message: 'Insufficient candle data' };
    }

    const closePrices = candles.map(c => parseFloat(c.close));
    const currentPrice = closePrices[closePrices.length - 1];
    const previousPrice = closePrices[closePrices.length - 2];

    // Check circuit breaker
    if (checkCircuitBreaker(userId, currentPrice, previousPrice)) {
      return { executed: false, message: 'Circuit breaker active' };
    }

    // Calculate indicators
    const ema20 = calculateEMA(closePrices, 20);
    const rsi14 = calculateRSI(closePrices, 14);

    if (!ema20 || !rsi14) {
      return { executed: false, message: 'Insufficient data for indicators' };
    }

    // Check for open position
    const hasOpenPosition = state.currentPosition !== null;

    let tradeExecuted = false;
    let tradeData = null;

    // BUY SIGNAL — also gated by cooldown to prevent re-entry when state is stale
    const cooldownRemaining = MIN_BUY_COOLDOWN_MS - (Date.now() - (lastBuyTime.get(userId) || 0));
    if (!hasOpenPosition && cooldownRemaining > 0) {
      logger.debug(`[bot] BUY cooldown active for ${userId}: ${Math.ceil(cooldownRemaining / 1000)}s remaining`);
    }
    if (!hasOpenPosition && cooldownRemaining <= 0 && currentPrice > ema20 && previousPrice < ema20 && rsi14 >= 40 && rsi14 <= 58) {
      try {
        const account = await coinbase.getAccount();
        const balance = parseFloat(account.available);
        const orderSize = balance * (state.allocation / 100);
        const quantity = orderSize / currentPrice;

        const order = await coinbase.createMarketOrder(state.symbol, 'BUY', orderSize);
        const executedPrice = parseFloat(order.average_filled_price) || currentPrice;

        // Log trade
        const trade = await logTrade(userId, {
          symbol: state.symbol,
          side: 'BUY',
          quantity,
          entryPrice: executedPrice,
          price: executedPrice,
          orderId: order.order_id,
          status: 'OPEN',
        });

        // Update state
        state.currentPosition = {
          tradeId: trade.id,
          symbol: state.symbol,
          side: 'BUY',
          quantity,
          entryPrice: executedPrice,
          timestamp: new Date(),
        };
        state.lastTradeTime = new Date();
        state.balance = balance - orderSize;

        await saveBotState(userId, state);
        lastBuyTime.set(userId, Date.now()); // stamp cooldown immediately after BUY

        tradeExecuted = true;
        tradeData = {
          symbol: state.symbol,
          side: 'BUY',
          quantity,
          price: executedPrice,
          timestamp: new Date(),
        };

        logger.info(`BUY order executed for user ${userId}: ${state.symbol} ${quantity.toFixed(8)} @ $${executedPrice.toFixed(2)}`);
      } catch (error) {
        logger.error(`Failed to execute BUY order for user ${userId}:`, error.message);
        telegramUtils.sendConnectionErrorAlert('Coinbase', error.message).catch(err => {
          logger.error('Failed to send error alert:', err.message);
        });
      }
    }
    // SELL SIGNAL
    else if (hasOpenPosition) {
      const position = state.currentPosition;
      const entryPrice = position.entryPrice;
      const tradeQuantity = position.quantity;

      let shouldSell = false;
      let reason = '';

      // Check sell conditions
      if (currentPrice < ema20) {
        shouldSell = true;
        reason = 'Price below EMA20';
      } else if (rsi14 > 75) {
        shouldSell = true;
        reason = 'RSI overbought';
      } else if (currentPrice <= entryPrice * (1 - state.stopLoss / 100)) {
        shouldSell = true;
        reason = 'Stop loss hit';
      } else if (currentPrice >= entryPrice * (1 + state.takeProfit / 100)) {
        shouldSell = true;
        reason = 'Take profit hit';
      }

      if (shouldSell) {
        try {
          const order = await coinbase.createMarketOrder(state.symbol, 'SELL', tradeQuantity);
          const executedPrice = parseFloat(order.average_filled_price) || currentPrice;
          const pnl = (executedPrice - entryPrice) * tradeQuantity;

          // Update trade record
          await pb.collection('trades').update(position.tradeId, {
            exitPrice: executedPrice,
            status: 'CLOSED',
            pnl,
            closedAt: new Date(),
            closeReason: reason,
            orderId: order.order_id,
          });

          // Update state
          state.currentPosition = null;
          state.lastTradeTime = new Date();
          state.balance += executedPrice * tradeQuantity;

          await saveBotState(userId, state);

          tradeExecuted = true;
          tradeData = {
            symbol: state.symbol,
            side: 'SELL',
            quantity: tradeQuantity,
            price: executedPrice,
            timestamp: new Date(),
            pnl,
          };

          logger.info(`SELL order executed for user ${userId}: ${state.symbol} ${tradeQuantity.toFixed(8)} @ $${executedPrice.toFixed(2)} | P&L: $${pnl.toFixed(2)}`);
        } catch (error) {
          logger.error(`Failed to execute SELL order for user ${userId}:`, error.message);
          telegramUtils.sendConnectionErrorAlert('Coinbase', error.message).catch(err => {
            logger.error('Failed to send error alert:', err.message);
          });
        }
      }
    }

    // Send Telegram notification if trade executed
    if (tradeExecuted && tradeData) {
      telegramUtils.sendTradeNotification(tradeData).catch(err => {
        logger.error('Failed to send trade notification:', err.message);
      });
    }

    return {
      executed: tradeExecuted,
      message: tradeExecuted ? 'Trade executed' : 'No signal',
      tradeData,
    };
  } catch (error) {
    logger.error(`Trading step error for user ${userId}:`, error.message);

    // Schedule retry
    const retryKey = `${userId}-retry`;
    if (!retryState.has(retryKey)) {
      retryState.set(retryKey, Date.now() + RETRY_DELAY);
      logger.info(`Scheduled retry for user ${userId} in ${RETRY_DELAY / 1000} seconds`);
    }

    throw error;
  }
}

/**
 * Start trading loop for a user
 */
function startTradingLoop(userId) {
  if (activeBots.has(userId)) {
    logger.warn(`Trading loop already running for user ${userId}`);
    return;
  }

  logger.info(`Starting trading loop for user ${userId}`);

  const intervalId = setInterval(async () => {
    try {
      await executeTradingStep(userId);
    } catch (error) {
      logger.error(`Trading loop error for user ${userId}:`, error.message);
    }
  }, TRADING_LOOP_INTERVAL);

  activeBots.set(userId, intervalId);
}

/**
 * Stop trading loop for a user
 */
function stopTradingLoop(userId) {
  const intervalId = activeBots.get(userId);
  if (intervalId) {
    clearInterval(intervalId);
    activeBots.delete(userId);
    logger.info(`Stopped trading loop for user ${userId}`);
  }
}

/**
 * Check if trading loop is running for a user
 */
function isTradingLoopRunning(userId) {
  return activeBots.has(userId);
}

// Stop every active loop at once — used by Telegram /stop command
export function stopAllBots() {
  const ids = [...activeBots.keys()];
  ids.forEach(stopTradingLoop);
  logger.info(`[BotService] All bots stopped (${ids.length} loops)`);
  return ids.length;
}

/**
 * Initialize bot trading service on startup
 * Resume trading for users who had active bots
 */
async function initializeBotService() {
  try {
    logger.info('Initializing bot trading service...');

    // Fetch all active bot configs
    const activeConfigs = await pb.collection('botConfig').getFullList({
      filter: 'isActive = true',
    });

    logger.info(`Found ${activeConfigs.length} active bot configurations`);

    // Resume trading loops for active bots
    for (const config of activeConfigs) {
      try {
        startTradingLoop(config.userId);
        logger.info(`Resumed trading loop for user ${config.userId}`);
      } catch (error) {
        logger.error(`Failed to resume trading loop for user ${config.userId}:`, error.message);
      }
    }

    logger.info('Bot trading service initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize bot trading service:', error.message);
  }
}

export {
  initializeBotService,
  startTradingLoop,
  stopTradingLoop,
  stopAllBots,
  isTradingLoopRunning,
  getBotState,
  saveBotState,
  executeTradingStep,
  logTrade,
  calculateEMA,
  calculateRSI,
};

export default {
  initializeBotService,
  startTradingLoop,
  stopTradingLoop,
  isTradingLoopRunning,
  getBotState,
  saveBotState,
  executeTradingStep,
  logTrade,
};