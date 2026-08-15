import 'dotenv/config';
import logger from '../utils/logger.js';
import pb from '../utils/pbClient.js';
import { analyzeMultiTimeframe, calculateWeightedSignalStrength } from '../utils/multiTimeframeAnalyzer.js';
import { generateRotationRecommendation } from '../utils/assetRotationEngine.js';
import { calculateRiskManagement } from '../utils/riskManagementCalculator.js';
import { generateSignal } from '../utils/signalGenerator.js';
import * as telegramUtils from '../utils/telegram.js';

const TOP_ASSETS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'MATIC'];
const ANALYSIS_INTERVAL = 5 * 60 * 1000; // 5 minutes
const ROTATION_INTERVAL = 30 * 60 * 1000; // 30 minutes

let botState = {
  activeAsset: 'BTC',
  isRunning: false,
  openPositions: [],
  dailyPnL: 0,
  dailyLossLimit: 5,
  tradingPaused: false,
  lastUpdate: null,
  analysisIntervalId: null,
  rotationIntervalId: null,
  assetAnalysisCache: {}, // Cache for asset analysis results
};

/**
 * Get current bot configuration
 */
async function getBotConfig() {
  try {
    const config = await pb.collection('bot_config').getFirstListItem('id != ""');
    return config;
  } catch (error) {
    // Return default config if not found
    return {
      riskPerTrade: 1,
      maxConcurrentPositions: 3,
      dailyLossLimit: 5,
      trailingStopPercent: 50,
      assetRotationEnabled: true,
      timeframeWeights: {
        '15m': 0.3,
        '4h': 0.4,
        '1D': 0.3,
      },
    };
  }
}

/**
 * Get all open positions
 */
async function getOpenPositions() {
  try {
    const positions = await pb.collection('bot_trades').getFullList({
      filter: 'status = "OPEN"',
    });
    return positions;
  } catch (error) {
    logger.warn('Failed to fetch open positions:', error.message);
    return [];
  }
}

/**
 * Calculate daily P&L
 */
async function calculateDailyPnL() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trades = await pb.collection('bot_trades').getFullList({
      filter: `status = "CLOSED" && created >= "${today.toISOString()}"`,
    });

    const dailyPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    return parseFloat(dailyPnL.toFixed(2));
  } catch (error) {
    logger.warn('Failed to calculate daily P&L:', error.message);
    return 0;
  }
}

/**
 * Calculate performance metrics
 */
