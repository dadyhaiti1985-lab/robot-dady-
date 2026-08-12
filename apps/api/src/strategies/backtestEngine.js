/**
 * Minimal backtest engine — runs a simple signal-based simulation on candle data.
 */

export function runBacktest(candles, options = {}) {
	const {
		initialCapital = 10000,
		riskPerTrade = 0.02,
		stopLossPct = 0.02,
		takeProfitPct = 0.05,
	} = options;

	let capital = initialCapital;
	const trades = [];

	for (let i = 20; i < candles.length - 1; i++) {
		const slice = candles.slice(i - 20, i + 1);
		const closes = slice.map((c) => Number(c.close));
		const sma = closes.reduce((s, v) => s + v, 0) / closes.length;
		const price = closes[closes.length - 1];
		const signal = price > sma ? 'buy' : price < sma ? 'sell' : null;
		if (!signal) continue;

		const size = (capital * riskPerTrade) / (price * stopLossPct);
		const entry = price;
		const exitPrice = signal === 'buy'
			? entry * (1 + takeProfitPct)
			: entry * (1 - takeProfitPct);
		const pnl = signal === 'buy'
			? (exitPrice - entry) * size
			: (entry - exitPrice) * size;

		capital += pnl;
		trades.push({ signal, entry, exit: exitPrice, pnl: Number(pnl.toFixed(2)), capitalAfter: Number(capital.toFixed(2)) });

		// skip a few candles after each trade
		i += 5;
	}

	const wins = trades.filter((t) => t.pnl > 0).length;
	const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);

	return {
		initialCapital,
		finalCapital: Number(capital.toFixed(2)),
		totalPnl: Number(totalPnl.toFixed(2)),
		totalTrades: trades.length,
		winRate: trades.length ? Number(((wins / trades.length) * 100).toFixed(1)) : 0,
		trades: trades.slice(-50),
	};
}
