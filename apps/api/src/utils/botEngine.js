import 'dotenv/config';
import * as coinbase from './coinbase.js';
import {
  getBotConfig,
  getFirstOpenTrade,
  createTrade,
  updateTrade,
} from './pocketbase.js';
import {
  sendTradeNotification,
  sendBotStatusNotification,
  sendAlertNotification,
  sendCircuitBreakerAlert,
  sendConnectionErrorAlert,
} from './telegram.js';
import logger from './logger.js';

const botLoops = new Map();
const circuitBreakers = new Map();

// Calculate EMA (Exponential Moving Average)
function calculateEMA(prices, period) {
  if (prices.length < period) return null;
  
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  
  return ema;
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? -c : 0);
  
  const avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

// Fetch candle data from Coinbase
async function fetchCandles(productId, granularity, limit = 100) {
  const candles = await coinbase.getCandles(productId, granularity, limit);
  return candles;
}

// Check circuit breaker (volatility check)
function checkCircuitBreaker(userId, currentPrice, previousPrice) {
  const volatility = Math.abs((currentPrice - previousPrice) / previousPrice) * 100;
  
  if (volatility > 2) {
    const breaker = circuitBreakers.get(userId) || { blockedUntil: 0 };
    breaker.blockedUntil = Date.now() + 60000; // Block for 60 seconds
    circuitBreakers.set(userId, breaker);
    
    // Send circuit breaker alert
    sendCircuitBreakerAlert('BTC-USD', volatility).catch(err => {
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

// Main bot step function
async function runBotStep(userId) {
  const config = await getBotConfig(userId);
  const { strategy, symbol, stopLoss, takeProfit, allocation, candleGranularity } = config;
  
  // Fetch candle data
  const candles = await fetchCandles(symbol, candleGranularity, 100);
  const closePrices = candles.map(c => parseFloat(c.close));
  
  if (closePrices.length < 20) {
    return { executed: false, message: 'Insufficient candle data' };
  }
  
  // Calculate indicators
  const ema20 = calculateEMA(closePrices, 20);
  const rsi14 = calculateRSI(closePrices, 14);
  const currentPrice = closePrices[closePrices.length - 1];
  const previousPrice = closePrices[closePrices.length - 2];
  
  // Check circuit breaker
  if (checkCircuitBreaker(userId, currentPrice, previousPrice)) {
    return { executed: false, message: 'Circuit breaker active - high volatility detected' };
  }
  
  // Fetch current position
  const openTrade = await getFirstOpenTrade(userId);
  const hasOpenPosition = openTrade !== null;
  
  let tradeId = null;
  let side = null;
  let quantity = null;
  let executedPrice = null;
  let pnl = null;
  
  // BUY SIGNAL
  if (!hasOpenPosition && currentPrice > ema20 && previousPrice < ema20 && rsi14 >= 40 && rsi14 <= 58) {
    try {
      const account = await coinbase.getAccount();
      const balance = parseFloat(account.available);
      
      // Calculate order size
      const orderSize = balance * (allocation / 100);
      quantity = orderSize / currentPrice;
      
      // Execute real market order if Coinbase is configured
      const order = await coinbase.createMarketOrder(symbol, 'BUY', orderSize);
      executedPrice = parseFloat(order.average_filled_price) || currentPrice;
      side = 'BUY';
      
      // Save trade to PocketBase
      const newTrade = await createTrade({
        userId,
        symbol,
        side: 'BUY',
        quantity,
        entryPrice: executedPrice,
        exitPrice: null,
        stopLoss,
        takeProfit,
        status: 'OPEN',
        pnl: 0,
        timestamp: new Date(),
        orderId: order.order_id,
      });
      
      tradeId = newTrade.id;
      
      // Log trade execution
      logger.info(`BUY order executed: ${symbol} ${quantity.toFixed(8)} @ $${executedPrice.toFixed(2)}`);
      
      // Send Telegram notification
      sendTradeNotification({
        symbol,
        side: 'BUY',
        quantity,
        price: executedPrice,
        timestamp: new Date(),
      }).catch(err => {
        logger.error('Failed to send trade notification:', err.message);
      });
    } catch (error) {
      logger.error('Failed to execute BUY order:', error.message);
      sendConnectionErrorAlert('Coinbase', error.message).catch(err => {
        logger.error('Failed to send error alert:', err.message);
      });
    }
  }
  // SELL SIGNAL
  else if (hasOpenPosition) {
    const entryPrice = openTrade.entryPrice;
    const tradeQuantity = openTrade.quantity;
    
    let shouldSell = false;
    let reason = '';
    
    // Check sell conditions
    if (currentPrice < ema20) {
      shouldSell = true;
      reason = 'Price below EMA20';
    } else if (rsi14 > 75) {
      shouldSell = true;
      reason = 'RSI overbought';
    } else if (currentPrice <= entryPrice * (1 - stopLoss / 100)) {
      shouldSell = true;
      reason = 'Stop loss hit';
    } else if (currentPrice >= entryPrice * (1 + takeProfit / 100)) {
      shouldSell = true;
      reason = 'Take profit hit';
    }
    
    if (shouldSell) {
      try {
        // Execute real market order if Coinbase is configured
        const order = await coinbase.createMarketOrder(symbol, 'SELL', tradeQuantity);
        executedPrice = parseFloat(order.average_filled_price) || currentPrice;
        side = 'SELL';
        pnl = (executedPrice - entryPrice) * tradeQuantity;
        
        // Update trade in PocketBase
        await updateTrade(openTrade.id, {
          exitPrice: executedPrice,
          status: 'CLOSED',
          pnl,
          closedAt: new Date(),
          closeReason: reason,
          orderId: order.order_id,
        });
        
        tradeId = openTrade.id;
        
        // Log trade execution
        logger.info(`SELL order executed: ${symbol} ${tradeQuantity.toFixed(8)} @ $${executedPrice.toFixed(2)} | P&L: $${pnl.toFixed(2)}`);
        
        // Send Telegram notification
        sendTradeNotification({
          symbol,
          side: 'SELL',
          quantity: tradeQuantity,
          price: executedPrice,
          timestamp: new Date(),
          pnl,
        }).catch(err => {
          logger.error('Failed to send trade notification:', err.message);
        });
      } catch (error) {
        logger.error('Failed to execute SELL order:', error.message);
        sendConnectionErrorAlert('Coinbase', error.message).catch(err => {
          logger.error('Failed to send error alert:', err.message);
        });
      }
    }
  }
  
  return {
    executed: side !== null,
    tradeId,
    side,
    symbol,
    quantity,
    price: executedPrice,
    pnl,
    message: side ? `${side} order executed` : 'No signal',
  };
}

// Start bot loop for user
function startBotLoop(userId) {
  if (botLoops.has(userId)) {
    return; // Already running
  }
  
  const intervalId = setInterval(async () => {
    try {
      await runBotStep(userId);
    } catch (error) {
      logger.error(`Bot step error for user ${userId}:`, error.message);
      sendAlertNotification('error', `Bot step failed: ${error.message}`).catch(err => {
        logger.error('Failed to send alert:', err.message);
      });
    }
  }, 60000); // Run every 60 seconds
  
  botLoops.set(userId, intervalId);
}

// Stop bot loop for user
function stopBotLoop(userId) {
  const intervalId = botLoops.get(userId);
  if (intervalId) {
    clearInterval(intervalId);
    botLoops.delete(userId);
  }
}

// Check if bot is running
function isBotRunning(userId) {
  return botLoops.has(userId);
}

export {
  runBotStep,
  startBotLoop,
  stopBotLoop,
  isBotRunning,
  calculateEMA,
  calculateRSI,
  fetchCandles,
};