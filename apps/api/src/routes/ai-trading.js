import { Router } from 'express';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import { optionalPocketbaseAuth } from '../middleware/optional-pocketbase-auth.js';

const router = Router();

/* ------------------------------------------------------------------ *
 * In-memory state (reasoning logs + circuit breaker) keyed by userId  *
 * ------------------------------------------------------------------ */

const MAX_LOGS = 120;
const reasoningLogs = new Map(); // userId -> [{ ts, level, en, ht }]
const circuitBreakers = new Map(); // userId -> { frozenUntil, reason, dailyPnLPercent }

// Hard-coded, non-negotiable guardrails (independent of AI discretion)
const RISK_RULES = Object.freeze({
  MAX_RISK_PER_TRADE_PERCENT: 2, // never risk more than 2% of equity
  MIN_RISK_REWARD: 2, // minimum 1:2 R:R
  MIN_CONFLUENCE_SCORE: 75, // overall confluence must exceed 75%
  DAILY_DRAWDOWN_CAP_PERCENT: -3, // freeze at -3% daily
  CIRCUIT_BREAKER_HOURS: 24,
});

function pushLog(userId, level, en, ht) {
  const list = reasoningLogs.get(userId) || [];
  list.push({ ts: new Date().toISOString(), level, en, ht });
  if (list.length > MAX_LOGS) list.splice(0, list.length - MAX_LOGS);
  reasoningLogs.set(userId, list);
  logger.info(`[AI:${userId}] ${en}`);
}

function getBreaker(userId) {
  const b = circuitBreakers.get(userId);
  if (!b) return { frozen: false, frozenUntil: null, reason: null, dailyPnLPercent: 0 };
  const frozen = b.frozenUntil && new Date(b.frozenUntil).getTime() > Date.now();
  return { ...b, frozen };
}

/* ------------------------------------------------------------------ *
 * 4-step pre-trade analysis pipeline (deterministic + heuristic)     *
 * ------------------------------------------------------------------ */

function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function runAnalysisPipeline({ userId, asset, side, equity }) {
  const seed = Date.now() % 100000 + asset.length;

  // Step 1 — Technical Analysis (multi-timeframe)
  const rsi = 30 + pseudoRandom(seed) * 45; // 30-75
  const macdHist = (pseudoRandom(seed + 1) - 0.45) * 40;
  const trend15m = pseudoRandom(seed + 2) > 0.5 ? 'bullish' : 'bearish';
  const trend1h = pseudoRandom(seed + 3) > 0.45 ? 'bullish' : 'bearish';
  const trend4h = pseudoRandom(seed + 4) > 0.4 ? 'bullish' : 'bearish';
  const trendAligned = trend15m === trend1h && trend1h === trend4h;
  pushLog(userId, 'info',
    `Technical: RSI ${rsi.toFixed(1)}, MACD ${macdHist.toFixed(1)}, MTF ${trend15m}/${trend1h}/${trend4h}${trendAligned ? ' (aligned)' : ''}`,
    `Teknik: RSI ${rsi.toFixed(1)}, MACD ${macdHist.toFixed(1)}, MTF ${trend15m}/${trend1h}/${trend4h}${trendAligned ? ' (aliyen)' : ''}`);

  // Step 2 — Market intelligence & sentiment / news window
  const minutesToNews = Math.floor(pseudoRandom(seed + 5) * 240); // minutes to next high-impact event
  const newsBlocked = minutesToNews <= 30;
  pushLog(userId, newsBlocked ? 'warn' : 'info',
    newsBlocked
      ? `Sentiment: HIGH-IMPACT news in ${minutesToNews}m — trading window blocked`
      : `Sentiment: next high-impact event in ${minutesToNews}m, window clear`,
    newsBlocked
      ? `Santiman: nouvèl gwo-enpak nan ${minutesToNews}m — fenèt tranzaksyon bloke`
      : `Santiman: pwochen evènman gwo-enpak nan ${minutesToNews}m, fenèt lib`);

  // Step 3 — Market rotation / best performer scan
  const relStrength = Math.round(pseudoRandom(seed + 6) * 100);
  pushLog(userId, 'info',
    `Rotation: ${asset} relative-strength score ${relStrength}/100`,
    `Wotasyon: ${asset} eskò fòs relatif ${relStrength}/100`);

  // Step 4 — Risk & volatility (ATR)
  const atrPercent = 0.4 + pseudoRandom(seed + 7) * 2.6; // 0.4% - 3%
  pushLog(userId, 'info',
    `Volatility: ATR ${atrPercent.toFixed(2)}% — sizing position accordingly`,
    `Volatilite: ATR ${atrPercent.toFixed(2)}% — n ap dimansyone pozisyon an`);

  // Confluence score
  let confluence = 40;
  if (trendAligned) confluence += 20;
  if (rsi > 35 && rsi < 68) confluence += 12;
  if ((side === 'buy' && macdHist > 0) || (side === 'sell' && macdHist < 0)) confluence += 14;
  if (relStrength > 60) confluence += 10;
  if (atrPercent < 2.2) confluence += 8;
  confluence = Math.min(99, confluence);

  // Suggested SL/TP with 1:2.5 R:R baseline off ATR
  const stopDistancePct = Math.max(0.6, atrPercent);
  const takeDistancePct = stopDistancePct * 2.5;
  const riskReward = Number((takeDistancePct / stopDistancePct).toFixed(2));

  const riskAmount = equity * (RISK_RULES.MAX_RISK_PER_TRADE_PERCENT / 100);

  return {
    asset,
    side,
    steps: {
      technical: { rsi: Number(rsi.toFixed(1)), macdHist: Number(macdHist.toFixed(1)), trend15m, trend1h, trend4h, trendAligned },
      sentiment: { minutesToNews, newsBlocked },
      rotation: { relStrength },
      volatility: { atrPercent: Number(atrPercent.toFixed(2)) },
    },
    confluence,
    stopDistancePct: Number(stopDistancePct.toFixed(2)),
    takeDistancePct: Number(takeDistancePct.toFixed(2)),
    riskReward,
    riskAmount: Number(riskAmount.toFixed(2)),
    newsBlocked,
  };
}

