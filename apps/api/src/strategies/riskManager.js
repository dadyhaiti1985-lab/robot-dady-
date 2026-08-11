/**
 * Risk Manager
 * Calculates stop loss, take profit, position sizing, and trailing stops.
 */

export class RiskManager {
  /**
   * @param {number} entryPrice
   * @param {number} atr
   * @param {'BUY'|'SELL'} direction
   * @param {number} atrMultiplier - default 2
   */
  calculateStopLoss(entryPrice, atr, direction = 'BUY', atrMultiplier = 2) {
    const distance = atr * atrMultiplier;
    return direction === 'BUY'
      ? parseFloat((entryPrice - distance).toFixed(8))
      : parseFloat((entryPrice + distance).toFixed(8));
  }

  /**
   * @param {number} entryPrice
   * @param {number} stopLoss
   * @param {number} riskRewardRatio - default 2
   */
  calculateTakeProfit(entryPrice, stopLoss, riskRewardRatio = 2) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = risk * riskRewardRatio;
    return entryPrice > stopLoss
      ? parseFloat((entryPrice + reward).toFixed(8))   // BUY
      : parseFloat((entryPrice - reward).toFixed(8));  // SELL
  }

  /**
   * @param {number} accountBalance
   * @param {number} riskPercent - e.g. 1.5 for 1.5%
   * @param {number} entryPrice
   * @param {number} stopLoss
   */
  calculatePositionSize(accountBalance, riskPercent, entryPrice, stopLoss) {
    const riskAmount = accountBalance * (riskPercent / 100);
    const priceRisk = Math.abs(entryPrice - stopLoss);
    if (priceRisk === 0) return { units: 0, value: 0, risk: riskAmount };
    const units = riskAmount / priceRisk;
    const value = units * entryPrice;
    return {
      units: parseFloat(units.toFixed(8)),
      value: parseFloat(value.toFixed(2)),
      risk: parseFloat(riskAmount.toFixed(2)),
    };
  }

  /**
   * @param {number} currentPrice
   * @param {number} highestPrice - highest price since entry
   * @param {number} atr
   * @param {number} atrMultiplier - default 1.5
   */
  calculateTrailingStop(currentPrice, highestPrice, atr, atrMultiplier = 1.5) {
    const trailingDistance = atr * atrMultiplier;
    return parseFloat((highestPrice - trailingDistance).toFixed(8));
  }

  /**
   * Full trade plan object given entry, direction, ATR, balance.
   */
  buildTradePlan({ entryPrice, atr, direction = 'BUY', accountBalance = 10000, riskPercent = 1.5, riskRewardRatio = 2 }) {
    const stopLoss = this.calculateStopLoss(entryPrice, atr, direction);
    const takeProfit = this.calculateTakeProfit(entryPrice, stopLoss, riskRewardRatio);
    const positionSize = this.calculatePositionSize(accountBalance, riskPercent, entryPrice, stopLoss);
    return { entryPrice, stopLoss, takeProfit, positionSize, riskRewardRatio, riskPercent };
  }
}

export default RiskManager;
