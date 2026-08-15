/**
 * Strategy Analyzer
 * Analyzes strategy performance from trade history.
 */

export class StrategyAnalyzer {
  /**
   * @param {Array<{pnl, entryPrice, exitPrice, type}>} trades
   */
  analyze(trades = []) {
    if (!trades || trades.length === 0) {
      return { winRate: 0, profitFactor: 0, sharpeRatio: 0, maxDrawdown: 0, recoveryFactor: 0, totalTrades: 0 };
    }

    const closedTrades = trades.filter(t => t.pnl !== undefined && t.pnl !== null);
    const wins = closedTrades.filter(t => Number(t.pnl) > 0);
    const losses = closedTrades.filter(t => Number(t.pnl) <= 0);

    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;

    const grossProfit = wins.reduce((s, t) => s + Number(t.pnl), 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Equity curve and max drawdown
    let equity = 0, peak = 0, maxDrawdown = 0;
    const equityCurve = closedTrades.map(t => {
      equity += Number(t.pnl);
      if (equity > peak) peak = equity;
      const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
      if (dd > maxDrawdown) maxDrawdown = dd;
      return equity;
    });

    // Sharpe ratio (simplified, assuming 0 risk-free rate)
    const returns = closedTrades.map(t => Number(t.pnl));
    const mean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length || 1);
    const std = Math.sqrt(variance);
    const sharpeRatio = std > 0 ? parseFloat((mean / std * Math.sqrt(252)).toFixed(2)) : 0;

    const totalPnl = equity;
    const recoveryFactor = maxDrawdown > 0 ? parseFloat((totalPnl / (maxDrawdown / 100)).toFixed(2)) : 0;

    return {
      totalTrades: closedTrades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: parseFloat(winRate.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      grossLoss: parseFloat(grossLoss.toFixed(2)),
      profitFactor: typeof profitFactor === 'number' ? parseFloat(profitFactor.toFixed(2)) : 0,
      sharpeRatio,
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      totalPnl: parseFloat(totalPnl.toFixed(2)),
      recoveryFactor,
      equityCurve,
    };
  }
}

export default StrategyAnalyzer;
