import express from 'express';
import logger from '../utils/logger.js';
import pb from '../utils/pbClient.js';

const router = express.Router();

/**
 * GET /bot/trades - List user's trades
 * Query params: limit (default 50), offset (default 0), status (open|closed|all)
 * Returns: Array of trades with columns: date, instrument, entryPrice, exitPrice, quantity, pnl, status
 */
router.get('/', async (req, res) => {
  const { limit = 50, offset = 0, status = 'all' } = req.query;

  try {
    logger.info(`Fetching trades: limit=${limit}, offset=${offset}, status=${status}`);

    // Build filter
    let filter = '';
    if (status !== 'all') {
      filter = `status = "${status.toUpperCase()}"`;
    }

    const trades = await pb.collection('trades').getList(
      parseInt(offset) + 1,
      parseInt(limit),
      {
        filter: filter || undefined,
        sort: '-timestamp',
      }
    );

    const formattedTrades = trades.items.map(trade => ({
      id: trade.id,
      date: trade.timestamp || trade.created,
      instrument: trade.symbol,
      entryPrice: parseFloat(trade.entryPrice),
      exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice) : null,
      quantity: parseFloat(trade.quantity),
      pnl: trade.pnl ? parseFloat(trade.pnl) : 0,
      status: trade.status,
      side: trade.side,
      orderId: trade.orderId,
    }));

    logger.info(`Fetched ${formattedTrades.length} trades`);

    res.json(formattedTrades);
  } catch (error) {
    // If collection doesn't exist or no trades found, return empty array
    if (error.status === 404 || error.message.includes('No items found')) {
      logger.info('No trades found');
      res.json([]);
    } else {
      logger.error('Failed to fetch trades:', error.message);
      throw error;
    }
  }
});

export default router;