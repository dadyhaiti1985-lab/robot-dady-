/**
 * Backtest Engine
 * Applies the advanced strategy to historical OHLCV data and generates a performance report.
 */
import AdvancedStrategyEngine from './advancedStrategyEngine.js';
import SignalGenerator from './signalGenerator.js';
import RiskManager from './riskManager.js';
import NewsFilter from './newsFilter.js';
import { StrategyAnalyzer } from './strategyAnalyzer.js';

const strategyEngine = new AdvancedStrategyEngine();
const signalGen = new SignalGenerator();
const riskMgr = new RiskManager();
const newsFilter = new NewsFilter();
const analyzer = new StrategyAnalyzer();

/**
 * Run a backtest on historical candles.
 * @param {Array<{open,high,low,close,volume,timestamp}>} candles - full OHLCV history
 * @param {Object} options
 * @param {number} options.accountBalance - starting balance
 * @param {number} options.riskPercent - risk per trade %
 * @param {number} options.riskRewardRatio
 * @param {number} options.minConfidence - min confidence to enter (default 80)
 * @param {Array}  options.newsEvents
 * @returns {Object} backtest report
 */
export function runBacktest(candles, options = {}) {
  const {
    accountBalance: startBalance = 10000,
    riskPercent = 1.5,
    riskRewardRatio = 2,
    minConfidence = 80,
    newsEvents = [],
  } = options;

  const LOOKBACK = 60; // minimum candles before we start evaluating
  const trades = [];
  let balance = startBalance;
  let openTrade = null;

  for (let i = LOOKBACK; i < candles.length; i++) {
    const window = candles.slice(0, i + 1);
    const currentCandle = candles[i];
    const price = Number(currentCandle.close);

    // Check exit conditions for open trade
    if (openTrade) {
      const hit = openTrade.direction === 'BUY'
        ? (price <= openTrade.stopLoss || price >= openTrade.takeProfit)
        : (price >= openTrade.stopLoss || price <= openTrade.takeProfit);

      if (hit) {
        const exitPrice = price;
        const pnl = openTrade.direction === 'BUY'
          ? (exitPrice - openTrade.entryPrice) * openTrade.units
          : (openTrade.entryPrice - exitPrice) * openTrade.units;
        balance += pnl;
        trades.push({ ...openTrade, exitPrice, pnl, exitIndex: i, balance });
        openTrade = null;
      }
      continue; // hold until exit
    }

    // Calculate indicators
    const indicators = strategyEngine.calculateIndicators(window);
    if (!indicators || !indicators.atr) continue;

    // News filter
    if (newsFilter.shouldBlockTrade(newsEvents)) continue;

    // Generate signals
    const buySignal = signalGen.generateBuySignal(indicators, { price });
    const sellSignal = signalGen.generateSellSignal(indicators, { price });

    let direction = null;
    let signalData = null;
    if (buySignal && buySignal.confidence >= minConfidence) { direction = 'BUY'; signalData = buySignal; }
    else if (sellSignal && sellSignal.confidence >= minConfidence) { direction = 'SELL'; signalData = sellSignal; }

    if (direction) {
      const plan = riskMgr.buildTradePlan({ entryPrice: price, atr: indicators.atr, direction, accountBalance: balance, riskPercent, riskRewardRatio });
      openTrade = {
        direction,
        entryPrice: price,
        stopLoss: plan.stopLoss,
        takeProfit: plan.takeProfit,
        units: plan.positionSize.units,
        riskAmount: plan.positionSize.risk,
        confidence: signalData.confidence,
        entryIndex: i,
        timestamp: currentCandle.timestamp || i,
      };
    }
  }

  // Close any remaining open trade at last price
  if (openTrade) {
    const lastPrice = Number(candles[candles.length - 1].close);
    const pnl = openTrade.direction === 'BUY'
      ? (lastPrice - openTrade.entryPrice) * openTrade.units
      : (openTrade.entryPrice - lastPrice) * openTrade.units;
    balance += pnl;
    trades.push({ ...openTrade, exitPrice: lastPrice, pnl, exitIndex: candles.length - 1, balance });
  }

  const performance = analyzer.analyze(trades);

  return {
    startBalance,
    endBalance: parseFloat(balance.toFixed(2)),
    totalReturn: parseFloat(((balance - startBalance) / startBalance * 100).toFixed(2)),
    totalCandles: candles.length,
    trades,
    performance,
  };
}

export default { runBacktest };
