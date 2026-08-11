/**
 * Oracle Trader Pro Strategy Engine
 * Direct JavaScript port of the Python OracleTraderPro class.
 *
 * BUY:  EMA20>EMA50, RSI 40-65, MACD bullish, ADX>25, volume confirm, price>VWAP, AI≥0.90
 * SELL: EMA20<EMA50, RSI 35-60, MACD bearish, ADX>25, volume confirm, price<VWAP, AI≥0.90
 */
import {
  calculateEMA,
  calculateSMA,
  calculateRSI,
  calculateMACD,
  calculateADX,
  calculateATR,
  calculateVWAP,
} from '../utils/indicatorCalculator.js';

export class OracleTraderProStrategy {
  /**
   * @param {number} riskPerTradePct - e.g. 0.02 = 2% risk per trade
   * @param {number} rrRatio         - Risk/Reward ratio, e.g. 2.0 = 1:2
   */
  constructor(riskPerTradePct = 0.02, rrRatio = 2.0) {
    this.riskPct = riskPerTradePct;
    this.rrRatio = rrRatio;
  }

  /**
   * Evaluate OHLCV data and return a trading signal.
   *
   * @param {Array<{open,high,low,close,volume}>} ohlcv - at least 60 candles
   * @param {number} aiConfidence - 0.0 to 1.0 from ML/AI model (default 0.95)
   * @param {number} accountBalance - for position sizing (default 10000)
   * @returns {{ signal, price, stopLoss, takeProfit, positionSize, confidence, riskRewardRatio, indicators, conditions }}
   */
  evaluate(ohlcv, aiConfidence = 0.95, accountBalance = 10000) {
    if (!ohlcv || ohlcv.length < 60) {
      return { signal: 'HOLD', reason: 'Insufficient candle data (need ≥60)', price: null, confidence: aiConfidence };
    }

    const close  = ohlcv.map(c => Number(c.close));
    const high   = ohlcv.map(c => Number(c.high));
    const low    = ohlcv.map(c => Number(c.low));
    const volume = ohlcv.map(c => Number(c.volume || 0));

    // ── Indicators ──────────────────────────────────────────────────────────
    const emaFast   = calculateEMA(close, 20);
    const emaSlow   = calculateEMA(close, 50);
    const rsi       = calculateRSI(close, 14);
    const macd      = calculateMACD(close);
    const adx       = calculateADX(high, low, close, 14);
    const atr       = calculateATR(high, low, close, 14);
    const vwapVal   = calculateVWAP(ohlcv.map(c => ({ high: Number(c.high), low: Number(c.low), close: Number(c.close), volume: Number(c.volume || 1) })));
    const volSMA    = calculateSMA(volume, 20);

    const currentPrice = close[close.length - 1];
    const currentVol   = volume[volume.length - 1];

    const indicators = { emaFast, emaSlow, rsi, macd, adx, atr, vwap: vwapVal, volSMA };

    // ── BUY conditions ───────────────────────────────────────────────────────
    const buyConditions = {
      emaUptrend:      emaFast !== null && emaSlow !== null && emaFast > emaSlow,
      rsiHealthy:      rsi !== null && rsi >= 40 && rsi <= 65,
      macdBullish:     macd !== null && macd.line > (macd.signal ?? 0),
      adxStrong:       adx !== null && adx > 25,
      volumeConfirm:   volSMA !== null && currentVol > volSMA,
      priceAboveVWAP:  vwapVal !== null && currentPrice > vwapVal,
      aiFilter:        aiConfidence >= 0.90,
    };

    // ── SELL conditions ──────────────────────────────────────────────────────
    const sellConditions = {
      emaDowntrend:    emaFast !== null && emaSlow !== null && emaFast < emaSlow,
      rsiHealthy:      rsi !== null && rsi >= 35 && rsi <= 60,
      macdBearish:     macd !== null && macd.line < (macd.signal ?? 0),
      adxStrong:       adx !== null && adx > 25,
      volumeConfirm:   volSMA !== null && currentVol > volSMA,
      priceBelowVWAP:  vwapVal !== null && currentPrice < vwapVal,
      aiFilter:        aiConfidence >= 0.90,
    };

    const allBuy  = Object.values(buyConditions).every(Boolean);
    const allSell = Object.values(sellConditions).every(Boolean);

    // ── Signal execution ────────────────────────────────────────────────────
    if (allBuy) {
      const stopLoss   = parseFloat((currentPrice - atr * 2).toFixed(8));
      const takeProfit = parseFloat((currentPrice + atr * 2 * this.rrRatio).toFixed(8));
      const positionSize = this._positionSize(currentPrice, stopLoss, accountBalance);

      return {
        signal: 'BUY',
        price: currentPrice,
        stopLoss,
        takeProfit,
        positionSize,
        confidence: aiConfidence,
        riskRewardRatio: this.rrRatio,
        riskAmount: parseFloat((accountBalance * this.riskPct).toFixed(2)),
        indicators,
        conditions: buyConditions,
        passedConditions: Object.values(buyConditions).filter(Boolean).length,
        totalConditions: Object.keys(buyConditions).length,
      };
    }

    if (allSell) {
      const stopLoss   = parseFloat((currentPrice + atr * 2).toFixed(8));
      const takeProfit = parseFloat((currentPrice - atr * 2 * this.rrRatio).toFixed(8));
      const positionSize = this._positionSize(currentPrice, stopLoss, accountBalance);

      return {
        signal: 'SELL',
        price: currentPrice,
        stopLoss,
        takeProfit,
        positionSize,
        confidence: aiConfidence,
        riskRewardRatio: this.rrRatio,
        riskAmount: parseFloat((accountBalance * this.riskPct).toFixed(2)),
        indicators,
        conditions: sellConditions,
        passedConditions: Object.values(sellConditions).filter(Boolean).length,
        totalConditions: Object.keys(sellConditions).length,
      };
    }

    // ── HOLD ─────────────────────────────────────────────────────────────────
    const buyPassed  = Object.values(buyConditions).filter(Boolean).length;
    const sellPassed = Object.values(sellConditions).filter(Boolean).length;

    return {
      signal: 'HOLD',
      price: currentPrice,
      confidence: aiConfidence,
      reason: `BUY: ${buyPassed}/7 conditions — SELL: ${sellPassed}/7 conditions`,
      indicators,
      conditions: { buy: buyConditions, sell: sellConditions },
      passedConditions: Math.max(buyPassed, sellPassed),
      totalConditions: 7,
    };
  }

  /**
   * Calculate position size based on fixed-risk model.
   * Never lose more than riskPct of account per trade.
   */
  _positionSize(entryPrice, stopLoss, accountBalance) {
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    if (riskPerShare === 0) return 0;
    const riskAmount = accountBalance * this.riskPct;
    return parseFloat((riskAmount / riskPerShare).toFixed(8));
  }
}

export default OracleTraderProStrategy;
