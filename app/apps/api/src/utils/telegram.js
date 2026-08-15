import 'dotenv/config';
import axios from 'axios';
import logger from './logger.js';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

/**
 * Check if Telegram is configured
 */
function isTelegramConfigured() {
  return TELEGRAM_TOKEN && TELEGRAM_CHAT_ID && TELEGRAM_TOKEN.trim() !== '' && TELEGRAM_CHAT_ID.trim() !== '';
}

/**
 * Send a message to Telegram
 * @param {string} message - The message to send
 */
export async function sendTelegramMessage(message) {
  if (!isTelegramConfigured()) {
    logger.debug('Telegram not configured, skipping message');
    return false;
  }

  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    });

    if (response.data.ok) {
      logger.debug('Telegram message sent successfully');
      return true;
    } else {
      logger.error('Telegram API returned error:', response.data.description);
      return false;
    }
  } catch (error) {
    logger.error('Failed to send Telegram message:', error.message);
    return false;
  }
}

/**
 * Send trade execution notification
 * @param {object} tradeData - Trade data object
 */
export async function sendTradeNotification(tradeData) {
  const { symbol, side, quantity, price, timestamp, pnl } = tradeData;
  const pnlText = pnl !== undefined ? `\n📊 P&L: $${pnl.toFixed(2)}` : '';
  const message = `<b>🤖 Trade Executed</b>\n\n<b>Asset:</b> ${symbol}\n<b>Type:</b> ${side}\n<b>Amount:</b> ${quantity.toFixed(8)}\n<b>Price:</b> $${price.toFixed(2)}${pnlText}\n<b>Time:</b> ${new Date(timestamp).toLocaleString()}`;
  return sendTelegramMessage(message);
}

/**
 * Send bot status notification
 * @param {string} status - 'started' or 'stopped'
 * @param {object} config - Bot configuration
 */
export async function sendBotStatusNotification(status, config) {
  const statusEmoji = status === 'started' ? '▶️' : '⏹️';
  const statusText = status === 'started' ? 'STARTED' : 'STOPPED';
  const message = `<b>${statusEmoji} Bot ${statusText}</b>\n\n<b>Strategy:</b> ${config.strategy}\n<b>Symbol:</b> ${config.symbol}\n<b>Stop Loss:</b> ${config.stopLoss}%\n<b>Take Profit:</b> ${config.takeProfit}%\n<b>Time:</b> ${new Date().toLocaleString()}`;
  return sendTelegramMessage(message);
}

/**
 * Send alert notification
 * @param {string} alertType - Type of alert (e.g., 'error', 'warning', 'info')
 * @param {string} message - Alert message
 */
export async function sendAlertNotification(alertType, message) {
  const alertEmoji = alertType === 'error' ? '❌' : alertType === 'warning' ? '⚠️' : 'ℹ️';
  const fullMessage = `<b>${alertEmoji} ${alertType.toUpperCase()}</b>\n\n${message}\n\n<b>Time:</b> ${new Date().toLocaleString()}`;
  return sendTelegramMessage(fullMessage);
}

/**
 * Send circuit breaker alert
 * @param {string} symbol - Trading symbol
 * @param {number} volatility - Volatility percentage
 */
export async function sendCircuitBreakerAlert(symbol, volatility) {
  const message = `<b>⚠️ CIRCUIT BREAKER TRIGGERED</b>\n\n<b>Symbol:</b> ${symbol}\n<b>Volatility:</b> ${volatility.toFixed(2)}%\n<b>Status:</b> Trading paused for 60 seconds\n<b>Time:</b> ${new Date().toLocaleString()}`;
  return sendTelegramMessage(message);
}

/**
 * Send connection error alert
 * @param {string} service - Service name (e.g., 'Coinbase', 'PocketBase')
 * @param {string} error - Error message
 */
export async function sendConnectionErrorAlert(service, error) {
  const message = `<b>❌ CONNECTION ERROR</b>\n\n<b>Service:</b> ${service}\n<b>Error:</b> ${error}\n<b>Time:</b> ${new Date().toLocaleString()}`;
  return sendTelegramMessage(message);
}

if (isTelegramConfigured()) {
  logger.info('Telegram notifications enabled');
} else {
  logger.warn('Telegram not configured - notifications disabled');
}

export { isTelegramConfigured };

export default {
  sendTelegramMessage,
  sendTradeNotification,
  sendBotStatusNotification,
  sendAlertNotification,
  sendCircuitBreakerAlert,
  sendConnectionErrorAlert,
  isTelegramConfigured,
};