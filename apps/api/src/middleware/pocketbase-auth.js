import { decodePocketBaseAuthToken, getBearerToken, refreshPocketBaseSession } from './pocketbase-token.js';

function unauthorizedError(message) {
	const error = new Error(message);
	error.status = 401;
	return error;
}

function forbiddenError(message) {
	const error = new Error(message);
	error.status = 403;
	return error;
}

export async function pocketbaseAuth(req, res, next) {
	const token = getBearerToken(req);

	// Auth is enforced by default. To allow public (anonymous) access, remove this
	// middleware from the route (apps/api/src/routes/integrated-ai.js).
	if (!token) {
		return next(unauthorizedError('Please sign in or create an account to use the chat.'));
	}

	try {
		const tokenData = decodePocketBaseAuthToken(token);

		if (!tokenData) {
			return next(unauthorizedError('Your session has expired. Please sign in again.'));
		}

		// by refreshing token we verify that it was not intercepted by a malicious user
		const newToken = await refreshPocketBaseSession(tokenData);

		if (!newToken.record.verified) {
			return next(forbiddenError('Please verify your email to use the chat. Check your inbox for the verification link.'));
		}

		req.pocketbaseUserId = newToken.record.id;

		return next();
	} catch {
		return next(unauthorizedError('Your session has expired. Please sign in again.'));
	}
}
