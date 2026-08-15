/**
 * Strategy API routes
 * GET  /strategy/analyze    - analyze current market with advanced engine
 * POST /strategy/backtest   - run backtest on provided candles
 * GET  /strategy/performance - get performance stats from trade history
 */
import express from 'express';
import logger from '../utils/logger.js';
import AdvancedStrategyEngine from '../strategies/advancedStrategyEngine.js';
import SignalGenerator from '../strategies/signalGenerator.js';
import RiskManager from '../strategies/riskManager.js';
import NewsFilter from '../strategies/newsFilter.js';
import { StrategyAnalyzer } from '../strategies/strategyAnalyzer.js';
import { runBacktest } from '../strategies/backtestEngine.js';
import OracleTraderProStrategy from '../strategies/oracleTraderProStrategy.js';
import pb from '../utils/pbClient.js';

const router = express.Router();
const strategyEngine = new AdvancedStrategyEngine();
const signalGen = new SignalGenerator();
const riskMgr = new RiskManager();
const newsFilter = new NewsFilter();
const analyzer = new StrategyAnalyzer();
const oracleStrategy = new OracleTraderProStrategy(0.02, 2.0);

/**
 * POST /strategy/analyze
 * Body: { candles: [{open,high,low,close,volume}], newsEvents: [], accountBalance, riskPercent }
 */
router.post('/analyze', async (req, res) => {
  const { candles, newsEvents = [], accountBalance = 10000, riskPercent = 1.5, riskRewardRatio = 2 } = req.body || {};

  if (!candles || !Array.isArray(candles) || candles.length < 30) {
    return res.status(422).json({ error: 'candles array with at least 30 entries required' });
  }

  const indicators = strategyEngine.calculateIndicators(candles);
  if (!indicators) {
    return res.status(422).json({ error: 'Insufficient candle data for analysis' });
  }

  const price = indicators.currentPrice;
  const newsBlocked = newsFilter.shouldBlockTrade(newsEvents);
  const nearestEvent = newsFilter.getNearestEvent(newsEvents);
  const buySignal = !newsBlocked ? signalGen.generateBuySignal(indicators, { price }) : null;
  const sellSignal = !newsBlocked ? signalGen.generateSellSignal(indicators, { price }) : null;

  let tradePlan = null;
  let activeSignal = null;

  if (buySignal && buySignal.confidence >= 80) {
    activeSignal = buySignal;
    tradePlan = riskMgr.buildTradePlan({ entryPrice: price, atr: indicators.atr, direction: 'BUY', accountBalance, riskPercent, riskRewardRatio });
  } else if (sellSignal && sellSignal.confidence >= 80) {
    activeSignal = sellSignal;
    tradePlan = riskMgr.buildTradePlan({ entryPrice: price, atr: indicators.atr, direction: 'SELL', accountBalance, riskPercent, riskRewardRatio });
  }

  const recommendation = newsBlocked ? 'HOLD' : activeSignal ? activeSignal.signal : 'HOLD';
  const reason = newsBlocked ? 'High-impact news event nearby — trade blocked'
    : activeSignal ? `${activeSignal.passedCount}/${activeSignal.totalConditions} conditions passed`
    : 'Insufficient signal confluence — waiting for setup';

  res.json({
    success: true,
    recommendation,
    reason,
    confidence: activeSignal?.confidence || signalGen.calculateConfidence(indicators),
    newsBlocked,
    nearestEvent,
    indicators: {
      rsi: indicators.rsi,
      ema20: indicators.ema20,
      ema50: indicators.ema50,
      emaUptrend: indicators.emaUptrend,
      macd: indicators.macd,
      adx: indicators.adx,
      atr: indicators.atr,
      vwap: indicators.vwap,
      volumeConfirm: indicators.volumeConfirm,
      bollingerBands: indicators.bollingerBands,
      support: indicators.support,
      resistance: indicators.resistance,
      fibonacci: indicators.fibonacci,
    },
    signal: activeSignal,
    tradePlan,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /strategy/backtest
 * Body: { candles, accountBalance, riskPercent, riskRewardRatio, minConfidence }
 */
router.post('/backtest', async (req, res) => {
  const { candles, ...options } = req.body || {};

  if (!candles || !Array.isArray(candles) || candles.length < 100) {
    return res.status(422).json({ error: 'candles array with at least 100 entries required for backtesting' });
  }

  const report = runBacktest(candles, options);
  res.json({ success: true, ...report });
});

/**
 * GET /strategy/performance?userId=xxx
 */
router.get('/performance', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(422).json({ error: 'userId required' });

  try {
    const result = await pb.collection('trades').getFullList({ filter: `userId = "${userId}"`, sort: '-created' });
    const stats = analyzer.analyze(result);
    res.json({ success: true, ...stats });
  } catch (err) {
    logger.error(`[/strategy/performance] ${err.message}`);
    res.json({ success: true, totalTrades: 0, winRate: 0, profitFactor: 0, sharpeRatio: 0, maxDrawdown: 0 });
  }
});

/**
 * POST /strategy/evaluate
 * Oracle Trader Pro — direct port of the Python OracleTraderPro.evaluate()
 * Body: { candles: [{open,high,low,close,volume}], aiConfidence?, accountBalance?, riskPerTradePct?, rrRatio? }
 */
router.post('/evaluate', async (req, res) => {
  const {
    candles,
    aiConfidence = 0.95,
    accountBalance = 10000,
    riskPerTradePct,
    rrRatio,
  } = req.body || {};

  if (!candles || !Array.isArray(candles) || candles.length < 60) {
    return res.status(422).json({ error: 'candles array with at least 60 entries required' });
  }

  // Allow per-request overrides of risk/RR
  let strategy = oracleStrategy;
  if (riskPerTradePct !== undefined || rrRatio !== undefined) {
    strategy = new OracleTraderProStrategy(
      riskPerTradePct ?? 0.02,
      rrRatio ?? 2.0,
    );
  }

  const result = strategy.evaluate(candles, Number(aiConfidence), Number(accountBalance));
  res.json({ success: true, ...result, timestamp: new Date().toISOString() });
});

export default router;
