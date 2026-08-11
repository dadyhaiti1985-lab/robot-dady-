import { decodePocketBaseAuthToken, getBearerToken, refreshPocketBaseSession } from './pocketbase-token.js';

// Public-friendly auth: if a valid PocketBase token is present, attach the user
// id (so chat history persists). If absent or invalid, allow the request through
// anonymously instead of rejecting it.
export async function optionalPocketbaseAuth(req, res, next) {
	const token = getBearerToken(req);

	if (!token) {
		return next();
	}

	try {
		const tokenData = decodePocketBaseAuthToken(token);

		if (!tokenData) {
			return next();
		}

		const newToken = await refreshPocketBaseSession(tokenData);

		req.pocketbaseUserId = newToken.record.id;
	} catch {
		// Ignore invalid/expired tokens and continue anonymously.
	}

	return next();
}
