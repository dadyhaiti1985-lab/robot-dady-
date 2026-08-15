import { Router } from 'express';
import { SystemPrompt } from '../constants/prompts.js';
import { uploadFiles } from '../middleware/file-upload.js';
import { integratedAiRateLimit } from '../middleware/integrated-ai-rate-limit.js';
import { optionalPocketbaseAuth } from '../middleware/optional-pocketbase-auth.js';

const router = Router();

// Loaded lazily: the shipped integrated-ai module eagerly boots a PocketBase
// client at import time and exits the process if PocketBase is not up yet.
// Importing it inside the handler keeps the API server alive (and every other
// endpoint responding) even when PocketBase is briefly unavailable.
const loadIntegratedAi = () => import('../api/integrated-ai.js');

// AI chat is public: anonymous visitors can chat without signing in.
// When a valid token is present, we attach the user id so history persists.
router.use(optionalPocketbaseAuth);

router.post('/stream', integratedAiRateLimit, uploadFiles({
	allowedMimeTypes: [
		'image/jpeg',
		'image/png',
		'image/webp',
	],
	fieldName: 'images',
}), async (req, res) => {
	const { message } = req.body;

	if (!message) {
		throw new Error('message is required');
	}

	if (typeof message !== 'string') {
		return res.status(400).json({ error: 'message must be a string' });
	}

	const parsedMessage = JSON.parse(message);

	const { ContentBlockType, stream, uploadImagesToPocketBase } = await loadIntegratedAi();

	if (req.files?.length > 0) {
		const imageUrls = await uploadImagesToPocketBase({ images: req.files });
		imageUrls.forEach((url) => {
			parsedMessage.push({ type: ContentBlockType.Image, image: url });
		});
	}

	const sseStream = await stream({
		userId: req.pocketbaseUserId,
		systemPrompt: SystemPrompt,
		userMessage: parsedMessage,
	});

	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('X-Accel-Buffering', 'no');

	sseStream.pipe(res, { end: false });

	res.on('close', () => sseStream.destroy());
});

export default router;
