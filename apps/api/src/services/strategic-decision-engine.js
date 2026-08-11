/*
 * PROPRIETARY INTELLECTUAL PROPERTY NOTICE
 * ORACLE TRADER PRO / DADY DESTIN — ALL RIGHTS RESERVED.
 * Unauthorized deployment, copying, or execution is prohibited.
 */

import pb from '../utils/pbClient.js';
import logger from '../utils/logger.js';

const DEFAULT_CONFIG = Object.freeze({
	riskPerTrade: 1,
	dailyLossLimit: 5,
	trailingStopPercent: 50,
	coolOffMinutes: 45,
	maxPositionScale: 1.25,
	minPositionScale: 0.25,
});

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

async function loadUserConfig(userId) {
	if (!userId) return { ...DEFAULT_CONFIG };

	try {
		const config = await pb.collection('botConfig').getFirstListItem(`userId = "${userId}"`);
		return {
			...DEFAULT_CONFIG,
			riskPerTrade: Number(config?.riskPerTrade ?? DEFAULT_CONFIG.riskPerTrade),
			dailyLossLimit: Number(config?.dailyLossLimit ?? DEFAULT_CONFIG.dailyLossLimit),
			trailingStopPercent: Number(config?.trailingStopPercent ?? DEFAULT_CONFIG.trailingStopPercent),
		};
	} catch {
		return { ...DEFAULT_CONFIG };
	}
}

async function loadRecentTrades(userId) {
	if (!userId) return [];

	try {
		const list = await pb.collection('trades').getList(1, 12, {
			filter: `userId = "${userId}"`,
			sort: '-created',
		});
		return list.items || [];
	} catch {
		return [];
	}
}

function getNested(source, paths, fallback = null) {
	for (const path of paths) {
		const value = path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), source);
		if (value !== undefined && value !== null) {
			return value;
		}
	}
	return fallback;
}

function normalizeIndicators(signal = {}) {
	const rsi = Number(getNested(signal, ['indicators.rsi', 'analysis.indicators.rsi', 'analysis.steps.technical.rsi'], NaN));
	const macdHist = Number(getNested(signal, ['indicators.macd.histogram', 'indicators.macdHist', 'analysis.indicators.macd.histogram', 'analysis.steps.technical.macdHist'], NaN));
	const vwap = Number(getNested(signal, ['indicators.vwap', 'analysis.indicators.vwap'], NaN));
	const currentPrice = Number(getNested(signal, ['entryPrice', 'price', 'analysis.price', 'analysis.indicators.currentPrice'], NaN));
	const atrPercent = Number(getNested(signal, ['volatility.atrPercent', 'analysis.steps.volatility.atrPercent', 'marketContext.atrPercent'], NaN));
	const trend15m = String(getNested(signal, ['marketContext.trend15m', 'analysis.steps.technical.trend15m', 'trend15m'], '')).toLowerCase();
	const trend1h = String(getNested(signal, ['marketContext.trend1h', 'analysis.steps.technical.trend1h', 'trend1h'], '')).toLowerCase();
	const trend4h = String(getNested(signal, ['marketContext.trend4h', 'analysis.steps.technical.trend4h', 'trend4h'], '')).toLowerCase();
	const explicitRisk = Number(getNested(signal, ['oracleRiskScore', 'marketRiskScore', 'analysis.marketRiskScore'], NaN));
	const explicitSentiment = String(getNested(signal, ['oracleSentiment', 'marketSentiment', 'analysis.sentiment'], '')).toLowerCase();
	const exhaustionPattern = Boolean(getNested(signal, ['exhaustionPattern', 'marketContext.exhaustionPattern', 'analysis.exhaustionPattern'], false));
	const rsiDivergence = Boolean(getNested(signal, ['indicators.rsiDivergence', 'analysis.indicators.rsiDivergence'], false));
	const macdDivergence = Boolean(getNested(signal, ['indicators.macdDivergence', 'analysis.indicators.macdDivergence'], false));

	return {
		rsi: Number.isFinite(rsi) ? rsi : null,
		macdHist: Number.isFinite(macdHist) ? macdHist : null,
		vwap: Number.isFinite(vwap) ? vwap : null,
		currentPrice: Number.isFinite(currentPrice) ? currentPrice : null,
		atrPercent: Number.isFinite(atrPercent) ? atrPercent : 1.1,
		trend15m,
		trend1h,
		trend4h,
		explicitRisk: Number.isFinite(explicitRisk) ? explicitRisk : null,
		explicitSentiment,
		exhaustionPattern,
		rsiDivergence,
		macdDivergence,
	};
}

