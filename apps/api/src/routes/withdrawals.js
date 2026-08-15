import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

const DEMO_HISTORY = [
  { id: 'w-001', currency: 'BTC',  amount: 0.015, usdValue: 956.10,  status: 'completed',  network: 'Bitcoin Network', txid: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', date: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'w-002', currency: 'ETH',  amount: 0.8,   usdValue: 2406.40, status: 'completed',  network: 'ERC-20',          txid: '0xdead1234beef5678dead1234beef5678dead1234beef5678dead1234beef5678', address: '0xDeadBeef1234567890AbCdEf1234567890DeAdBe', date: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'w-003', currency: 'USDT', amount: 1000,  usdValue: 1000.00, status: 'pending',    network: 'ERC-20',          txid: '0xabc111def222abc111def222abc111def222abc111def222abc111def2220003', address: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12', date: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'w-004', currency: 'USDC', amount: 500,   usdValue: 500.00,  status: 'processing', network: 'ERC-20',          txid: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0004', address: '0x9F8E7D6C5B4A3F2E1D0C9B8A7F6E5D4C3B2A1F0E', date: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'w-005', currency: 'ETH',  amount: 0.2,   usdValue: 601.60,  status: 'rejected',   network: 'ERC-20',          txid: '',                                                                    address: '0xInvalidAddressWasRejectedByNetwork0000', date: new Date(Date.now() - 5 * 86400000).toISOString() },
];

/**
 * GET /withdrawals
 * Returns withdrawal history for the authenticated user.
 */
router.get('/', authMiddleware, async (req, res) => {
  // Placeholder for live exchange fetch — returns demo data until Coinbase
  // withdrawal history endpoint is wired to a real account.
  res.json(DEMO_HISTORY);
});

/**
 * POST /withdrawals/request
 * Validates and queues a withdrawal request.
 * Does NOT auto-execute; a human or Coinbase-level approval step is required.
 */
router.post('/request', authMiddleware, async (req, res) => {
  const { currency, address, amount } = req.body ?? {};

  if (!currency || !address || !amount) {
    return res.status(400).json({ error: 'currency, address, and amount are required' });
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  // Basic address sanity check
  const isBTC  = currency === 'BTC';
  const isEVM  = ['ETH', 'USDT', 'USDC'].includes(currency);
  const validBTC = isBTC && /^(1|3|bc1)[a-zA-Z0-9]{20,80}$/.test(address);
  const validEVM = isEVM && /^0x[0-9a-fA-F]{40}$/.test(address);

  if (isBTC && !validBTC) return res.status(400).json({ error: 'Invalid Bitcoin address format' });
  if (isEVM && !validEVM) return res.status(400).json({ error: `Invalid EVM address format for ${currency}` });

  const id = `w-${Date.now().toString(36).toUpperCase()}`;
  logger.info(`[withdrawals] Request queued — id=${id} currency=${currency} amount=${amountNum} user=${req.user?.id ?? 'unknown'}`);

  res.status(202).json({
    id,
    status: 'pending',
    currency,
    amount: amountNum,
    address,
    message: 'Withdrawal request received and is pending review.',
    createdAt: new Date().toISOString(),
  });
});

export default router;
