/**
 * Order Manager Service
 * Controls order execution: open position checks, cooldown, order CRUD
 */
import pb from '../utils/pbClient.js';
import logger from '../utils/logger.js';

export const ORDER_STATES = {
  PENDING: 'pending',
  OPEN: 'open',
  FILLED: 'filled',
  PARTIALLY_FILLED: 'partially_filled',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

export const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes
export const MAX_OPEN_POSITIONS_PER_PAIR = 1;

// ✅ CHECK IF PAIR HAS OPEN POSITION
export async function hasOpenPosition(userId, pair) {
  try {
    const openOrders = await pb.collection('bot_orders').getFullList({
      filter: `userId = "${userId}" && pair = "${pair}" && (status = "pending" || status = "open" || status = "partially_filled")`,
    });
    return openOrders.length > 0;
  } catch (error) {
    logger.error('[OrderManager] Error checking open positions:', error?.message);
    return false;
  }
}

// ✅ GET OPEN POSITIONS FOR USER (pair=null means all pairs)
export async function getOpenPositionsForPair(userId, pair) {
  try {
    let filter = `userId = "${userId}" && (status = "pending" || status = "open" || status = "partially_filled")`;
    if (pair) {
      filter += ` && pair = "${pair}"`;
    }
    return await pb.collection('bot_orders').getFullList({ filter });
  } catch (error) {
    logger.error('[OrderManager] Error getting open positions:', error?.message);
    return [];
  }
}

// ✅ CHECK COOLDOWN — CAN WE PLACE A NEW ORDER?
export async function canPlaceOrder(userId, pair) {
  try {
    const lastOrders = await pb.collection('bot_orders').getList(1, 1, {
      filter: `userId = "${userId}" && pair = "${pair}"`,
      sort: '-created',
    });

    if (!lastOrders.items.length) {
      return { canPlace: true, reason: 'No previous orders' };
    }

    const lastOrder = lastOrders.items[0];
    const lastOrderTime = new Date(lastOrder.created).getTime();
    const now = Date.now();
    const timeSinceLastOrder = now - lastOrderTime;

    if (timeSinceLastOrder < COOLDOWN_DURATION) {
      const remainingCooldown = COOLDOWN_DURATION - timeSinceLastOrder;
      const remainingSeconds = Math.ceil(remainingCooldown / 1000);
      return {
        canPlace: false,
        reason: `Cooldown active. Wait ${remainingSeconds}s before next order on ${pair}`,
        remainingCooldown,
      };
    }

    return { canPlace: true, reason: 'Cooldown expired' };
  } catch (error) {
    logger.error('[OrderManager] Error checking cooldown:', error?.message);
    // Fail open on error
    return { canPlace: true, reason: 'Cooldown check error (allowing)' };
  }
}

// ✅ CREATE ORDER RECORD
export async function createOrder(userId, orderData) {
  const order = await pb.collection('bot_orders').create({
    userId,
    pair: orderData.pair,
    side: orderData.side,
    quantity: orderData.quantity || 0.01,
    price: orderData.price || 0,
    orderType: orderData.orderType || 'market',
    status: ORDER_STATES.PENDING,
    externalOrderId: orderData.externalOrderId || '',
    signal: orderData.signal || '',
    confidence: orderData.confidence || 0,
    entryPrice: orderData.entryPrice || 0,
    stopLoss: orderData.stopLoss || 0,
    takeProfit: orderData.takeProfit || 0,
  });

  logger.info(`[OrderManager] Order created: ${order.id} | ${order.pair} ${order.side}`);
  return order;
}

// ✅ UPDATE ORDER STATUS
export async function updateOrderStatus(orderId, status, data = {}) {
  const order = await pb.collection('bot_orders').update(orderId, { status, ...data });
  logger.info(`[OrderManager] Order ${orderId} → ${status}`);
  return order;
}

// ✅ GET ORDERS FOR USER
export async function getOrders(userId, filter = {}) {
  try {
    let filterStr = `userId = "${userId}"`;
    if (filter.pair) filterStr += ` && pair = "${filter.pair}"`;
    if (filter.status) filterStr += ` && status = "${filter.status}"`;
    if (filter.side) filterStr += ` && side = "${filter.side}"`;

    return await pb.collection('bot_orders').getFullList({
      filter: filterStr,
      sort: '-created',
    });
  } catch (error) {
    logger.error('[OrderManager] Error getting orders:', error?.message);
    return [];
  }
}