function deriveRegime(side, indicators) {
	const trends = [indicators.trend15m, indicators.trend1h, indicators.trend4h].filter(Boolean);
	const bullishCount = trends.filter((trend) => trend === 'bullish').length;
	const bearishCount = trends.filter((trend) => trend === 'bearish').length;

	let macroTrend = 'ranging';
	if (bullishCount >= 2) macroTrend = 'bullish';
	if (bearishCount >= 2) macroTrend = 'bearish';

	if (macroTrend === 'ranging' && indicators.currentPrice && indicators.vwap) {
		if (indicators.currentPrice > indicators.vwap && (indicators.macdHist ?? 0) > 0) macroTrend = 'bullish';
		if (indicators.currentPrice < indicators.vwap && (indicators.macdHist ?? 0) < 0) macroTrend = 'bearish';
	}

	const timeframeAligned =
		(macroTrend === 'bullish' && side === 'buy' && bullishCount >= 2) ||
		(macroTrend === 'bearish' && side === 'sell' && bearishCount >= 2) ||
		(macroTrend === 'ranging' && Math.abs(indicators.macdHist ?? 0) < 2 && indicators.rsi !== null && indicators.rsi >= 40 && indicators.rsi <= 60);

	const counterTrend =
		(macroTrend === 'bullish' && side === 'sell') ||
		(macroTrend === 'bearish' && side === 'buy');

	const volatilityState = indicators.atrPercent >= 3
		? 'extreme'
		: indicators.atrPercent >= 1.8
			? 'elevated'
			: indicators.atrPercent <= 0.8
				? 'compressed'
				: 'normal';

	const mode = macroTrend === 'ranging' ? 'range-scalp' : 'trend-follow';

	return { macroTrend, timeframeAligned, counterTrend, volatilityState, mode };
}

function scoreOracleRisk(side, indicators, regime, confidence) {
	if (indicators.explicitRisk !== null) {
		return clamp(indicators.explicitRisk, 0, 10);
	}

	let score = 4.2;
	if (!regime.timeframeAligned) score += 2.2;
	if (regime.counterTrend) score += 2.0;
	if (regime.volatilityState === 'elevated') score += 1.2;
	if (regime.volatilityState === 'extreme') score += 2.6;
	if (regime.mode === 'range-scalp') score += 0.6;
	if (confidence < 70) score += 1.0;
	if (indicators.rsi !== null && ((side === 'buy' && indicators.rsi > 69) || (side === 'sell' && indicators.rsi < 31))) score += 1.2;
	if (indicators.explicitSentiment === 'high risk') score += 2.0;
	if (indicators.explicitSentiment === 'bearish' && side === 'buy') score += 1.2;
	if (indicators.explicitSentiment === 'bullish' && side === 'sell') score += 1.2;
	if (indicators.rsiDivergence || indicators.macdDivergence) score -= 0.5;
	return clamp(Number(score.toFixed(1)), 0, 10);
}

function analyzeTradeStreak(recentTrades, dailyLossLimitPercent) {
	const now = Date.now();
	const oneDayAgo = now - 24 * 60 * 60 * 1000;
	const closedTrades = recentTrades.filter((trade) => Number.isFinite(Number(trade?.pnl)));
	const dailyTrades = closedTrades.filter((trade) => new Date(trade.created || trade.closedAt || trade.updated || 0).getTime() >= oneDayAgo);
	const dailyPnl = dailyTrades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);

	let consecutiveLosses = 0;
	for (const trade of closedTrades) {
		if (Number(trade.pnl || 0) < 0) consecutiveLosses += 1;
		else break;
	}

	const lastTradeAt = closedTrades[0] ? new Date(closedTrades[0].created || closedTrades[0].closedAt || closedTrades[0].updated || Date.now()).getTime() : 0;
	const dailyLossTriggered = dailyPnl <= -Math.abs(dailyLossLimitPercent);

	return {
		closedTrades: closedTrades.length,
		dailyPnl: Number(dailyPnl.toFixed(2)),
		consecutiveLosses,
		lastTradeAt,
		dailyLossTriggered,
	};
}

