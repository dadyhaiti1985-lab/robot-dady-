import logger from '../utils/logger.js';

const MAX_STRING_LENGTH = 10_000;
const MAX_DEPTH = 5;

const THREAT_PATTERNS = [
	{
		code: 'SQLI',
		pattern: /(?:\bunion\b\s+\bselect\b|\bdrop\b\s+\btable\b|\binsert\b\s+into\b|\bdelete\b\s+from\b|\bupdate\b\s+\w+\s+set\b|\bor\b\s+1=1\b|\binformation_schema\b|\bsleep\s*\(|\bbenchmark\s*\()/i,
	},
	{
		code: 'XSS',
		pattern: /(?:<\s*script\b|javascript:|on\w+\s*=|<\s*iframe\b|<\s*img\b|data:text\/html)/i,
	},
	{
		code: 'CMD',
		pattern: /(?:\b(?:curl|wget|bash|sh|powershell|cmd|nc|python|node)\b.*(?:\|\||&&|;|`|\$\(|>|<)|(?:\|\||&&|;|`|\$\()\s*(?:curl|wget|bash|sh|powershell|cmd|nc|python|node)\b)/i,
	},
	{
		code: 'TRAVERSAL',
		pattern: /(?:\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i,
	},
	{
		code: 'NOSQL',
		pattern: /(?:\$where\b|\$ne\b|\$gt\b|\$gte\b|\$lt\b|\$lte\b|\$regex\b|\$or\b|\$and\b)/i,
	},
];

function isPlainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function inspectValue(value, path = 'body', depth = 0) {
	if (depth > MAX_DEPTH || value == null) {
		return null;
	}

	if (typeof value === 'string') {
		if (value.length > MAX_STRING_LENGTH) {
			return { code: 'OVERSIZED', path, sample: value.slice(0, 120) };
		}

		for (const threat of THREAT_PATTERNS) {
			if (threat.pattern.test(value)) {
				return { code: threat.code, path, sample: value.slice(0, 120) };
			}
		}

		return null;
	}

	if (Array.isArray(value)) {
		for (let index = 0; index < value.length; index += 1) {
			const result = inspectValue(value[index], `${path}[${index}]`, depth + 1);
			if (result) {
				return result;
			}
		}

		return null;
	}

	if (!isPlainObject(value)) {
		return null;
	}

	for (const [key, nested] of Object.entries(value)) {
		const result = inspectValue(nested, `${path}.${key}`, depth + 1);
		if (result) {
			return result;
		}
	}

	return null;
}

export function securityShield(req, res, next) {
	res.removeHeader('X-Powered-By');
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('Referrer-Policy', 'same-origin');

	const blocked = inspectValue(req.query, 'query')
		|| inspectValue(req.params, 'params')
		|| (req.is?.('multipart/form-data') ? null : inspectValue(req.body, 'body'));

	if (blocked) {
		logger.warn(`[security] blocked ${req.method} ${req.originalUrl} reason=${blocked.code} path=${blocked.path}`);
		return res.status(400).json({
			error: 'Request blocked by security policy',
			code: 'SECURITY_BLOCKED',
		});
	}

	return next();
}

export { inspectValue };