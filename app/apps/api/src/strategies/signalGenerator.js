/**
 * Signal Generator
 * Evaluates indicator conditions and generates BUY/SELL/HOLD signals.
 */

export class SignalGenerator {
  calculateConfidence(indicators) {
    if (!indicators) return 0;
    let score = 0;

    // RSI score (0-20)
    if (indicators.rsi >= 40 && indicators.rsi <= 65) score += 20;
    else if (indicators.rsi >= 30 && indicators.rsi <= 70) score += 10;

    // EMA trend score (0-20)
    if (indicators.emaUptrend) score += 20;

    // MACD score (0-20)
    if (indicators.macdCross === 'BULLISH') score += 20;
    else if (indicators.macd && indicators.macd.line > 0) score += 10;

    // ADX score (0-20)
    if (indicators.adx > 25) score += 20;
    else if (indicators.adx > 20) score += 10;

    // Volume score (0-20)
    if (indicators.volumeConfirm) score += 20;

    return Math.min(score, 100);
  }

  generateBuySignal(indicators, marketData = {}) {
    if (!indicators) return null;

    const price = marketData.price || indicators.currentPrice;

    const conditions = {
      emaUptrend: Boolean(indicators.emaUptrend),
      rsiOptimal: indicators.rsi >= 40 && indicators.rsi <= 65,
      macdBullish: indicators.macdCross === 'BULLISH',
      adxStrong: indicators.adx > 25,
      volumeConfirm: Boolean(indicators.volumeConfirm),
      priceAboveVWAP: indicators.vwap ? price > indicators.vwap : false,
      confidenceHigh: this.calculateConfidence(indicators) > 70,
    };

    const passedCount = Object.values(conditions).filter(Boolean).length;

    if (passedCount >= 5) {
      const confidence = this.calculateConfidence(indicators);
      return {
        signal: 'BUY',
        confidence,
        conditions,
        passedCount,
        totalConditions: Object.keys(conditions).length,
      };
    }
    return null;
  }

  generateSellSignal(indicators, marketData = {}) {
    if (!indicators) return null;

    const price = marketData.price || indicators.currentPrice;

    const conditions = {
      emaDowntrend: !indicators.emaUptrend,
      rsiOptimal: indicators.rsi >= 35 && indicators.rsi <= 60,
      macdBearish: indicators.macdCross === 'BEARISH',
      adxStrong: indicators.adx > 25,
      priceBelowVWAP: indicators.vwap ? price < indicators.vwap : false,
      confidenceHigh: this.calculateConfidence(indicators) > 70,
    };

    const passedCount = Object.values(conditions).filter(Boolean).length;

    if (passedCount >= 4) {
      const confidence = this.calculateConfidence(indicators);
      return {
        signal: 'SELL',
        confidence,
        conditions,
        passedCount,
        totalConditions: Object.keys(conditions).length,
      };
    }
    return null;
  }
}

export default SignalGenerator;