function buildProtectionPlan({ side, entryPrice, stopLoss, takeProfit, regime, config }) {
	const breakEvenTriggerPct = 1.5;
	const trailLockRatio = clamp((config.trailingStopPercent || 50) / 100, 0.2, 0.9);
	const stopDistance = Math.abs(entryPrice - stopLoss);
	const takeDistance = Math.abs(takeProfit - entryPrice);

	return {
		breakEvenTriggerPct,
		breakEvenPrice: Number(entryPrice.toFixed(8)),
		trailingActivationPct: Number((regime.volatilityState === 'extreme' ? 2.2 : regime.volatilityState === 'elevated' ? 1.8 : 1.2).toFixed(2)),
		trailLockRatio: Number(trailLockRatio.toFixed(2)),
		initialRiskDistance: Number(stopDistance.toFixed(8)),
		takeProfitDistance: Number(takeDistance.toFixed(8)),
		mode: regime.mode,
		direction: side,
	};
}

export function formatStrategicDecisionLog(decision) {
	const { approved, evaluation, adjustedSignal, reason } = decision;
	const lines = [
		`approved=${approved} reason=${reason}`,
		`regime=${evaluation.marketRegime.macroTrend} volatility=${evaluation.marketRegime.volatilityState} mode=${evaluation.marketRegime.mode}`,
		`mtf=15m:${evaluation.indicators.trend15m || 'n/a'} 1h:${evaluation.indicators.trend1h || 'n/a'} 4h:${evaluation.indicators.trend4h || 'n/a'} aligned=${evaluation.marketRegime.timeframeAligned}`,
		`oracleRisk=${evaluation.oracleRiskScore}/10 counterTrend=${evaluation.marketRegime.counterTrend} consecutiveLosses=${evaluation.tradeState.consecutiveLosses}`,
		`qty=${adjustedSignal.quantity} stopLoss=${adjustedSignal.stopLoss} takeProfit=${adjustedSignal.takeProfit}`,
		`protection=breakEven@${evaluation.protectionPlan.breakEvenTriggerPct}% trail@${evaluation.protectionPlan.trailingActivationPct}% lock=${evaluation.protectionPlan.trailLockRatio}`,
	];
	return lines.join(' | ');
}

