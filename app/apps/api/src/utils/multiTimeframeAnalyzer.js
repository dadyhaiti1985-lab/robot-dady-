import 'dotenv/config';
import axios from 'axios';
import logger from './logger.js';

const COINBASE_API_URL = 'https://api.coinbase.com/api/v1';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Fetch OHLCV candles from Coinbase API with retry logic and error handling
 */
async function fetchCandles(productId, granularity, limit = 100) {
  // Validate product_id format (should be 'BTC-USD', not 'BTC')
  if (!productId || !productId.includes('-')) {
    throw new Error(`Invalid product_id format: ${productId}. Expected format: 'BTC-USD'`);
  }

  // Validate timeframe conversion
  const validGranularities = [60, 300, 900, 3600, 14400, 21600, 86400];
  if (!validGranularities.includes(granularity)) {
    throw new Error(`Invalid granularity: ${granularity}. Valid values: ${validGranularities.join(', ')}`);
  }

  const startTime = Math.floor(Date.now() / 1000) - granularity * limit;
  const endTime = Math.floor(Date.now() / 1000);
  const url = `${COINBASE_API_URL}/products/${productId}/candles`;
  const params = {
    start_time: startTime,
    end_time: endTime,
    granularity,
  };

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.debug(`Fetching candles (attempt ${attempt}/${MAX_RETRIES}): ${productId} granularity=${granularity}s limit=${limit}`);
      logger.debug(`URL: ${url}`);
      logger.debug(`Params: ${JSON.stringify(params)}`);

      const response = await axios.get(url, { params });

      if (!response.data || !response.data.candles) {
        throw new Error(`Invalid response format: missing candles data`);
      }

      logger.debug(`Successfully fetched ${response.data.candles.length} candles for ${productId}`);

      // API returns candles in reverse chronological order, so reverse to get oldest first
      return response.data.candles.reverse().map(candle => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
      }));
    } catch (error) {
      lastError = error;
      const statusCode = error.response?.status || 'unknown';
      const errorMessage = error.response?.data?.message || error.message;

      logger.warn(
        `Candle fetch failed (attempt ${attempt}/${MAX_RETRIES}): ` +
        `asset=${productId}, granularity=${granularity}, ` +
        `status=${statusCode}, error=${errorMessage}`
      );

      if (attempt < MAX_RETRIES) {
        logger.debug(`Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  // All retries exhausted
  logger.error(
    `Failed to fetch candles after ${MAX_RETRIES} retries: ` +
    `asset=${productId}, granularity=${granularity}, ` +
    `error=${lastError?.message}`
  );

  throw lastError || new Error(`Failed to fetch candles for ${productId}`);
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
 * Calculate MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(prices) {
  if (prices.length < 26) return null;

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  if (!ema12 || !ema26) return null;

  const macdLine = ema12 - ema26;

  // Calculate signal line (9-period EMA of MACD)
  const macdValues = [];
  for (let i = 25; i < prices.length; i++) {
    const e12 = calculateEMA(prices.slice(0, i + 1), 12);
    const e26 = calculateEMA(prices.slice(0, i + 1), 26);
    macdValues.push(e12 - e26);
  }

  const signalLine = calculateEMA(macdValues, 9);
  const histogram = macdLine - (signalLine || 0);

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
  };
}

/**
 * Calculate Bollinger Bands
 */
function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return null;

  const recentPrices = prices.slice(-period);
  const sma = recentPrices.reduce((a, b) => a + b) / period;

  const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const std = Math.sqrt(variance);

  return {
    upper: sma + std * stdDev,
    middle: sma,
    lower: sma - std * stdDev,
  };
}

/**
 * Check entry signal conditions
 */
function checkEntrySignal(prices, rsi, ema9, ema21, ema50, ema200, macd, bb) {
  const currentPrice = prices[prices.length - 1];
  let alignedIndicators = 0;

  // RSI in 30-70 range (not overbought/oversold)
  if (rsi >= 30 && rsi <= 70) {
    alignedIndicators++;
  }

  // EMA alignment: price > EMA9 > EMA21 > EMA50
  if (currentPrice > ema9 && ema9 > ema21 && ema21 > ema50) {
    alignedIndicators++;
  }

  // MACD: histogram positive and signal crossover
  if (macd && macd.histogram > 0) {
    alignedIndicators++;
  }

  // Bollinger Bands: price near lower band (within 20% of lower band)
  if (bb && currentPrice <= bb.lower + (bb.middle - bb.lower) * 0.2) {
    alignedIndicators++;
  }

  const signalStrength = (alignedIndicators / 4) * 100;
  const entrySignal = alignedIndicators >= 3;

  return {
    entrySignal,
    signalStrength,
    alignedIndicators,
  };
}

/**
 * Check exit signal conditions
 */
function checkExitSignal(prices, rsi, ema9, ema21, macd) {
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 2];

  // EMA9 crosses below EMA21 (trend reversal)
  if (ema9 < ema21 && previousPrice > prices[prices.length - 3]) {
    return { exitSignal: true, reason: 'EMA9 crossed below EMA21' };
  }

  // RSI divergence (overbought)
  if (rsi > 75) {
    return { exitSignal: true, reason: 'RSI overbought' };
  }

  // MACD histogram turned negative
  if (macd && macd.histogram < 0) {
    return { exitSignal: true, reason: 'MACD histogram negative' };
  }

  return { exitSignal: false, reason: null };
}

/**
 * Get default/neutral analysis object
 */
function getDefaultAnalysis(asset, timeframe) {
  return {
    asset,
    timeframe,
    rsi: null,
    ema9: null,
    ema21: null,
    ema50: null,
    ema200: null,
    macd: null,
    macdSignal: null,
    macdHistogram: null,
    bbUpper: null,
    bbMiddle: null,
    bbLower: null,
    entrySignal: false,
    exitSignal: false,
    signalStrength: 50, // Neutral signal
    alignedIndicators: 0,
    exitReason: null,
    timestamp: new Date().toISOString(),
    isFallback: true,
  };
}

/**
 * Analyze multiple timeframes for an asset
 * Returns neutral analysis on failure instead of throwing
 */
export async function analyzeMultiTimeframe(asset) {
  const timeframes = {
    '15m': 900,
    '4h': 14400,
    '1D': 86400,
  };

  const productId = `${asset}-USD`;
  const results = {};

  for (const [timeframeLabel, granularity] of Object.entries(timeframes)) {
    try {
      const candles = await fetchCandles(productId, granularity, 100);
      const closePrices = candles.map(c => c.close);

      const rsi = calculateRSI(closePrices, 14);
      const ema9 = calculateEMA(closePrices, 9);
      const ema21 = calculateEMA(closePrices, 21);
      const ema50 = calculateEMA(closePrices, 50);
      const ema200 = calculateEMA(closePrices, 200);
      const macd = calculateMACD(closePrices);
      const bb = calculateBollingerBands(closePrices, 20, 2);

      const { entrySignal, signalStrength, alignedIndicators } = checkEntrySignal(
        closePrices,
        rsi,
        ema9,
        ema21,
        ema50,
        ema200,
        macd,
        bb
      );

      const { exitSignal, reason: exitReason } = checkExitSignal(closePrices, rsi, ema9, ema21, macd);

      results[timeframeLabel] = {
        asset,
        timeframe: timeframeLabel,
        rsi: rsi ? parseFloat(rsi.toFixed(2)) : null,
        ema9: ema9 ? parseFloat(ema9.toFixed(2)) : null,
        ema21: ema21 ? parseFloat(ema21.toFixed(2)) : null,
        ema50: ema50 ? parseFloat(ema50.toFixed(2)) : null,
        ema200: ema200 ? parseFloat(ema200.toFixed(2)) : null,
        macd: macd ? parseFloat(macd.macd.toFixed(2)) : null,
        macdSignal: macd ? parseFloat(macd.signal.toFixed(2)) : null,
        macdHistogram: macd ? parseFloat(macd.histogram.toFixed(2)) : null,
        bbUpper: bb ? parseFloat(bb.upper.toFixed(2)) : null,
        bbMiddle: bb ? parseFloat(bb.middle.toFixed(2)) : null,
        bbLower: bb ? parseFloat(bb.lower.toFixed(2)) : null,
        entrySignal,
        exitSignal,
        signalStrength: parseFloat(signalStrength.toFixed(2)),
        alignedIndicators,
        exitReason,
        timestamp: new Date().toISOString(),
        isFallback: false,
      };
    } catch (error) {
      logger.error(
        `Analysis failed for ${asset} ${timeframeLabel}: ${error.message}`
      );

      // Return neutral/default analysis instead of throwing
      results[timeframeLabel] = getDefaultAnalysis(asset, timeframeLabel);
    }
  }

  return results;
}

/**
 * Calculate weighted signal strength across timeframes
 */
export function calculateWeightedSignalStrength(analysisResults, weights = { '15m': 0.3, '4h': 0.4, '1D': 0.3 }) {
  let totalWeight = 0;
  let weightedSignal = 0;

  for (const [timeframe, weight] of Object.entries(weights)) {
    if (analysisResults[timeframe]) {
      weightedSignal += analysisResults[timeframe].signalStrength * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? parseFloat((weightedSignal / totalWeight).toFixed(2)) : 0;
}

export default {
  analyzeMultiTimeframe,
  calculateWeightedSignalStrength,
  fetchCandles,
  calculateRSI,
  calculateEMA,
  calculateMACD,
  calculateBollingerBands,
};