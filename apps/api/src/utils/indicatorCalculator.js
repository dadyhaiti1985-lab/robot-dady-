/**
 * Technical Indicator Calculator
 * Pure functions for all technical indicators used by the advanced strategy engine.
 */

export function calculateRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) return null;
  const changes = [];
  for (let i = 1; i < prices.length; i++) changes.push(prices[i] - prices[i - 1]);
  let gains = 0, losses = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) gains += changes[i];
    else losses += Math.abs(changes[i]);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + (changes[i] > 0 ? changes[i] : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (changes[i] < 0 ? Math.abs(changes[i]) : 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

export function calculateEMA(prices, period) {
  if (!prices || prices.length < period) return null;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
  return parseFloat(ema.toFixed(8));
}

export function calculateSMA(prices, period) {
  if (!prices || prices.length < period) return null;
  const slice = prices.slice(-period);
  return parseFloat((slice.reduce((a, b) => a + b, 0) / period).toFixed(8));
}

export function calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
  if (!prices || prices.length < slow + signal) return null;
  const fastEMA = calculateEMA(prices, fast);
  const slowEMA = calculateEMA(prices, slow);
  if (fastEMA === null || slowEMA === null) return null;
  const macdLine = fastEMA - slowEMA;

  // Build MACD series for signal line
  const macdSeries = [];
  for (let i = slow - 1; i < prices.length; i++) {
    const f = calculateEMA(prices.slice(0, i + 1), fast);
    const s = calculateEMA(prices.slice(0, i + 1), slow);
    if (f !== null && s !== null) macdSeries.push(f - s);
  }
  const signalLine = calculateEMA(macdSeries, signal);
  const histogram = signalLine !== null ? macdLine - signalLine : null;

  // Detect cross: compare last two MACD values vs signal series
  let cross = 'NONE';
  if (macdSeries.length >= 2 && macdSeries[macdSeries.length - 1] > 0 && macdSeries[macdSeries.length - 2] <= 0) cross = 'BULLISH';
  if (macdSeries.length >= 2 && macdSeries[macdSeries.length - 1] < 0 && macdSeries[macdSeries.length - 2] >= 0) cross = 'BEARISH';

  return {
    line: parseFloat(macdLine.toFixed(8)),
    signal: signalLine !== null ? parseFloat(signalLine.toFixed(8)) : null,
    histogram: histogram !== null ? parseFloat(histogram.toFixed(8)) : null,
    cross,
  };
}

export function calculateADX(highs, lows, closes, period = 14) {
  if (!highs || highs.length < period + 1) return null;
  const trueRanges = [], plusDM = [], minusDM = [];
  for (let i = 1; i < closes.length; i++) {
    const high = highs[i], low = lows[i], prevClose = closes[i - 1], prevHigh = highs[i - 1], prevLow = lows[i - 1];
    trueRanges.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
    const up = high - prevHigh, down = prevLow - low;
    plusDM.push(up > down && up > 0 ? up : 0);
    minusDM.push(down > up && down > 0 ? down : 0);
  }

  function smooth(arr, p) {
    let s = arr.slice(0, p).reduce((a, b) => a + b, 0);
    const result = [s];
    for (let i = p; i < arr.length; i++) { s = s - s / p + arr[i]; result.push(s); }
    return result;
  }

  const atr14 = smooth(trueRanges, period);
  const pDM14 = smooth(plusDM, period);
  const mDM14 = smooth(minusDM, period);

  const dx = [];
  for (let i = 0; i < atr14.length; i++) {
    const pDI = atr14[i] > 0 ? 100 * pDM14[i] / atr14[i] : 0;
    const mDI = atr14[i] > 0 ? 100 * mDM14[i] / atr14[i] : 0;
    const sum = pDI + mDI;
    dx.push(sum > 0 ? 100 * Math.abs(pDI - mDI) / sum : 0);
  }

  const adx = dx.length >= period ? dx.slice(-period).reduce((a, b) => a + b, 0) / period : null;
  return adx !== null ? parseFloat(adx.toFixed(2)) : null;
}

export function calculateATR(highs, lows, closes, period = 14) {
  if (!closes || closes.length < period + 1) return null;
  const tr = [];
  for (let i = 1; i < closes.length; i++) {
    tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  return parseFloat((tr.slice(-period).reduce((a, b) => a + b, 0) / period).toFixed(8));
}

export function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (!prices || prices.length < period) return null;
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
  const std = Math.sqrt(variance);
  return {
    upper: parseFloat((mean + stdDev * std).toFixed(8)),
    middle: parseFloat(mean.toFixed(8)),
    lower: parseFloat((mean - stdDev * std).toFixed(8)),
    bandwidth: parseFloat(((4 * stdDev * std) / mean * 100).toFixed(2)),
    percentB: parseFloat(((prices[prices.length - 1] - (mean - stdDev * std)) / (4 * stdDev * std || 1)).toFixed(4)),
  };
}

export function calculateVWAP(ohlc) {
  // ohlc: array of { high, low, close, volume }
  if (!ohlc || ohlc.length === 0) return null;
  let cumTP = 0, cumVol = 0;
  for (const c of ohlc) {
    const tp = (c.high + c.low + c.close) / 3;
    cumTP += tp * (c.volume || 1);
    cumVol += (c.volume || 1);
  }
  return cumVol > 0 ? parseFloat((cumTP / cumVol).toFixed(8)) : null;
}

export function calculateFibonacciLevels(high, low) {
  const diff = high - low;
  return {
    level_0: parseFloat(high.toFixed(8)),
    level_236: parseFloat((high - diff * 0.236).toFixed(8)),
    level_382: parseFloat((high - diff * 0.382).toFixed(8)),
    level_500: parseFloat((high - diff * 0.5).toFixed(8)),
    level_618: parseFloat((high - diff * 0.618).toFixed(8)),
    level_786: parseFloat((high - diff * 0.786).toFixed(8)),
    level_1000: parseFloat(low.toFixed(8)),
  };
}

export function calculateSupportResistance(prices, sensitivity = 0.01) {
  if (!prices || prices.length < 20) return { support: [], resistance: [] };
  const window = 5;
  const supports = [], resistances = [];
  for (let i = window; i < prices.length - window; i++) {
    const slice = prices.slice(i - window, i + window + 1);
    if (prices[i] === Math.min(...slice)) supports.push(prices[i]);
    if (prices[i] === Math.max(...slice)) resistances.push(prices[i]);
  }
  const cluster = (levels) => {
    const sorted = [...new Set(levels)].sort((a, b) => a - b);
    const result = [];
    let group = sorted.length ? [sorted[0]] : [];
    for (let i = 1; i < sorted.length; i++) {
      if ((sorted[i] - group[group.length - 1]) / group[group.length - 1] < sensitivity) group.push(sorted[i]);
      else { result.push(group.reduce((a, b) => a + b, 0) / group.length); group = [sorted[i]]; }
    }
    if (group.length) result.push(group.reduce((a, b) => a + b, 0) / group.length);
    return result.slice(0, 5).map(v => parseFloat(v.toFixed(8)));
  };
  return { support: cluster(supports), resistance: cluster(resistances) };
}

export function calculateVolumeMA(volumes, period = 20) {
  if (!volumes || volumes.length < period) return null;
  const slice = volumes.slice(-period);
  return parseFloat((slice.reduce((a, b) => a + b, 0) / period).toFixed(2));
}
