import rateLimit from 'express-rate-limit';

const limiterOptions = {
	standardHeaders: true,
	legacyHeaders: false,
	validate: { trustProxy: false },
};

export const authRouteLimiter = rateLimit({
	...limiterOptions,
	windowMs: 10 * 60 * 1000,
	max: 60,
	message: { error: 'Too many authentication requests, please slow down' },
});

export const webhookRouteLimiter = rateLimit({
	...limiterOptions,
	windowMs: 5 * 60 * 1000,
	max: 1200,
	message: { error: 'Webhook traffic limited temporarily' },
});

export const apiBurstLimiter = rateLimit({
	...limiterOptions,
	windowMs: 60 * 1000,
	max: 120,
	message: { error: 'API rate limit exceeded, please try again later' },
});