import 'dotenv/config';
import pb from './pbClient.js';
import logger from './logger.js';

const DEFAULT_BOT_CONFIG = {
  symbol: 'BTC-USD',
  strategy: 'EMA_RSI',
  stopLoss: 2,
  takeProfit: 5,
  isActive: false,
};

/**
 * Get or create bot configuration for a user
 * Fetches existing botConfig by userId, or creates default if not found
 */
export async function getOrCreateBotConfig(userId) {
  try {
    // Try to fetch existing config
    const config = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);
    return config;
  } catch (error) {
    // Config doesn't exist, create default
    if (error.status === 404 || error.message.includes('No items found')) {
      const newConfig = await pb.collection('botConfig').create({
        userId,
        ...DEFAULT_BOT_CONFIG,
      });
      logger.info(`Created default bot config for user ${userId}`);
      return newConfig;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetch bot configuration for a user
 */
export async function getBotConfig(userId) {
  try {
    const config = await pb.collection('botConfig').getOne(userId);
    return config;
  } catch (error) {
    logger.error(`Failed to fetch bot config for user ${userId}:`, error.message);
    throw new Error(`Bot config not found for user ${userId}`);
  }
}

/**
 * Save or update bot configuration
 */
export async function saveBotConfig(userId, configData) {
  try {
    const existingConfig = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`).catch(() => null);
    
    if (existingConfig) {
      return await pb.collection('botConfig').update(existingConfig.id, configData);
    } else {
      return await pb.collection('botConfig').create({
        userId,
        ...configData,
      });
    }
  } catch (error) {
    logger.error(`Failed to save bot config for user ${userId}:`, error.message);
    throw new Error(`Failed to save bot configuration`);
  }
}

/**
 * Create a new trade record
 */
export async function createTrade(tradeData) {
  try {
    return await pb.collection('trades').create(tradeData);
  } catch (error) {
    logger.error(`Failed to create trade:`, error.message);
    throw new Error(`Failed to create trade record`);
  }
}

/**
 * Update an existing trade
 */
export async function updateTrade(tradeId, updateData) {
  try {
    return await pb.collection('trades').update(tradeId, updateData);
  } catch (error) {
    logger.error(`Failed to update trade ${tradeId}:`, error.message);
    throw new Error(`Failed to update trade record`);
  }
}

/**
 * Fetch all trades for a user
 */
export async function getUserTrades(userId) {
  try {
    const trades = await pb.collection('trades').getFullList({
      filter: `userId = "${userId}"`,
    });
    return trades;
  } catch (error) {
    logger.error(`Failed to fetch trades for user ${userId}:`, error.message);
    throw new Error(`Failed to fetch trades`);
  }
}

/**
 * Fetch open trades for a user
 */
export async function getOpenTrades(userId) {
  try {
    const trades = await pb.collection('trades').getFullList({
      filter: `userId = "${userId}" && status = "OPEN"`,
    });
    return trades;
  } catch (error) {
    logger.error(`Failed to fetch open trades for user ${userId}:`, error.message);
    throw new Error(`Failed to fetch open trades`);
  }
}

/**
 * Fetch a single open trade for a user
 */
export async function getFirstOpenTrade(userId) {
  try {
    const trades = await pb.collection('trades').getFullList({
      filter: `userId = "${userId}" && status = "OPEN"`,
      limit: 1,
    });
    return trades.length > 0 ? trades[0] : null;
  } catch (error) {
    logger.error(`Failed to fetch open trade for user ${userId}:`, error.message);
    throw new Error(`Failed to fetch open trade`);
  }
}

export default pb;