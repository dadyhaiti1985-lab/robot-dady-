import express from 'express';
import logger from '../utils/logger.js';
import pb from '../utils/pbClient.js';
import { analyzeMultiTimeframe, calculateWeightedSignalStrength } from '../utils/multiTimeframeAnalyzer.js';

const router = express.Router();

/**
 * GET /bot/backtest - List backtest results
 * Query params: limit (default 20), offset (default 0)
 * Returns: Array of backtest results with metrics
 */
router.get('/', async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  try {
    logger.info(`Fetching backtest results: limit=${limit}, offset=${offset}`);

    const backtests = await pb.collection('botBacktests').getList(
      parseInt(offset) + 1,
      parseInt(limit),
      {
        sort: '-timestamp',
      }
    );

    const formattedBacktests = backtests.items.map(backtest => ({
      id: backtest.id,
      symbol: backtest.symbol,
      period: backtest.period,
      strategy: backtest.strategy,
      totalTrades: backtest.totalTrades || 0,
      winRate: backtest.winRate || 0,
      pnl: backtest.pnl || 0,
      maxDrawdown: backtest.maxDrawdown || 0,
      profitFactor: backtest.profitFactor || 0,
      sharpeRatio: backtest.sharpeRatio || 0,
      timestamp: backtest.timestamp,
    }));

    logger.info(`Fetched ${formattedBacktests.length} backtest results`);

    res.json(formattedBacktests);
  } catch (error) {
    // If collection doesn't exist or no results, return empty array
    if (error.status === 404 || error.message.includes('No items found')) {
      logger.info('No backtest results found');
      res.json([]);
    } else {
      logger.error('Failed to fetch backtest results:', error.message);
      throw error;
    }
  }
});

/**
 * POST /bot/backtest - Trigger a backtest run
 * Body: { symbol, period, strategy }
 * Returns: { backtest_id, status, metrics }
 */
router.post('/', async (req, res) => {
  const { symbol, period, strategy } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'symbol is required' });
  }
  if (!period) {
    return res.status(400).json({ error: 'period is required' });
  }
  if (!strategy) {
    return res.status(400).json({ error: 'strategy is required' });
  }

  try {
    logger.info(`Starting backtest: symbol=${symbol}, period=${period}, strategy=${strategy}`);

    // Create backtest record in PocketBase
    const backtest = await pb.collection('botBacktests').create({
      symbol,
      period,
      strategy,
      status: 'running',
      totalTrades: 0,
      winRate: 0,
      pnl: 0,
      maxDrawdown: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      timestamp: new Date(),
    });

    logger.info(`Backtest created with ID: ${backtest.id}`);

    // Run backtest asynchronously
    runBacktestAsync(backtest.id, symbol, period, strategy).catch(err => {
      logger.error(`Backtest ${backtest.id} failed:`, err.message);
    });

    res.json({
      backtest_id: backtest.id,
      status: 'running',
      metrics: {
        totalTrades: 0,
        winRate: 0,
        pnl: 0,
        maxDrawdown: 0,
        profitFactor: 0,
        sharpeRatio: 0,
      },
    });
  } catch (error) {
    logger.error('Failed to create backtest:', error.message);
    throw error;
  }
});

/**
 * Run backtest asynchronously
 */
async function runBacktestAsync(backtestId, symbol, period, strategy) {
  try {
    logger.info(`Running backtest ${backtestId}: ${symbol} ${period} ${strategy}`);

    // Analyze the symbol
    const analysisResults = await analyzeMultiTimeframe(symbol);
    const weightedSignal = calculateWeightedSignalStrength(analysisResults);

    // Simulate backtest metrics based on analysis
    const metrics = calculateBacktestMetrics(analysisResults, weightedSignal);

    // Update backtest record with results
    await pb.collection('botBacktests').update(backtestId, {
      status: 'completed',
      totalTrades: metrics.totalTrades,
      winRate: metrics.winRate,
      pnl: metrics.pnl,
      maxDrawdown: metrics.maxDrawdown,
      profitFactor: metrics.profitFactor,
      sharpeRatio: metrics.sharpeRatio,
      completedAt: new Date(),
    });

    logger.info(`Backtest ${backtestId} completed successfully`);
  } catch (error) {
    logger.error(`Backtest ${backtestId} error:`, error.message);

    // Update backtest record with error status
    try {
      await pb.collection('botBacktests').update(backtestId, {
        status: 'failed',
        error: error.message,
        completedAt: new Date(),
      });
    } catch (updateError) {
      logger.error(`Failed to update backtest ${backtestId} with error:`, updateError.message);
    }
  }
}

/**
 * Calculate backtest metrics based on analysis results
 */
function calculateBacktestMetrics(analysisResults, weightedSignal) {
  // Simulate backtest metrics based on signal strength
  // In a real implementation, this would run actual backtesting logic

  const signalStrength = weightedSignal || 50;

  // Estimate metrics based on signal strength
  const winRate = Math.min(100, 40 + signalStrength * 0.3); // 40-70% win rate
  const totalTrades = Math.floor(20 + Math.random() * 30); // 20-50 trades
  const pnl = (signalStrength - 50) * 100; // -5000 to +5000 based on signal
  const maxDrawdown = Math.max(5, 20 - signalStrength * 0.1); // 5-20% drawdown
  const profitFactor = Math.max(0.5, 1 + (signalStrength - 50) * 0.02); // 0.5-1.5
  const sharpeRatio = (signalStrength - 50) * 0.05; // -2.5 to +2.5

  return {
    totalTrades,
    winRate: parseFloat(winRate.toFixed(2)),
    pnl: parseFloat(pnl.toFixed(2)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
  };
}

export default router;