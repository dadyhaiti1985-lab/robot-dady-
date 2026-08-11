import 'dotenv/config';
import logger from './logger.js';

/**
 * Check entry signal conditions
 */
function checkEntryConditions(prices, rsi, ema9, ema21, ema50, macd, bb) {
  const currentPrice = prices[prices.length - 1];
  const signals = [];
  let alignedCount = 0;

  // Signal 1: RSI in 30-70 range (not overbought/oversold)
  if (rsi >= 30 && rsi <= 70) {
    signals.push('rsi');
    alignedCount++;
  }

  // Signal 2: EMA alignment (price > EMA9 > EMA21 > EMA50)
  if (currentPrice > ema9 && ema9 > ema21 && ema21 > ema50) {
    signals.push('ema');
    alignedCount++;
  }

  // Signal 3: MACD histogram positive + signal crossover
  if (macd && macd.histogram > 0) {
    signals.push('macd');
    alignedCount++;
  }

  // Signal 4: Bollinger Bands price near lower band (within 20% of lower band)
  if (bb && currentPrice <= bb.lower + (bb.middle - bb.lower) * 0.2) {
    signals.push('bb');
    alignedCount++;
  }

  const signalStrength = (alignedCount / 4) * 100;
  const entrySignal = alignedCount >= 3 && signalStrength >= 60;

  return {
    entrySignal,
    signalStrength: parseFloat(signalStrength.toFixed(2)),
    alignedCount,
    signals,
  };
}

/**
 * Check exit signal conditions
 */
function checkExitConditions(prices, rsi, ema9, ema21, macd, entryPrice, currentPrice, timeInTrade) {
  const signals = [];
  let shouldExit = false;
  let reason = '';

  // Exit 1: EMA9 crosses below EMA21 (trend reversal for long)
  if (ema9 < ema21) {
    signals.push('ema_crossover');
    shouldExit = true;
    reason = 'EMA9 crossed below EMA21';
  }

  // Exit 2: RSI divergence (overbought)
  if (rsi > 75) {
    signals.push('rsi_overbought');
    shouldExit = true;
    reason = 'RSI overbought (>75)';
  }

  // Exit 3: MACD histogram turned negative
  if (macd && macd.histogram < 0) {
    signals.push('macd_negative');
    shouldExit = true;
    reason = 'MACD histogram negative';
  }

  // Exit 4: Time-based exit (no movement > 0.5% for 4 hours)
  // This would be checked externally based on time tracking
  if (timeInTrade && timeInTrade > 4 * 60 * 60 * 1000) {
    // 4 hours in milliseconds
    const priceMovement = Math.abs((currentPrice - entryPrice) / entryPrice) * 100;
    if (priceMovement <= 0.5) {
      signals.push('time_based');
      shouldExit = true;
      reason = 'No movement >0.5% for 4 hours';
    }
  }

  return {
    exitSignal: shouldExit,
    signals,
    reason,
  };
}

/**
 * Generate entry signal
 */
export function generateEntrySignal(analysisData) {
  const { prices, rsi, ema9, ema21, ema50, macd, bb } = analysisData;

  if (!prices || prices.length === 0) {
    throw new Error('Price data is required');
  }

  const { entrySignal, signalStrength, alignedCount, signals } = checkEntryConditions(
    prices,
    rsi,
    ema9,
    ema21,
    ema50,
    macd,
    bb
  );

  let signalType = 'confluence';
  if (signals.length === 1) {
    signalType = signals[0];
  }

  const reason = entrySignal
    ? `Entry signal: ${signals.join(', ')} aligned (${alignedCount}/4)`
    : `Insufficient signals: ${alignedCount}/4 aligned (need 3+)`;

  return {
    entrySignal: entrySignal && signalStrength >= 60,
    signalType,
    signalStrength: parseFloat(signalStrength.toFixed(2)),
    alignedCount,
    reason,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate exit signal
 */
export function generateExitSignal(analysisData, entryPrice, currentPrice, timeInTrade = 0) {
  const { prices, rsi, ema9, ema21, macd } = analysisData;

  if (!prices || prices.length === 0) {
    throw new Error('Price data is required');
  }

  const { exitSignal, signals, reason } = checkExitConditions(
    prices,
    rsi,
    ema9,
    ema21,
    macd,
    entryPrice,
    currentPrice,
    timeInTrade
  );

  let signalType = 'none';
  if (signals.length > 0) {
    signalType = signals[0];
  }

  return {
    exitSignal,
    signalType,
    reason,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate comprehensive signal with entry and exit
 */
export function generateSignal(analysisData, entryPrice = null, currentPrice = null, timeInTrade = 0) {
  const entrySignalData = generateEntrySignal(analysisData);

  let exitSignalData = {
    exitSignal: false,
    signalType: 'none',
    reason: 'No exit signal',
    timestamp: new Date().toISOString(),
  };

  if (entryPrice && currentPrice) {
    exitSignalData = generateExitSignal(analysisData, entryPrice, currentPrice, timeInTrade);
  }

  return {
    entrySignal: entrySignalData.entrySignal,
    exitSignal: exitSignalData.exitSignal,
    entrySignalType: entrySignalData.signalType,
    exitSignalType: exitSignalData.signalType,
    signalStrength: entrySignalData.signalStrength,
    entryReason: entrySignalData.reason,
    exitReason: exitSignalData.reason,
    timestamp: new Date().toISOString(),
  };
}

export default {
  generateEntrySignal,
  generateExitSignal,
  generateSignal,
};