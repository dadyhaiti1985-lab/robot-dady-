/**
 * Bot Execution Controller
 * Central gatekeeper: validates every signal before an order is created
 */
import logger from '../utils/logger.js';
import {
  getOpenPositionsForPair,
  canPlaceOrder,
  createOrder,
  MAX_OPEN_POSITIONS_PER_PAIR,
} from '../services/order-manager.js';
import {
  isNewSignal,
  markSignalProcessed,
} from '../services/signal-state.js';
import { evaluateStrategicDecision } from '../services/strategic-decision-engine.js';
import { registerProtectedPosition } from '../services/live-position-guard.js';

// ✅ EXECUTE TRADE SIGNAL (central entry point)
export async function executeTradeSignal(userId, signal) {
  const { pair, type, confidence, entryPrice, stopLoss, takeProfit, candleTime } = signal;

  logger.info(`[BotExecution] Signal received: ${pair} ${type} conf=${confidence} candle=${candleTime}`);

  // STEP 1 — Reject duplicate signals within the same candle
  if (candleTime && !isNewSignal(userId, pair, candleTime)) {
    return { success: false, reason: 'Signal already processed in this candle', code: 'DUPLICATE_SIGNAL' };
  }

  // STEP 2 — Max open positions per pair
  const openPositions = await getOpenPositionsForPair(userId, pair);
  if (openPositions.length >= MAX_OPEN_POSITIONS_PER_PAIR) {
    if (candleTime) markSignalProcessed(userId, pair, candleTime);
    return {
      success: false,
      reason: `Max open positions (${MAX_OPEN_POSITIONS_PER_PAIR}) reached for ${pair}`,
      code: 'MAX_POSITIONS_REACHED',
      openPositions: openPositions.length,
    };
  }

  // STEP 3 — Cooldown check
  const cooldownCheck = await canPlaceOrder(userId, pair);
  if (!cooldownCheck.canPlace) {
    if (candleTime) markSignalProcessed(userId, pair, candleTime);
    return {
      success: false,
      reason: cooldownCheck.reason,
      code: 'COOLDOWN_ACTIVE',
      remainingCooldown: cooldownCheck.remainingCooldown,
    };
  }

  // STEP 4 — Signal validation
  if (!type || !['buy', 'sell'].includes(type.toLowerCase())) {
    return { success: false, reason: `Invalid signal type: ${type}`, code: 'INVALID_SIGNAL' };
  }

  const conf = Number(confidence) || 0;
  if (conf < 50) {
    return { success: false, reason: `Confidence too low (${conf}%)`, code: 'LOW_CONFIDENCE' };
  }

	// STEP 5 — Strategic decision middleware layer
	const strategicDecision = await evaluateStrategicDecision({ userId, signal });
	if (!strategicDecision.approved) {
		if (candleTime) markSignalProcessed(userId, pair, candleTime);
		return {
			success: false,
			reason: strategicDecision.reason,
			code: strategicDecision.code,
			strategicEvaluation: strategicDecision.evaluation,
		};
	}

  // STEP 6 — Create order record
  let order;
  try {
    order = await createOrder(userId, {
      pair: strategicDecision.adjustedSignal.pair,
      side: strategicDecision.adjustedSignal.type.toLowerCase(),
      quantity: strategicDecision.adjustedSignal.quantity || 0.01,
      price: strategicDecision.adjustedSignal.entryPrice || entryPrice || 0,
      orderType: 'market',
      signal: type,
      confidence: conf,
      entryPrice: strategicDecision.adjustedSignal.entryPrice || entryPrice || 0,
      stopLoss: strategicDecision.adjustedSignal.stopLoss || stopLoss || 0,
      takeProfit: strategicDecision.adjustedSignal.takeProfit || takeProfit || 0,
    });
  } catch (err) {
    logger.error('[BotExecution] Failed to create order:', err?.message);
    return { success: false, reason: err.message, code: 'EXECUTION_ERROR' };
  }

  // STEP 7 — Mark signal processed
  if (candleTime) markSignalProcessed(userId, pair, candleTime);

  registerProtectedPosition({
    userId,
    order,
    protectionPlan: strategicDecision.evaluation.protectionPlan,
  });

  logger.info(`[BotExecution] Order placed: ${order.id} | ${pair} ${type}`);
  return {
    success: true,
    orderId: order.id,
    pair,
    side: type,
    confidence: conf,
    strategicEvaluation: strategicDecision.evaluation,
    message: `Order placed for ${pair}`,
  };
}

// ✅ GET BOT STATISTICS
export async function getBotStats(userId) {
  try {
    const openPositions = await getOpenPositionsForPair(userId, null);
    return {
      openPositions: openPositions.length,
      positions: openPositions.map(p => ({
        pair: p.pair,
        side: p.side,
        quantity: p.quantity,
        status: p.status,
      })),
    };
  } catch (error) {
    logger.error('[BotExecution] Error getting bot stats:', error?.message);
    return { openPositions: 0, positions: [] };
  }
}