async function calculateMetrics() {
  try {
    const trades = await pb.collection('bot_trades').getFullList({
      filter: 'status = "CLOSED"',
    });

    if (trades.length === 0) {
      return {
        winRate: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
      };
    }

    // Calculate win rate
    const winningTrades = trades.filter(t => t.pnl > 0);
    const winRate = (winningTrades.length / trades.length) * 100;

    // Calculate profit factor
    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 100 : 0;

    // Calculate max drawdown (simplified)
    let maxDrawdown = 0;
    let runningBalance = 0;
    let peakBalance = 0;

    for (const trade of trades) {
      runningBalance += trade.pnl;
      if (runningBalance > peakBalance) {
        peakBalance = runningBalance;
      }
      const drawdown = peakBalance - runningBalance;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Calculate Sharpe ratio (simplified)
    const returns = trades.map(t => t.pnl);
    const avgReturn = returns.reduce((a, b) => a + b) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    return {
      winRate: parseFloat(winRate.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    };
  } catch (error) {
    logger.warn('Failed to calculate metrics:', error.message);
    return {
      winRate: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
    };
  }
}

/**
 * Analyze single asset across all timeframes
 */
async function analyzeAsset(asset) {
  const config = await getBotConfig();

  const analysisResults = await analyzeMultiTimeframe(asset);
  const weightedSignal = calculateWeightedSignalStrength(analysisResults, config.timeframeWeights);

  // Store analysis in database
  for (const [timeframe, analysis] of Object.entries(analysisResults)) {
    await pb.collection('bot_analysis').create({
      asset,
      timeframe,
      rsi: analysis.rsi,
      ema9: analysis.ema9,
      ema21: analysis.ema21,
      ema50: analysis.ema50,
      ema200: analysis.ema200,
      macd: analysis.macd,
      macdSignal: analysis.macdSignal,
      macdHistogram: analysis.macdHistogram,
      bbUpper: analysis.bbUpper,
      bbMiddle: analysis.bbMiddle,
      bbLower: analysis.bbLower,
      entrySignal: analysis.entrySignal,
      exitSignal: analysis.exitSignal,
      signalStrength: analysis.signalStrength,
      alignedIndicators: analysis.alignedIndicators,
      timestamp: new Date(),
    });
  }

  return {
    asset,
    analysisResults,
    weightedSignal,
  };
}

/**
 * Execute trading step
 */
async function executeTradingStep() {
  const config = await getBotConfig();
  const openPositions = await getOpenPositions();
  const dailyPnL = await calculateDailyPnL();

  // Check if daily loss limit is hit
  if (dailyPnL <= -(config.dailyLossLimit * 10000 / 100)) {
    botState.tradingPaused = true;
    logger.warn('Daily loss limit hit, trading paused');
    telegramUtils.sendAlertNotification('warning', `Daily loss limit hit: $${Math.abs(dailyPnL).toFixed(2)}`).catch(err => {
      logger.error('Failed to send alert:', err.message);
    });
    return;
  }

  botState.tradingPaused = false;

  // Analyze current asset
  const analysis = await analyzeAsset(botState.activeAsset);
  const { analysisResults } = analysis;

  // Cache analysis results for all open positions
  botState.assetAnalysisCache[botState.activeAsset] = analysisResults;

  // Check for entry signal
  if (openPositions.length < config.maxConcurrentPositions && analysis.weightedSignal >= 60) {
    logger.info(`Entry signal for ${botState.activeAsset}: ${analysis.weightedSignal}%`);
    telegramUtils.sendTradeNotification({
      symbol: `${botState.activeAsset}-USD`,
      side: 'BUY',
      quantity: 0.1,
      price: 45000,
      timestamp: new Date(),
    }).catch(err => {
      logger.error('Failed to send trade notification:', err.message);
    });
  }

  // Check exit signals for open positions
  for (const position of openPositions) {
    // Get cached analysis for position asset or analyze if not cached
    let positionAnalysisResults = botState.assetAnalysisCache[position.asset];

    if (!positionAnalysisResults) {
      const positionAnalysis = await analyzeAsset(position.asset);
      positionAnalysisResults = positionAnalysis.analysisResults;
      botState.assetAnalysisCache[position.asset] = positionAnalysisResults;
    }

    // Check exit signal from 15m timeframe analysis
    const timeframeAnalysis = positionAnalysisResults['15m'];
    if (timeframeAnalysis && timeframeAnalysis.exitSignal) {
      logger.info(`Exit signal for ${position.asset}`);
      telegramUtils.sendTradeNotification({
        symbol: `${position.asset}-USD`,
        side: 'SELL',
        quantity: position.quantity,
        price: position.exitPrice || 45000,
        timestamp: new Date(),
        pnl: position.pnl,
      }).catch(err => {
        logger.error('Failed to send trade notification:', err.message);
      });
    }
  }

  botState.lastUpdate = new Date();
}

/**
 * Execute rotation step
 */
async function executeRotationStep() {
  const config = await getBotConfig();

  if (!config.assetRotationEnabled) {
    return;
  }

  const recommendation = await generateRotationRecommendation(botState.activeAsset);

  if (recommendation.shouldRotate) {
    botState.activeAsset = recommendation.nextAsset;
    logger.info(`Asset rotated to ${recommendation.nextAsset}: ${recommendation.reason}`);
    telegramUtils.sendAlertNotification('info', `Asset rotated: ${recommendation.currentAsset} → ${recommendation.nextAsset}\nReason: ${recommendation.reason}`).catch(err => {
      logger.error('Failed to send rotation alert:', err.message);
    });
  }
}

/**
 * Start bot service
 */
export async function startBotService() {
  if (botState.isRunning) {
    logger.warn('Bot service already running');
    return;
  }

  botState.isRunning = true;
  logger.info('Starting advanced bot service');

  // Analysis loop (every 5 minutes)
  botState.analysisIntervalId = setInterval(async () => {
    try {
      await executeTradingStep();
    } catch (error) {
      logger.error('Trading step error:', error.message);
      await pb.collection('bot_errors').create({
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
      });
    }
  }, ANALYSIS_INTERVAL);

  // Rotation loop (every 30 minutes)
  botState.rotationIntervalId = setInterval(async () => {
    try {
      await executeRotationStep();
    } catch (error) {
      logger.error('Rotation step error:', error.message);
      await pb.collection('bot_errors').create({
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
      });
    }
  }, ROTATION_INTERVAL);

  // Send startup notification
  telegramUtils.sendAlertNotification('info', 'Advanced bot service started').catch(err => {
    logger.error('Failed to send startup notification:', err.message);
  });
}

/**
 * Stop bot service
 */
export async function stopBotService() {
  if (!botState.isRunning) {
    logger.warn('Bot service not running');
    return;
  }

  botState.isRunning = false;
  clearInterval(botState.analysisIntervalId);
  clearInterval(botState.rotationIntervalId);

  logger.info('Advanced bot service stopped');

  // Send shutdown notification
  telegramUtils.sendAlertNotification('info', 'Advanced bot service stopped').catch(err => {
    logger.error('Failed to send shutdown notification:', err.message);
  });
}

/**
 * Get bot status
 */
export async function getBotStatus() {
  const openPositions = await getOpenPositions();
  const dailyPnL = await calculateDailyPnL();
  const metrics = await calculateMetrics();
  const config = await getBotConfig();

  // Calculate monthly P&L
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  let monthlyPnL = 0;
  try {
    const monthlyTrades = await pb.collection('bot_trades').getFullList({
      filter: `status = "CLOSED" && created >= "${monthStart.toISOString()}"`,
    });
    monthlyPnL = monthlyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  } catch (error) {
    logger.warn('Failed to calculate monthly P&L:', error.message);
  }

  return {
    activeAsset: botState.activeAsset,
    isRunning: botState.isRunning,
    openPositions: openPositions.map(p => ({
      asset: p.asset,
      entry: p.entryPrice,
      sl: p.slPrice,
      tp: p.tpPrice,
      pnl: p.pnl,
      signalStrength: p.signalStrength,
    })),
    dailyPnL: parseFloat(dailyPnL.toFixed(2)),
    dailyLossLimit: config.dailyLossLimit,
    tradingPaused: botState.tradingPaused,
    winRate: metrics.winRate,
    profitFactor: metrics.profitFactor,
    maxDrawdown: metrics.maxDrawdown,
    sharpeRatio: metrics.sharpeRatio,
    monthlyPnL: parseFloat(monthlyPnL.toFixed(2)),
    lastUpdate: botState.lastUpdate,
  };
}

export default {
  startBotService,
  stopBotService,
  getBotStatus,
};