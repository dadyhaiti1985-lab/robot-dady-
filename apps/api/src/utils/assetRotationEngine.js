import 'dotenv/config';
import axios from 'axios';
import logger from './logger.js';
import pb from './pbClient.js';

const COINBASE_API_URL = 'https://api.coinbase.com/api/v1';

const TOP_ASSETS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'MATIC'];

/**
 * Fetch 24h price data for an asset
 */
async function fetch24hPriceData(asset) {
  const productId = `${asset}-USD`;
  const granularity = 3600; // 1 hour
  const limit = 24; // 24 hours

  const startTime = Math.floor(Date.now() / 1000) - granularity * limit;
  const endTime = Math.floor(Date.now() / 1000);

  const response = await axios.get(
    `${COINBASE_API_URL}/products/${productId}/candles`,
    {
      params: {
        start_time: startTime,
        end_time: endTime,
        granularity,
      },
    }
  );

  if (!response.data || !response.data.candles) {
    throw new Error(`Failed to fetch 24h data for ${asset}`);
  }

  return response.data.candles.reverse().map(candle => ({
    timestamp: candle[0],
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
  }));
}

/**
 * Fetch 4h candles for volatility calculation
 */
async function fetch4hCandles(asset, limit = 20) {
  const productId = `${asset}-USD`;
  const granularity = 14400; // 4 hours

  const startTime = Math.floor(Date.now() / 1000) - granularity * limit;
  const endTime = Math.floor(Date.now() / 1000);

  const response = await axios.get(
    `${COINBASE_API_URL}/products/${productId}/candles`,
    {
      params: {
        start_time: startTime,
        end_time: endTime,
        granularity,
      },
    }
  );

  if (!response.data || !response.data.candles) {
    throw new Error(`Failed to fetch 4h candles for ${asset}`);
  }

  return response.data.candles.reverse().map(candle => ({
    timestamp: candle[0],
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
  }));
}

/**
 * Calculate momentum score
 */
function calculateMomentum(priceData) {
  if (priceData.length < 2) return 0;

  const currentPrice = priceData[priceData.length - 1].close;
  const price24hAgo = priceData[0].close;

  const momentum = ((currentPrice - price24hAgo) / price24hAgo) * 100;

  return momentum;
}

/**
 * Calculate volatility (standard deviation)
 */
function calculateVolatility(candles) {
  if (candles.length < 2) return 0;

  const closes = candles.map(c => c.close);
  const mean = closes.reduce((a, b) => a + b) / closes.length;
  const variance = closes.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / closes.length;
  const stdDev = Math.sqrt(variance);

  // Normalize to percentage
  const volatilityPercent = (stdDev / mean) * 100;

  return volatilityPercent;
}

/**
 * Check if asset is in flat position (no movement > 0.5% in last 30 minutes)
 */
async function checkFlatPosition(asset) {
  const productId = `${asset}-USD`;
  const granularity = 300; // 5 minutes
  const limit = 6; // 30 minutes

  const startTime = Math.floor(Date.now() / 1000) - granularity * limit;
  const endTime = Math.floor(Date.now() / 1000);

  const response = await axios.get(
    `${COINBASE_API_URL}/products/${productId}/candles`,
    {
      params: {
        start_time: startTime,
        end_time: endTime,
        granularity,
      },
    }
  );

  if (!response.data || !response.data.candles || response.data.candles.length < 2) {
    return false;
  }

  const candles = response.data.candles.reverse();
  const firstPrice = parseFloat(candles[0][4]);
  const lastPrice = parseFloat(candles[candles.length - 1][4]);

  const movement = Math.abs((lastPrice - firstPrice) / firstPrice) * 100;

  return movement <= 0.5;
}

/**
 * Scan all assets and calculate scores
 */
export async function scanAssets() {
  const assetScores = [];

  // Fetch all volatility data first to calculate average
  const volatilityData = {};
  for (const asset of TOP_ASSETS) {
    const candles = await fetch4hCandles(asset, 20);
    volatilityData[asset] = calculateVolatility(candles);
  }

  const avgVolatility = Object.values(volatilityData).reduce((a, b) => a + b) / TOP_ASSETS.length;

  // Calculate scores for each asset
  for (const asset of TOP_ASSETS) {
    const priceData = await fetch24hPriceData(asset);
    const momentum = calculateMomentum(priceData);
    const volatility = volatilityData[asset];
    const volatilityRatio = volatility / avgVolatility;
    const isFlat = await checkFlatPosition(asset);

    // Score: momentum × 0.6 + (1 / volatility_ratio) × 0.4
    // Normalize momentum to 0-100 scale
    const normalizedMomentum = Math.max(0, Math.min(100, momentum + 50)); // Shift to 0-100 range
    const volatilityScore = Math.max(0, Math.min(100, (1 / volatilityRatio) * 100));
    const score = normalizedMomentum * 0.6 + volatilityScore * 0.4;

    assetScores.push({
      asset,
      momentum: parseFloat(momentum.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2)),
      volatilityRatio: parseFloat(volatilityRatio.toFixed(2)),
      score: parseFloat(score.toFixed(2)),
      isFlat,
    });
  }

  // Sort by score descending
  assetScores.sort((a, b) => b.score - a.score);

  return assetScores;
}

/**
 * Generate rotation recommendation
 */
export async function generateRotationRecommendation(currentAsset) {
  const assetScores = await scanAssets();

  const currentAssetData = assetScores.find(a => a.asset === currentAsset);
  const nextAssetData = assetScores[0]; // Highest scoring asset

  if (!currentAssetData) {
    throw new Error(`Asset ${currentAsset} not found in scan results`);
  }

  let reason = '';
  let shouldRotate = false;

  // Rotate if current asset momentum drops significantly or becomes flat
  if (currentAssetData.isFlat) {
    reason = 'Current asset in flat position';
    shouldRotate = true;
  } else if (currentAssetData.momentum < -2) {
    reason = 'Current asset momentum dropped';
    shouldRotate = true;
  } else if (nextAssetData.score > currentAssetData.score + 10) {
    reason = 'Next asset has significantly higher score';
    shouldRotate = true;
  }

  const recommendation = {
    currentAsset,
    nextAsset: nextAssetData.asset,
    currentMomentum: currentAssetData.momentum,
    nextMomentum: nextAssetData.momentum,
    currentVolatility: currentAssetData.volatility,
    nextVolatility: nextAssetData.volatility,
    currentScore: currentAssetData.score,
    nextScore: nextAssetData.score,
    shouldRotate,
    reason,
    timestamp: new Date().toISOString(),
  };

  // Log rotation to PocketBase if rotation is recommended
  if (shouldRotate) {
    await pb.collection('bot_rotations').create({
      fromAsset: currentAsset,
      toAsset: nextAssetData.asset,
      fromMomentum: currentAssetData.momentum,
      toMomentum: nextAssetData.momentum,
      fromVolatility: currentAssetData.volatility,
      toVolatility: nextAssetData.volatility,
      reason,
      timestamp: new Date(),
    });

    logger.info(`Asset rotation: ${currentAsset} -> ${nextAssetData.asset} (${reason})`);
  }

  return recommendation;
}

export default {
  scanAssets,
  generateRotationRecommendation,
};