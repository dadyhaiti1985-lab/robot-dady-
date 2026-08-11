/**
 * Advanced Strategy Engine
 * Calculates all technical indicators from OHLCV data.
 */
import {
  calculateRSI,
  calculateEMA,
  calculateMACD,
  calculateADX,
  calculateATR,
  calculateBollingerBands,
  calculateVWAP,
  calculateFibonacciLevels,
  calculateSupportResistance,
  calculateVolumeMA,
} from '../utils/indicatorCalculator.js';

export class AdvancedStrategyEngine {
  /**
   * Calculate all indicators from OHLCV candle array.
   * @param {Array<{open, high, low, close, volume}>} candles
   * @returns {Object} indicators
   */
  calculateIndicators(candles) {
    if (!candles || candles.length < 30) return null;

    const closes = candles.map(c => Number(c.close));
    const highs = candles.map(c => Number(c.high));
    const lows = candles.map(c => Number(c.low));
    const volumes = candles.map(c => Number(c.volume || 0));

    const currentPrice = closes[closes.length - 1];
    const currentVolume = volumes[volumes.length - 1];

    const rsi = calculateRSI(closes, 14);
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);
    const macd = calculateMACD(closes);
    const adx = calculateADX(highs, lows, closes, 14);
    const atr = calculateATR(highs, lows, closes, 14);
    const bb = calculateBollingerBands(closes, 20, 2);
    const vwap = calculateVWAP(candles.map((c, i) => ({
      high: Number(c.high), low: Number(c.low), close: Number(c.close), volume: Number(c.volume || 1),
    })));
    const volumeMA = calculateVolumeMA(volumes, 20);
    const { support, resistance } = calculateSupportResistance(closes);

    const highAll = Math.max(...highs.slice(-50));
    const lowAll = Math.min(...lows.slice(-50));
    const fibonacci = calculateFibonacciLevels(highAll, lowAll);

    return {
      currentPrice,
      currentVolume,
      rsi,
      ema20,
      ema50,
      emaUptrend: ema20 !== null && ema50 !== null ? ema20 > ema50 : false,
      macd,
      macdCross: macd?.cross || 'NONE',
      adx,
      atr,
      bollingerBands: bb,
      vwap,
      volumeMA,
      volumeConfirm: volumeMA !== null && currentVolume > volumeMA,
      priceAboveVWAP: vwap !== null && currentPrice > vwap,
      support,
      resistance,
      fibonacci,
    };
  }
}

export default AdvancedStrategyEngine;
