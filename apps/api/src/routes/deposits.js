import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import * as coinbase from '../utils/coinbase.js';
import logger from '../utils/logger.js';

const router = Router();

// In-memory demo deposits — returned when Coinbase is in demo mode
const DEMO_DEPOSITS = [
  { id: 'd-001', currency: 'BTC',  amount: 0.025, usdValue: 1593.50, status: 'completed',  network: 'Bitcoin Network', txid: '3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'd-002', currency: 'ETH',  amount: 1.5,   usdValue: 4512.00, status: 'completed',  network: 'ERC-20',          txid: '0xabc123def456abc123def456abc123def456abc123def456abc123def4560001', date: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'd-003', currency: 'USDT', amount: 2000,  usdValue: 2000.00, status: 'completed',  network: 'ERC-20',          txid: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e', date: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'd-004', currency: 'BTC',  amount: 0.01,  usdValue: 637.40,  status: 'pending',    network: 'Bitcoin Network', txid: '1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', date: new Date(Date.now() - 3600000).toISOString() },
  { id: 'd-005', currency: 'USDC', amount: 500,   usdValue: 500.00,  status: 'processing', network: 'ERC-20',          txid: '0x1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f0002', date: new Date(Date.now() - 1800000).toISOString() },
];

// Coinbase currency → account currency code mapping
const CURRENCY_MAP = {
  BTC: 'BTC', ETH: 'ETH', USDT: 'USDT', USDC: 'USDC',
};

/**
 * GET /deposits
 * Returns deposit history for the authenticated user.
 * Falls back to demo data when Coinbase is not connected.
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await coinbase.getTransactions?.();
    if (Array.isArray(transactions) && transactions.length > 0) {
      const deposits = transactions
        .filter((t) => t.type === 'send' || t.type === 'fiat_deposit' || t.type === 'exchange_deposit')
        .map((t) => ({
          id: t.id,
          currency: t.amount?.currency || 'USD',
          amount: parseFloat(t.amount?.amount || 0),
          usdValue: parseFloat(t.native_amount?.amount || 0),
          status: t.status === 'completed' ? 'completed' : t.status === 'pending' ? 'pending' : 'processing',
          network: t.network?.name || 'Coinbase',
          txid: t.network?.hash || t.id,
          date: t.created_at || new Date().toISOString(),
        }));
      return res.json(deposits);
    }
  } catch (err) {
    logger.debug('[deposits] Coinbase fetch failed, using demo data:', err.message);
  }

  res.json(DEMO_DEPOSITS);
});

/**
 * GET /deposits/address?currency=BTC
 * Returns the deposit wallet address for the given currency.
 */
router.get('/address', authMiddleware, async (req, res) => {
  const { currency } = req.query;
  const code = CURRENCY_MAP[String(currency).toUpperCase()];

  if (!code) {
    return res.status(400).json({ error: 'Unsupported currency' });
  }

  try {
    const accounts = await coinbase.getAccounts?.();
    if (Array.isArray(accounts)) {
      const account = accounts.find((a) => a.currency?.code === code || a.currency === code);
      if (account?.id) {
        const addressData = await coinbase.getDepositAddress?.(account.id);
        if (addressData?.address) {
          return res.json({ currency: code, address: addressData.address, network: addressData.network });
        }
      }
    }
  } catch (err) {
    logger.debug('[deposits] Could not fetch address from Coinbase:', err.message);
  }

  // Coinbase not connected — inform the frontend gracefully
  res.status(503).json({ error: 'Exchange not connected', code: 'EXCHANGE_UNAVAILABLE' });
});

export default router;
