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
 * Build a QuickChart.io URL showing the last 20 close prices + EMA20 reference line.
 */
function buildChartUrl(symbol, side, closePrices, entryPrice, ema20Value) {
  const last20 = closePrices.slice(-20).map(Number);
  const color = side === 'BUY' ? '#10B981' : '#EF4444';
  const pointColors = last20.map((_, i) => (i === last20.length - 1 ? color : 'rgba(0,0,0,0)'));
  const pointRadii = last20.map((_, i) => (i === last20.length - 1 ? 6 : 0));
  const emaLine = ema20Value ? last20.map(() => Number(ema20Value)) : null;

  const datasets = [
    {
      label: 'Price',
      data: last20,
      borderColor: color,
      borderWidth: 2,
      pointBackgroundColor: pointColors,
      pointRadius: pointRadii,
      fill: false,
      tension: 0.15,
    },
  ];
  if (emaLine) {
    datasets.push({
      label: 'EMA20',
      data: emaLine,
      borderColor: '#38BDF8',
      borderWidth: 1,
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false,
      tension: 0,
    });
  }

  const cfg = {
    type: 'line',
    data: { labels: last20.map(() => ''), datasets },
    options: {
      plugins: {
        title: { display: true, text: `${symbol}  ${side} @ $${Number(entryPrice).toFixed(2)}`, color: '#F3F4F6', font: { size: 14 } },
        legend: { labels: { color: '#9CA3AF', boxWidth: 12 } },
      },
      scales: {
        x: { display: false },
        y: { ticks: { color: '#9CA3AF' }, grid: { color: '#1E293B' } },
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(cfg));
  return `https://quickchart.io/chart?c=${encoded}&width=600&height=320&bkg=%230B1220`;
}

/**
 * Send a photo to Telegram (used for chart images).
 */
export async function sendTelegramPhoto(photoUrl, caption) {
  if (!isTelegramConfigured()) return false;
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendPhoto`, {
      chat_id: TELEGRAM_CHAT_ID,
      photo: photoUrl,
      caption,
      parse_mode: 'HTML',
    });
    if (response.data.ok) {
      logger.debug('Telegram photo sent successfully');
      return true;
    }
    logger.error('Telegram sendPhoto error:', response.data.description);
    return false;
  } catch (error) {
    logger.error('Failed to send Telegram photo:', error.message);
    return false;
  }
}

/**
 * Send trade execution notification with analysis and optional chart.
 * @param {object} tradeData
 * @param {string}   tradeData.symbol
 * @param {string}   tradeData.side        'BUY' | 'SELL'
 * @param {number}   tradeData.quantity
 * @param {number}   tradeData.price
 * @param {Date}     tradeData.timestamp
 * @param {number}   [tradeData.pnl]
 * @param {string}   [tradeData.analysis]  Human-readable reason for the trade
 * @param {number[]} [tradeData.closePrices] Last N close prices for chart
 * @param {number}   [tradeData.ema20]     Current EMA20 value for chart reference line
 */
export async function sendTradeNotification(tradeData) {
  const { symbol, side, quantity, price, timestamp, pnl, analysis, closePrices, ema20 } = tradeData;

  const sideEmoji = side === 'BUY' ? '🟢' : '🔴';
  const pnlLine = pnl !== undefined
    ? `\n💰 <b>P&amp;L:</b> <b>${pnl >= 0 ? '+' : ''}$${Number(pnl).toFixed(2)}</b>`
    : '';
  const analysisLine = analysis
    ? `\n\n🧠 <b>Analiz / Poukisa li pran pozisyon an:</b>\n<i>"${analysis}"</i>`
    : '';

  const caption = `📊 <b>NEW TRADE EXECUTED</b>\n\n• <b>Asset:</b> ${symbol}\n• <b>Type:</b> ${side} ${sideEmoji}\n• <b>Price:</b> $${Number(price).toFixed(2)}\n• <b>Amount:</b> ${Number(quantity).toFixed(8)}\n• <b>Time:</b> ${new Date(timestamp).toLocaleString()}${pnlLine}${analysisLine}`;

  // Attempt chart photo first; fall back to plain text on failure
  if (Array.isArray(closePrices) && closePrices.length >= 20) {
    try {
      const chartUrl = buildChartUrl(symbol, side, closePrices, price, ema20);
      const sent = await sendTelegramPhoto(chartUrl, caption);
      if (sent) return true;
    } catch (chartErr) {
      logger.debug('Chart generation failed, falling back to text:', chartErr.message);
    }
  }

  return sendTelegramMessage(caption);
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

// Tracks getUpdates offset across polls to avoid reprocessing
let _cmdOffset = 0;

/**
 * Start a long-poll loop listening for /stop and /trade Telegram commands.
 * Only accepts messages from the configured TELEGRAM_CHAT_ID.
 * @param {{ stopAllBots: () => number, restartAllBots: () => Promise<void> }} handlers
 */
export function startCommandListener({ stopAllBots, restartAllBots }) {
  if (!isTelegramConfigured()) {
    logger.debug('[TelegramCmd] Not configured — command listener disabled');
    return;
  }
  const ALLOWED = String(TELEGRAM_CHAT_ID).trim();

  async function poll() {
    try {
      const res = await axios.get(`${TELEGRAM_API_URL}/getUpdates`, {
        params: { offset: _cmdOffset, timeout: 0, limit: 10 },
        timeout: 6000,
      });
      const updates = res.data?.result || [];
      for (const u of updates) {
        _cmdOffset = u.update_id + 1;
        const msg = u.message;
        if (!msg || String(msg.chat.id) !== ALLOWED) continue;
        const text = (msg.text || '').trim().split(' ')[0]; // ignore args
        if (text === '/stop') {
          const count = stopAllBots();
          await sendTelegramMessage(`🛑 Bot trading an KANPE kounye a! (${count} loop(s) rete)`);
        } else if (text === '/trade') {
          await restartAllBots();
          await sendTelegramMessage('🚀 Bot trading an KÒMANSE travay!');
        }
      }
    } catch (err) {
      logger.debug('[TelegramCmd] Poll error:', err.message);
    }
  }

  setInterval(poll, 3000);
  logger.info('[TelegramCmd] Command listener active (/stop, /trade)');
}

export default {
  sendTelegramMessage,
  sendTelegramPhoto,
  sendTradeNotification,
  sendBotStatusNotification,
  sendAlertNotification,
  sendCircuitBreakerAlert,
  sendConnectionErrorAlert,
  isTelegramConfigured,
};