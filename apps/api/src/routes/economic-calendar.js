import { Router } from 'express';

const router = Router();

const CALENDAR_FEED_URL = process.env.ECONOMIC_CALENDAR_FEED_URL || 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const HIGH_IMPACT_HORIZON_MS = 2 * 60 * 60 * 1000;

const FALLBACK_EVENTS = [
	{ title: 'US CPI m/m', country: 'USD', impact: 'High', forecast: '0.3%', previous: '0.2%', actual: '', offsetMinutes: 45 },
	{ title: 'FOMC Member Speech', country: 'USD', impact: 'Medium', forecast: '', previous: '', actual: '', offsetMinutes: 105 },
	{ title: 'UK GDP q/q', country: 'GBP', impact: 'High', forecast: '0.2%', previous: '0.1%', actual: '', offsetMinutes: 210 },
	{ title: 'German ZEW Economic Sentiment', country: 'EUR', impact: 'Medium', forecast: '37.4', previous: '35.2', actual: '', offsetMinutes: 310 },
	{ title: 'US PPI m/m', country: 'USD', impact: 'High', forecast: '0.2%', previous: '0.1%', actual: '', offsetMinutes: 420 },
	{ title: 'Core Retail Sales m/m', country: 'USD', impact: 'Medium', forecast: '0.4%', previous: '0.5%', actual: '', offsetMinutes: 520 },
	{ title: 'ECB President Lagarde Speaks', country: 'EUR', impact: 'Low', forecast: '', previous: '', actual: '', offsetMinutes: 860 },
	{ title: 'BoE Rate Decision', country: 'GBP', impact: 'High', forecast: '5.00%', previous: '5.00%', actual: '', offsetMinutes: 1480 },
];

function getRangeWindow(range) {
	const now = new Date();
	const start = new Date(now);
	const end = new Date(now);

	if (range === 'today') {
		start.setHours(0, 0, 0, 0);
		end.setHours(23, 59, 59, 999);
		return { start, end };
	}

	if (range === 'upcoming') {
		end.setDate(end.getDate() + 3);
		return { start: now, end };
	}

	end.setDate(end.getDate() + 7);
	return { start, end };
}

function normalizeImpact(value) {
	const impact = String(value || 'Low').toLowerCase();
	if (impact.includes('high')) return 'High';
	if (impact.includes('medium') || impact.includes('moderate')) return 'Medium';
	if (impact.includes('holiday')) return 'Holiday';
	return 'Low';
}

function impactWeight(impact) {
	if (impact === 'High') return 3;
	if (impact === 'Medium') return 2;
	if (impact === 'Low') return 1;
	return 0;
}

function mapRegion(country) {
	if (country === 'USD') return 'Global';
	if (country === 'EUR') return 'EUR';
	if (country === 'GBP') return 'GBP';
	return 'Global';
}

function buildFallbackFeed() {
	const now = Date.now();
	return FALLBACK_EVENTS.map((event, index) => ({
		id: `fallback-${index}`,
		title: event.title,
		country: event.country,
		date: new Date(now + event.offsetMinutes * 60 * 1000).toISOString(),
		impact: event.impact,
		forecast: event.forecast,
		previous: event.previous,
		actual: event.actual,
	}));
}

function normalizeEvent(event, index) {
	const date = new Date(event.date || event.timestamp || event.time || Date.now());
	const impact = normalizeImpact(event.impact);
	const country = String(event.country || event.currency || event.region || 'Global').toUpperCase();
	const title = String(event.title || event.event || event.name || 'Macro Event');
	const actual = event.actual ?? event.actualValue ?? '';
	const forecast = event.forecast ?? event.consensus ?? '';
	const previous = event.previous ?? event.prior ?? '';
	const minutesUntil = Math.round((date.getTime() - Date.now()) / 60000);

	return {
		id: event.id || `${country}-${title}-${index}`,
		date: date.toISOString(),
		localTime: date.toLocaleString([], {
			year: '2-digit',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}),
		country,
		region: mapRegion(country),
		event: title,
		impact,
		impactWeight: impactWeight(impact),
		actual: String(actual || '—'),
		forecast: String(forecast || '—'),
		previous: String(previous || '—'),
		minutesUntil,
		isUpcoming: minutesUntil >= 0,
		isHighImpactSoon: impact === 'High' && date.getTime() - Date.now() >= 0 && date.getTime() - Date.now() <= HIGH_IMPACT_HORIZON_MS,
	};
}

async function fetchCalendarFeed() {
	try {
		const response = await fetch(CALENDAR_FEED_URL, { signal: AbortSignal.timeout(10_000) });
		if (!response.ok) {
			throw new Error(`feed responded ${response.status}`);
		}
		const payload = await response.json();
		return { source: 'live', events: Array.isArray(payload) ? payload : [] };
	} catch {
		return { source: 'fallback', events: buildFallbackFeed() };
	}
}

function filterEvents(events, { range, impact, currency }) {
	const { start, end } = getRangeWindow(range);
	return events.filter((event) => {
		const eventDate = new Date(event.date);
		if (Number.isNaN(eventDate.getTime())) return false;
		if (eventDate < start || eventDate > end) return false;
		if (impact && impact !== 'all' && event.impact.toLowerCase() !== impact.toLowerCase()) return false;
		if (currency && currency !== 'all') {
			const normalized = currency.toUpperCase();
			if (normalized === 'GLOBAL') {
				return true;
			}
			if (event.country !== normalized && event.region !== normalized) return false;
		}
		return true;
	});
}

router.get('/', async (req, res) => {
	const range = String(req.query.range || 'week').toLowerCase();
	const impact = String(req.query.impact || 'all').toLowerCase();
	const currency = String(req.query.currency || 'all');

	const feed = await fetchCalendarFeed();
	const normalized = feed.events.map(normalizeEvent).sort((left, right) => new Date(left.date) - new Date(right.date));
	const filtered = filterEvents(normalized, { range, impact, currency });
	const nextHighImpact = filtered.find((event) => event.isHighImpactSoon);

	return res.json({
		success: true,
		source: feed.source,
		updatedAt: new Date().toISOString(),
		riskStatus: {
			cautionMode: Boolean(nextHighImpact),
			nextHighImpactEvent: nextHighImpact || null,
			message: nextHighImpact
				? `High impact event approaching: ${nextHighImpact.event} in ${Math.max(0, nextHighImpact.minutesUntil)} min`
				: 'No high impact releases within the next 2 hours.',
		},
		events: filtered,
	});
});

export default router;