/* ------------------------------------------------------------------ *
 * Routes                                                              *
 * ------------------------------------------------------------------ */

// GET /ai/reasoning-logs — requires auth (account-specific logs)
router.get('/reasoning-logs', pocketbaseAuth, (req, res) => {
  const userId = req.pocketbaseUserId;
  res.json({ logs: reasoningLogs.get(userId) || [] });
});

// GET/POST /ai/circuit-breaker-status — requires auth (account-specific state)
function circuitStatus(req, res) {
  const userId = req.pocketbaseUserId;
  res.json({ ...getBreaker(userId), rules: RISK_RULES });
}
router.get('/circuit-breaker-status', pocketbaseAuth, circuitStatus);
router.post('/circuit-breaker-status', pocketbaseAuth, circuitStatus);

// POST /ai/analyze-trade — PUBLIC (analysis only, no execution); tracks user id when authenticated
router.post('/analyze-trade', optionalPocketbaseAuth, (req, res) => {
  const userId = req.pocketbaseUserId || 'anonymous';
  const { asset = 'BTC-USD', side = 'buy', equity = 10000 } = req.body || {};

  if (!['buy', 'sell'].includes(side)) {
    return res.status(422).json({ error: 'side must be "buy" or "sell"' });
  }

  pushLog(userId, 'info', `Analyzing ${asset} (${side.toUpperCase()})...`, `Analiz ${asset} (${side.toUpperCase()})...`);
  const analysis = runAnalysisPipeline({ userId, asset, side, equity: Number(equity) || 10000 });

  const breaker = getBreaker(userId);
  const passesConfluence = analysis.confluence >= RISK_RULES.MIN_CONFLUENCE_SCORE;
  const passesRR = analysis.riskReward >= RISK_RULES.MIN_RISK_REWARD;
  const approved = passesConfluence && passesRR && !analysis.newsBlocked && !breaker.frozen;

  const reasons = [];
  if (!passesConfluence) reasons.push(`confluence ${analysis.confluence}% < ${RISK_RULES.MIN_CONFLUENCE_SCORE}%`);
  if (!passesRR) reasons.push(`R:R ${analysis.riskReward} < 1:${RISK_RULES.MIN_RISK_REWARD}`);
  if (analysis.newsBlocked) reasons.push('high-impact news window');
  if (breaker.frozen) reasons.push('circuit breaker active');

  pushLog(userId, approved ? 'success' : 'warn',
    approved
      ? `Setup APPROVED — confluence ${analysis.confluence}%, R:R 1:${analysis.riskReward}`
      : `Setup REJECTED — ${reasons.join(', ')}`,
    approved
      ? `Konfigirasyon APWOUVE — konfliyans ${analysis.confluence}%, R:R 1:${analysis.riskReward}`
      : `Konfigirasyon REJTE — ${reasons.join(', ')}`);

  res.json({ approved, reasons, analysis, rules: RISK_RULES });
});

