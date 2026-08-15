/**
 * Market Data Web Worker
 * Performs heavy technical analysis calculations off the main thread.
 * No DOM access is used here.
 */

// --- Technical Indicator Calculations ---

function calcEMA(prices, period) {
  if (prices.length < period) return null;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcSMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  const recent = changes.slice(-period);
  let gains = 0, losses = 0;
  recent.forEach(c => { if (c > 0) gains += c; else losses += Math.abs(c); });
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcMACD(prices, fast = 12, slow = 26, signal = 9) {
  const fastEMA = calcEMA(prices, fast);
  const slowEMA = calcEMA(prices, slow);
  if (fastEMA === null || slowEMA === null) return null;
  const macdLine = fastEMA - slowEMA;

  // Signal line: EMA of macd values over last (slow + signal) prices
  const macdValues = [];
  const start = Math.max(0, prices.length - (slow + signal + 10));
  for (let i = start + slow - 1; i < prices.length; i++) {
    const f = calcEMA(prices.slice(0, i + 1), fast);
    const s = calcEMA(prices.slice(0, i + 1), slow);
    if (f !== null && s !== null) macdValues.push(f - s);
  }
  const signalLine = calcEMA(macdValues, signal);
  const histogram = signalLine !== null ? macdLine - signalLine : null;
  return { line: macdLine, signal: signalLine, histogram };
}

function calcBollingerBands(prices, period = 20, stdMult = 2) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
  const std = Math.sqrt(variance);
  return { upper: mean + stdMult * std, middle: mean, lower: mean - stdMult * std, bandwidth: (4 * stdMult * std) / mean };
}

function calcATR(highs, lows, closes, period = 14) {
  if (closes.length < period + 1) return null;
  const trueRanges = [];
  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }
  return calcSMA(trueRanges, period);
}

function calcVolatility(prices) {
  if (prices.length < 2) return 0;
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(252) * 100; // annualized %
}

function detectSupportResistance(prices, sensitivity = 0.01) {
  if (prices.length < 20) return { support: [], resistance: [] };
  const supports = [];
  const resistances = [];
  const window = 5;
  for (let i = window; i < prices.length - window; i++) {
    const slice = prices.slice(i - window, i + window + 1);
    const min = Math.min(...slice);
    const max = Math.max(...slice);
    if (prices[i] === min) supports.push(prices[i]);
    if (prices[i] === max) resistances.push(prices[i]);
  }
  // Cluster nearby levels
  const cluster = (levels) => {
    const result = [];
    const sorted = [...new Set(levels)].sort((a, b) => a - b);
    let group = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      if ((sorted[i] - group[group.length - 1]) / group[group.length - 1] < sensitivity) {
        group.push(sorted[i]);
      } else {
        result.push(group.reduce((a, b) => a + b, 0) / group.length);
        group = [sorted[i]];
      }
    }
    if (group.length) result.push(group.reduce((a, b) => a + b, 0) / group.length);
    return result.slice(0, 5);
  };
  return {
    support: cluster(supports),
    resistance: cluster(resistances),
  };
}

function detectTrend(prices, ema20, ema50) {
  if (!ema20 || !ema50) return 'NEUTRAL';
  const last = prices[prices.length - 1];
  if (ema20 > ema50 && last > ema20) return 'BULLISH';
  if (ema20 < ema50 && last < ema20) return 'BEARISH';
  return 'NEUTRAL';
}

function analyzeVolume(volumes) {
  if (!volumes || volumes.length < 5) return { trend: 'NEUTRAL', ratio: 1 };
  const recent = volumes.slice(-5);
  const older = volumes.slice(-20, -5);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgOlder = older.length ? older.reduce((a, b) => a + b, 0) / older.length : avgRecent;
  const ratio = avgOlder > 0 ? avgRecent / avgOlder : 1;
  return { trend: ratio > 1.2 ? 'INCREASING' : ratio < 0.8 ? 'DECREASING' : 'NEUTRAL', ratio };
}

// --- Main message handler ---

self.onmessage = function (e) {
  const msg = e.data || {};
  const type = msg.type;

  if (type === 'ANALYZE_MARKET') {
    // Support both Transferable ArrayBuffer format and legacy object format
    let prices, highs, lows, volumes, timestamps;
    if (msg.prices instanceof ArrayBuffer) {
      prices = Array.from(new Float64Array(msg.prices));
      highs = msg.highs instanceof ArrayBuffer ? Array.from(new Float64Array(msg.highs)) : prices;
      lows = msg.lows instanceof ArrayBuffer ? Array.from(new Float64Array(msg.lows)) : prices;
      volumes = msg.volumes instanceof ArrayBuffer ? Array.from(new Float64Array(msg.volumes)) : [];
      timestamps = msg.timestamps instanceof ArrayBuffer ? Array.from(new Float64Array(msg.timestamps)) : [];
    } else {
      const data = msg.data || {};
      prices = data.prices || [];
      highs = data.highs || [];
      lows = data.lows || [];
      volumes = data.volumes || [];
      timestamps = data.timestamps || [];
    }
    const start = performance.now();

    try {
      const closes = prices;
      const ema9 = calcEMA(closes, 9);
      const ema20 = calcEMA(closes, 20);
      const ema50 = calcEMA(closes, 50);
      const ema200 = calcEMA(closes, 200);
      const rsi = calcRSI(closes, 14);
      const macd = calcMACD(closes);
      const bb = calcBollingerBands(closes, 20);
      const atr = calcATR(highs.length ? highs : closes, lows.length ? lows : closes, closes);
      const volatility = calcVolatility(closes);
      const { support: supportLevels, resistance: resistanceLevels } = detectSupportResistance(closes);
      const trend = detectTrend(closes, ema20, ema50);
      const volumeAnalysis = analyzeVolume(volumes);
      const processingMs = performance.now() - start;

      self.postMessage({
        type: 'ANALYSIS_COMPLETE',
        data: {
          rsi: rsi !== null ? parseFloat(rsi.toFixed(2)) : null,
          macd,
          ema9,
          ema20,
          ema50,
          ema200,
          bollingerBands: bb,
          atr,
          volatility: parseFloat(volatility.toFixed(2)),
          supportLevels,
          resistanceLevels,
          trend,
          volumeAnalysis,
          priceCount: closes.length,
          processingMs: parseFloat(processingMs.toFixed(2)),
          timestamp: timestamps[timestamps.length - 1] || Date.now(),
        },
      });
    } catch (err) {
      self.postMessage({ type: 'ANALYSIS_ERROR', error: err.message });
    }
  } else if (type === 'PING') {
    self.postMessage({ type: 'PONG' });
  }
};