export async function evaluateStrategicDecision({ userId, signal, overrides = {} }) {
	const userConfig = overrides.userConfig || await loadUserConfig(userId);
	const recentTrades = overrides.recentTrades || await loadRecentTrades(userId);
	const side = String(signal?.type || signal?.side || '').toLowerCase();
	const pair = String(signal?.pair || signal?.asset || signal?.symbol || 'BTC-USD').toUpperCase();
	const confidence = Number(signal?.confidence || 0);
	const entryPrice = Number(signal?.entryPrice || signal?.price || 0);
	const baseStopLoss = Number(signal?.stopLoss || 0);
	const baseTakeProfit = Number(signal?.takeProfit || 0);
	const baseQuantity = Number(signal?.quantity || 0.01);
	const indicators = normalizeIndicators(signal);
	const marketRegime = deriveRegime(side, indicators);
	const tradeState = analyzeTradeStreak(recentTrades, userConfig.dailyLossLimit);
	const oracleRiskScore = scoreOracleRisk(side, indicators, marketRegime, confidence);
	const reasons = [];

	if (!marketRegime.timeframeAligned) reasons.push('Multi-timeframe alignment missing');
	if (marketRegime.counterTrend && !(indicators.exhaustionPattern || indicators.rsiDivergence || indicators.macdDivergence)) {
		reasons.push('Counter-trend setup without exhaustion confirmation');
	}
	if (marketRegime.volatilityState === 'extreme') reasons.push('Extreme volatility spike detected');
	if (tradeState.consecutiveLosses >= 2 && Date.now() - tradeState.lastTradeAt < userConfig.coolOffMinutes * 60 * 1000) {
		reasons.push(`Cool-off period active after ${tradeState.consecutiveLosses} consecutive losses`);
	}
	if (tradeState.dailyLossTriggered) reasons.push(`Daily drawdown limit reached (${tradeState.dailyPnl})`);
	if (oracleRiskScore > 8) reasons.push(`ORACLE risk score too high (${oracleRiskScore}/10)`);

	let sizeMultiplier = 1;
	if (marketRegime.macroTrend === 'bullish' && side === 'buy') sizeMultiplier += 0.15;
	if (marketRegime.macroTrend === 'bearish' && side === 'sell') sizeMultiplier += 0.15;
	if (marketRegime.mode === 'range-scalp') sizeMultiplier -= 0.35;
	if (marketRegime.volatilityState === 'elevated') sizeMultiplier -= 0.15;
	if (marketRegime.volatilityState === 'extreme') sizeMultiplier -= 0.55;
	if (confidence >= 85) sizeMultiplier += 0.05;
	if (confidence < 65) sizeMultiplier -= 0.1;
	sizeMultiplier = clamp(sizeMultiplier, userConfig.minPositionScale, userConfig.maxPositionScale);

	let adjustedStopLoss = baseStopLoss;
	let adjustedTakeProfit = baseTakeProfit;
	if (entryPrice > 0 && baseStopLoss > 0) {
		const stopDistance = Math.abs(entryPrice - baseStopLoss);
		const widenedDistance = marketRegime.volatilityState === 'extreme'
			? stopDistance * 1.45
			: marketRegime.volatilityState === 'elevated'
				? stopDistance * 1.2
				: stopDistance;
		adjustedStopLoss = side === 'buy'
			? Number((entryPrice - widenedDistance).toFixed(8))
			: Number((entryPrice + widenedDistance).toFixed(8));
	}
	if (entryPrice > 0 && baseTakeProfit > 0) {
		const takeDistance = Math.abs(baseTakeProfit - entryPrice);
		const adjustedDistance = marketRegime.mode === 'range-scalp' ? takeDistance * 0.65 : takeDistance;
		adjustedTakeProfit = side === 'buy'
			? Number((entryPrice + adjustedDistance).toFixed(8))
			: Number((entryPrice - adjustedDistance).toFixed(8));
	}

	const adjustedSignal = {
		...signal,
		pair,
		type: side,
		quantity: Number((baseQuantity * sizeMultiplier).toFixed(8)),
		stopLoss: adjustedStopLoss,
		takeProfit: adjustedTakeProfit,
		confidence,
	};

	const protectionPlan = buildProtectionPlan({
		side,
		entryPrice: entryPrice || Number(signal?.price || 0) || 0,
		stopLoss: adjustedStopLoss || entryPrice,
		takeProfit: adjustedTakeProfit || entryPrice,
		regime: marketRegime,
		config: userConfig,
	});

	const approved = reasons.length === 0;
	const decision = {
		approved,
		code: approved ? 'STRATEGIC_APPROVED' : 'STRATEGIC_BLOCKED',
		reason: approved
			? `Approved: ${marketRegime.mode} ${marketRegime.macroTrend} context, ORACLE risk ${oracleRiskScore}/10`
			: reasons.join(' | '),
		adjustedSignal,
		evaluation: {
			pair,
			side,
			confidence,
			userConfig,
			indicators,
			marketRegime,
			oracleRiskScore,
			tradeState,
			protectionPlan,
			reasons,
			sizeMultiplier: Number(sizeMultiplier.toFixed(2)),
		},
	};

	logger.info(`[StrategicDecision] ${pair} ${side.toUpperCase()} :: ${formatStrategicDecisionLog(decision)}`);
	return decision;
}
