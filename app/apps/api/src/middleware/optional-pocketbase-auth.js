import { Buffer } from 'node:buffer';
import Pocketbase from 'pocketbase';

// Public-friendly auth: if a valid PocketBase token is present, attach the user
// id (so chat history persists). If absent or invalid, allow the request through
// anonymously instead of rejecting it.
export async function optionalPocketbaseAuth(req, res, next) {
	const token = req.headers.authorization?.split(' ')?.[1];

	if (!token) {
		return next();
	}

	try {
		const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
		const tokenData = JSON.parse(base64Decoded);

		if (!tokenData?.token || !tokenData?.record) {
			return next();
		}

		const pocketbaseClient = new Pocketbase('http://localhost:8090');
		pocketbaseClient.authStore.save(tokenData.token, tokenData.record);
		const newToken = await pocketbaseClient.collection(tokenData.record.collectionName).authRefresh();

		req.pocketbaseUserId = newToken.record.id;
	} catch {
		// Ignore invalid/expired tokens and continue anonymously.
	}

	return next();
}
