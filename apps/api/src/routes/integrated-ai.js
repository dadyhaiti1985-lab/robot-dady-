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
const MAX_TEXT_BLOCK_LENGTH = 2_400;
const SECTION_LIMITS = {
	'STRATEGY PARAMETERS': 320,
	'INDICATOR SNAPSHOT': 240,
	'USER TRADING CONTEXT': 1_400,
	'Dashboard Context': 320,
};

function truncateSection(text, sectionName, maxLength) {
	const pattern = new RegExp(`(\\[${sectionName}\\][\\s\\S]*?)(\\[/${sectionName}\\])`, 'i');
	return text.replace(pattern, (_, body, closingTag) => {
		const openingTag = `[${sectionName}]`;
		const normalizedContent = body
			.slice(openingTag.length)
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
			.join(' | ');
		const trimmedContent = normalizedContent.length > maxLength
			? `${normalizedContent.slice(0, maxLength).trimEnd()}...`
			: normalizedContent;
		return `${openingTag}\n${trimmedContent}\n${closingTag}`;
	});
}

function sanitizeTextBlock(text) {
	let sanitized = String(text || '')
		.replace(/\r\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.replace(/[ \t]{2,}/g, ' ')
		.trim();

	for (const [sectionName, maxLength] of Object.entries(SECTION_LIMITS)) {
		sanitized = truncateSection(sanitized, sectionName, maxLength);
	}

	if (sanitized.length > MAX_TEXT_BLOCK_LENGTH) {
		sanitized = `${sanitized.slice(0, MAX_TEXT_BLOCK_LENGTH).trimEnd()}...`;
	}

	return sanitized;
}

function validateContentBlocks(value) {
	if (!Array.isArray(value) || value.length === 0) {
		throw new Error('message must be a non-empty array of content blocks');
	}

	return value.map((block, index) => {
		if (!block || typeof block !== 'object') {
			throw new Error(`message block ${index} must be an object`);
		}

		if (block.type === 'text') {
			if (typeof block.text !== 'string' || !block.text.trim()) {
				throw new Error(`message block ${index} text is required`);
			}

			return { type: 'text', text: sanitizeTextBlock(block.text) };
		}

		if (block.type === 'image') {
			if (typeof block.image !== 'string' || !block.image.trim()) {
				throw new Error(`message block ${index} image is required`);
			}

			return { type: 'image', image: block.image.trim() };
		}

		throw new Error(`Unsupported message block type at index ${index}`);
	});
}

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

	let parsedMessage;
	try {
		parsedMessage = validateContentBlocks(JSON.parse(message));
	} catch (error) {
		return res.status(400).json({ error: error.message, code: 'INVALID_CHAT_PAYLOAD' });
	}

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
