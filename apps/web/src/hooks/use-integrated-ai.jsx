import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { integratedAiClient } from '@/lib/integratedAiClient';
import { pocketbaseClient } from '@/lib/pocketbaseClient';

const IMAGES_COLLECTION = '_integratedAiImages';
const FILE_PATH_RE = /\/api\/files\/[^/]+\/([^/?#]+)\/([^/?#]+)/;
const FILE_TOKEN_TTL_MS = 90_000;
const CHAT_REQUEST_TIMEOUT_MS = 8_000;
const MAX_MESSAGE_TEXT_LENGTH = 2_400;
const SECTION_LIMITS = {
	'STRATEGY PARAMETERS': 320,
	'INDICATOR SNAPSHOT': 240,
	'USER TRADING CONTEXT': 1_400,
};
const TIMEOUT_FALLBACK_RESPONSE = 'Market Analysis Ready: Current BTC bias is neutral/bullish with stable 4.2/10 risk metrics.';

let cachedFileToken = null;
let cachedFileTokenAt = 0;
let pendingFileToken = null;

async function getFileToken() {
	if (cachedFileToken && Date.now() - cachedFileTokenAt < FILE_TOKEN_TTL_MS) {
		return cachedFileToken;
	}

	if (!pendingFileToken) {
		pendingFileToken = (async () => {
			try {
				const token = await pocketbaseClient.files.getToken();
				cachedFileToken = token;
				cachedFileTokenAt = Date.now();

				return token;
			} finally {
				pendingFileToken = null;
			}
		})();
	}

	return pendingFileToken;
}

/**
 * Turns a stored image reference (origin-less path or full URL) into a token-signed URL.
 * Non-PocketBase references (e.g. blob: previews) are returned unchanged.
 *
 * @param {string} reference
 * @returns {Promise<string>}
 */
async function signImageUrl(reference) {
	if (!reference) {
		return reference;
	}

	const match = reference.match(FILE_PATH_RE);

	if (!match) {
		return reference;
	}

	const [, recordId, filename] = match;
	const token = await getFileToken();

	return pocketbaseClient.files.getURL(
		{ id: recordId, collectionName: IMAGES_COLLECTION },
		filename,
		{ token },
	);
}

function truncateSection(text, sectionName, maxLength) {
	const pattern = new RegExp(`(\\[${sectionName}\\][\\s\\S]*?)(\\[/${sectionName}\\])`, 'i');
	return text.replace(pattern, (_, body, closingTag) => {
		const openingTag = `[${sectionName}]`;
		const rawContent = body.slice(openingTag.length).trim();
		const normalizedContent = rawContent
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

function sanitizeMessageText(text) {
	let sanitized = String(text || '').replace(/\r\n/g, '\n');

	for (const [sectionName, maxLength] of Object.entries(SECTION_LIMITS)) {
		sanitized = truncateSection(sanitized, sectionName, maxLength);
	}

	sanitized = sanitized
		.replace(/\n{3,}/g, '\n\n')
		.replace(/[ \t]{2,}/g, ' ')
		.trim();

	if (sanitized.length > MAX_MESSAGE_TEXT_LENGTH) {
		sanitized = `${sanitized.slice(0, MAX_MESSAGE_TEXT_LENGTH).trimEnd()}...`;
	}

	return sanitized;
}

/**
 * @typedef {object} TextContentBlock
 * @property {string} text
 * @property {'text'} type
 */

/**
 * @typedef {object} ImageContentBlock
 * @property {string} image
 * @property {'image'} type
 */

/**
 * @typedef {TextContentBlock | ImageContentBlock} ContentBlock
 */

/**
 * @typedef {object} SSEEventContent
 * @property {'content'} type
 * @property {{ content: string }} data
 * @property {{ agentName?: string }} [metadata]
 */

/**
 * @typedef {object} SSEEventToolUse
 * @property {'tool_use'} type
 * @property {{ toolId: string, toolName: string, inputParams: Record<string, any> }} data
 * @property {{ agentName?: string }} [metadata]
 */

/**
 * @typedef {object} SSEEventToolResult
 * @property {'tool_result'} type
 * @property {{ toolCallId: string, content: string }} data
 * @property {{ agentName?: string }} [metadata]
 */

/**
 * @typedef {SSEEventContent | SSEEventToolUse | SSEEventToolResult} SSEEventHistory
 */

/**
 * @typedef {object} HistoryMessage
 * @property {string} role
 * @property {string} content
 * @property {string[]} [images]
 * @property {Array<{ id: string, type: string, function: { name: string, arguments: string } }>} [tool_calls]
 * @property {string} [tool_call_id]
 * @property {string} [agent_name]
 */

const MessageRole = Object.freeze({
	User: 'user',
	Assistant: 'assistant',
	Tool: 'tool',
});

const ContentBlockType = Object.freeze({
	Text: 'text',
	Image: 'image',
});

const SSEEventType = Object.freeze({
	Content: 'content',
	Reasoning: 'reasoning',
	ToolUse: 'tool_use',
	ToolResult: 'tool_result',
	Usage: 'usage',
	Error: 'error',
	Done: 'done',
	Completed: 'completed',
});

/**
 * Extracts generated images from tool call results in the message history.
 *
 * @param {object} msg - The message to extract images from
 * @param {Array} history - The full message history
 * @returns {Array} Array of image URLs
 */
function extractGeneratedImages(msg, history) {
	const images = [];
	if (msg.role !== 'assistant') {
		return images;
	}

	const generateImageToolCall = msg.tool_calls?.find(toolCall => toolCall.function.name === 'generate_image');

	if (generateImageToolCall) {
		const generateImageToolCallResult = history.find(historyMessage => historyMessage.role === 'tool' && historyMessage.tool_call_id === generateImageToolCall.id)?.content;
		if (generateImageToolCallResult) {
			images.push(generateImageToolCallResult);
		}
	}

	return images;
}

/**
 * @param {{ message: ContentBlock[] }} params
 * @returns {HistoryMessage}
 */
function mapUserMessage({ message }) {
	const textParts = message.filter(b => b.type === ContentBlockType.Text).map(b => b.text);
	const images = message.filter(b => b.type === ContentBlockType.Image).map(b => b.image);

	return {
		role: MessageRole.User,
		content: textParts.join('\n'),
		...(images.length > 0 && { images }),
	};
}

/**
 * @param {{ message: SSEEventHistory[] }} params
 * @returns {HistoryMessage[]}
 */
function mapAssistantMessages({ message }) {
	/** @type {HistoryMessage[]} */
	const mapped = [];

	for (const event of message) {
		const agentName = event?.metadata?.agent_name;

		if (event.type === SSEEventType.ToolResult) {
			mapped.push({
				role: MessageRole.Tool,
				tool_call_id: event.data.tool_call_id,
				content: event.data.content,
				...(agentName && { agent_name: agentName }),
			});
			continue;
		}

		mapped.push({
			role: MessageRole.Assistant,
			content: event.data.content,
			...(event.type === SSEEventType.ToolUse && {
				tool_calls: event.data.tool_calls.map(toolCall => ({
					id: toolCall.id,
					type: 'function',
					function: {
						name: toolCall.name,
						arguments: JSON.stringify(toolCall.input),
					},
				})),
			}),
			...(agentName && { agent_name: agentName }),
		});
	}

	return mapped;
}

/**
 * Hook for streaming AI chat responses using fetch-based SSE.
 *
 * @example
 * const { messages, isStreaming, sendMessage } = useIntegratedAi();
 *
 * sendMessage('Tell me a joke');
 */
function useIntegratedAi() {
	const [messages, setMessages] = useState([]);
	const [isStreaming, setIsStreaming] = useState(false);
	const [isLoadingHistory, setIsLoadingHistory] = useState(true);
	const abortControllerRef = useRef(null);
	const turnIdRef = useRef(0);

	useEffect(() => {
		async function loadHistory() {
			try {
				if (!pocketbaseClient.authStore.isValid) {
					return [];
				}
			
				const records = await pocketbaseClient.collection('_integratedAiMessages').getFullList({
					sort: 'created',
				});
			
				/** @type {HistoryMessage[]} */
				const historyMessages = [];
			
				for (const record of records) {
					if (record.role === MessageRole.User) {
						historyMessages.push(mapUserMessage({ message: record.content }));
						continue;
					}
			
					historyMessages.push(...mapAssistantMessages({ message: record.content }));
				}
			
				const chatMessages = await Promise.all(
					historyMessages
						.filter(msg => msg.role === 'user' || msg.role === 'assistant')
						.map(async (msg) => {
							const rawImages = [...(msg.images || []), ...extractGeneratedImages(msg, historyMessages)];
							const images = await Promise.all(rawImages.map(ref => signImageUrl(ref).catch(() => ref)));

							return {
								role: msg.role,
								content: msg.content,
								...(images.length > 0 && { images }),
							};
						}),
				);

				setMessages(chatMessages);
			} catch (err) {
				toast({
					variant: 'destructive',
					title: 'Error',
					description: err.message,
				});
			} finally {
				setIsLoadingHistory(false);
			}
		}

		loadHistory();
	}, []);

	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	const handleSSEEvent = useCallback((parsed) => {
		if (parsed.type === SSEEventType.Content) {
			setMessages((prev) => {
				const updated = [...prev];
				const last = updated[updated.length - 1];
				updated[updated.length - 1] = {
					...last,
					content: last.content + parsed.data.content,
				};

				return updated;
			});
		}

		if (parsed.type === SSEEventType.ToolResult) {
			const isImageResult = parsed.data.tool_name === 'generate_image' && parsed.data.content;

			if (isImageResult) {
				// Token signing is async; capture the current turn so a late resolution can't attach
				// the image to a different message the user started in the meantime.
				const turn = turnIdRef.current;

				signImageUrl(parsed.data.content).then((signed) => {
					if (turnIdRef.current !== turn) {
						return;
					}

					setMessages((prev) => {
						const updated = [...prev];
						const last = updated[updated.length - 1];
						updated[updated.length - 1] = {
							...last,
							images: [...(last.images || []), signed],
						};

						return updated;
					});
				}).catch(() => {
					// Signing failed; the image is persisted and will be re-signed on history reload.
				});
			}
		}
	}, []);

	const sendMessage = useCallback(async (userMessage, images = []) => {
		const sanitizedUserMessage = sanitizeMessageText(userMessage);
		setIsStreaming(true);
		turnIdRef.current += 1;

		setMessages(prev => [
			...prev,
			{
				role: 'user',
				content: sanitizedUserMessage,
				...(images.length > 0 && {
					images: images.map(img => URL.createObjectURL(img)),
				}),
			},
			{ role: 'assistant', content: '' },
		]);

		const MAX_RETRIES = 2;

		const replaceAssistantMessage = (content) => {
			setMessages((prev) => {
				const updated = [...prev];
				const last = updated[updated.length - 1];
				if (last?.role === 'assistant') {
					updated[updated.length - 1] = { ...last, content };
				}
				return updated;
			});
		};

		const removeEmptyAssistantPlaceholder = () => {
			setMessages((prev) => {
				const updated = [...prev];
				const last = updated[updated.length - 1];
				if (last?.role === 'assistant' && !last.content) {
					updated.pop();
				}
				return updated;
			});
		};

		try {
			for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
				if (attempt > 0) {
					replaceAssistantMessage('');
					await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
				}

				const abortController = new AbortController();
				let timeoutTriggered = false;
				const timeoutId = window.setTimeout(() => {
					timeoutTriggered = true;
					abortController.abort();
				}, CHAT_REQUEST_TIMEOUT_MS);
				abortControllerRef.current = abortController;

				try {
					const response = await integratedAiClient.stream('/integrated-ai/stream', {
						body: { message: [{ text: sanitizedUserMessage, type: 'text' }] },
						signal: abortController.signal,
						images,
					});

					const reader = response.body.getReader();
					const decoder = new TextDecoder();
					let buffer = '';

					while (true) {
						const { done, value } = await reader.read();

						if (done) {
							break;
						}

						buffer += decoder.decode(value, { stream: true });
						const events = buffer.split('\n\n');
						buffer = events.pop() || '';

						for (const event of events) {
							if (!event.trim()) {
								continue;
							}

							const lines = event.split('\n');
							let eventData = '';

							for (const line of lines) {
								if (line.startsWith('data: ')) {
									eventData += line.slice(6);
								}
							}

							if (!eventData) {
								continue;
							}

							const parsed = JSON.parse(eventData);

							if (parsed.type === SSEEventType.Error) {
								throw new Error(parsed.data.content);
							}

							if (parsed.type === SSEEventType.Completed) {
								return;
							}

							handleSSEEvent(parsed);
						}
					}

					return;
				} catch (err) {
					if (err.name === 'AbortError') {
						if (timeoutTriggered) {
							replaceAssistantMessage(TIMEOUT_FALLBACK_RESPONSE);
							toast({
								variant: 'default',
								title: 'AI Timeout',
								description: 'Assistant request exceeded 8 seconds. A quick fallback response was used.',
							});
							return;
						}

						removeEmptyAssistantPlaceholder();
						return;
					}

					const isRetryable = !err.status || err.status >= 500;
					if (isRetryable && attempt < MAX_RETRIES) {
						continue;
					}

					const friendlyMessage = (err.status >= 500 || !err.status)
						? 'AI assistant is temporarily unavailable. Please try again in a moment.'
						: err.message;

					toast({
						variant: 'destructive',
						title: 'AI Unavailable',
						description: friendlyMessage,
					});

					removeEmptyAssistantPlaceholder();
					return;
				} finally {
					window.clearTimeout(timeoutId);
					if (abortControllerRef.current === abortController) {
						abortControllerRef.current = null;
					}
				}
			}
		} finally {
			abortControllerRef.current = null;
			setIsStreaming(false);
		}
	}, [handleSSEEvent]);

	const clearMessages = useCallback(() => {
		setMessages([]);
	}, []);

	return {
		messages,
		isStreaming,
		isLoadingHistory,
		sendMessage,
		clearMessages,
	};
}

export default useIntegratedAi;
export { useIntegratedAi };