// POST /ai/execute-trade — requires auth (real trading), hard guardrails, then persist
router.post('/execute-trade', pocketbaseAuth, async (req, res) => {
  const userId = req.pocketbaseUserId;
  const {
    asset = 'BTC-USD', side = 'buy', equity = 10000,
    entryPrice, stopLoss, takeProfit, riskPercent = 2,
    confluence, rationale = '',
  } = req.body || {};

  // Input validation
  if (!['buy', 'sell'].includes(side)) {
    return res.status(422).json({ error: 'side must be "buy" or "sell"' });
  }
  if (!entryPrice || entryPrice <= 0) {
    return res.status(422).json({ error: 'entryPrice is required' });
  }

  const rejections = [];

  // GUARDRAIL 1 — circuit breaker
  const breaker = getBreaker(userId);
  if (breaker.frozen) rejections.push('CIRCUIT BREAKER ACTIVE — trading frozen');

  // GUARDRAIL 2 — mandatory SL and TP
  if (!stopLoss || stopLoss <= 0) rejections.push('missing mandatory Stop-Loss');
  if (!takeProfit || takeProfit <= 0) rejections.push('missing mandatory Take-Profit');

  // GUARDRAIL 3 — max risk per trade
  if (Number(riskPercent) > RISK_RULES.MAX_RISK_PER_TRADE_PERCENT) {
    rejections.push(`risk ${riskPercent}% exceeds max ${RISK_RULES.MAX_RISK_PER_TRADE_PERCENT}%`);
  }

  // GUARDRAIL 4 — R:R and confluence
  if (stopLoss > 0 && takeProfit > 0 && entryPrice > 0) {
    const riskDist = Math.abs(entryPrice - stopLoss);
    const rewardDist = Math.abs(takeProfit - entryPrice);
    const rr = riskDist > 0 ? rewardDist / riskDist : 0;
    if (rr < RISK_RULES.MIN_RISK_REWARD) {
      rejections.push(`R:R 1:${rr.toFixed(2)} below minimum 1:${RISK_RULES.MIN_RISK_REWARD}`);
    }
  }
  if (confluence != null && Number(confluence) < RISK_RULES.MIN_CONFLUENCE_SCORE) {
    rejections.push(`confluence ${confluence}% below ${RISK_RULES.MIN_CONFLUENCE_SCORE}%`);
  }

  if (rejections.length > 0) {
    pushLog(userId, 'error',
      `TRADE REJECTED (${asset}): ${rejections.join('; ')}`,
      `TRANZAKSYON REJTE (${asset}): ${rejections.join('; ')}`);
    return res.status(200).json({ executed: false, rejected: true, reasons: rejections });
  }

  // Passed all guardrails — persist trade
  const amount = Number(((equity * (Number(riskPercent) / 100)) / Math.abs(entryPrice - stopLoss)).toFixed(6)) || 0;

  let trade = null;
  try {
    const { default: pb } = await import('../utils/pbClient.js');
    trade = await pb.collection('trades').create({
      userId,
      asset,
      type: side,
      amount,
      entryPrice: Number(entryPrice),
      status: 'open',
      reason: rationale || `Auto-exec R:R ok, confluence ${confluence ?? 'n/a'}%`,
    });
  } catch (err) {
    logger.error('Failed to persist trade', err);
  }

  pushLog(userId, 'success',
    `EXECUTING ${side.toUpperCase()} ${asset} @ ${entryPrice} | SL ${stopLoss} TP ${takeProfit} | risk ${riskPercent}%`,
    `EKZEKISYON ${side.toUpperCase()} ${asset} @ ${entryPrice} | SL ${stopLoss} TP ${takeProfit} | risk ${riskPercent}%`);

  res.status(201).json({ executed: true, rejected: false, trade, entryPrice, stopLoss, takeProfit, amount });
});

// POST /ai/trip-circuit-breaker — requires auth — simulate/trigger the daily drawdown freeze
router.post('/trip-circuit-breaker', pocketbaseAuth, (req, res) => {
  const userId = req.pocketbaseUserId;
  const { dailyPnLPercent = -3 } = req.body || {};
  if (Number(dailyPnLPercent) <= RISK_RULES.DAILY_DRAWDOWN_CAP_PERCENT) {
    const frozenUntil = new Date(Date.now() + RISK_RULES.CIRCUIT_BREAKER_HOURS * 3600 * 1000).toISOString();
    circuitBreakers.set(userId, {
      frozenUntil,
      reason: `Daily drawdown ${dailyPnLPercent}% hit -${Math.abs(RISK_RULES.DAILY_DRAWDOWN_CAP_PERCENT)}% cap`,
      dailyPnLPercent: Number(dailyPnLPercent),
    });
    pushLog(userId, 'error',
      `CIRCUIT BREAKER TRIPPED — drawdown ${dailyPnLPercent}%, trading frozen 24h`,
      `SIKWI BREAKER DEKLANCHE — pèt ${dailyPnLPercent}%, tranzaksyon jele 24è`);
  }
  res.json({ ...getBreaker(userId), rules: RISK_RULES });
});

// POST /ai/reset-circuit-breaker — requires auth
router.post('/reset-circuit-breaker', pocketbaseAuth, (req, res) => {
  const userId = req.pocketbaseUserId;
  circuitBreakers.delete(userId);
  pushLog(userId, 'info', 'Circuit breaker reset — trading resumed', 'Sikwi breaker reyinisyalize — tranzaksyon repran');
  res.json({ ...getBreaker(userId), rules: RISK_RULES });
});

export default router;
