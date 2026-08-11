import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from './logger.js';

const DEFAULT_MANIFEST = new URL('../security/core-manifest.json', import.meta.url);

function sha256(content) {
	return crypto.createHash('sha256').update(content).digest('hex');
}

async function hashFile(filePath) {
	const data = await fs.readFile(filePath);
	return sha256(data);
}

async function readManifest(manifestPath = DEFAULT_MANIFEST) {
	try {
		const raw = await fs.readFile(manifestPath, 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export async function verifyCoreIntegrity({ manifestPath = DEFAULT_MANIFEST, files = [] } = {}) {
	if (!files.length) {
		return { status: 'SKIPPED', reason: 'No integrity targets configured' };
	}

	const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
	const manifest = await readManifest(manifestPath);
	const results = [];

	for (const relPath of files) {
		const fullPath = path.resolve(root, relPath);
		const hash = await hashFile(fullPath);
		const expected = manifest?.files?.[relPath];
		const matched = expected ? expected === hash : null;
		results.push({ relPath, hash, expected: expected || null, matched });
	}

	const mismatches = results.filter((entry) => entry.matched === false);

	if (mismatches.length > 0) {
		logger.warn('[integrity] Core file hash mismatch detected', mismatches.map(({ relPath }) => relPath));
		return { status: 'DEGRADED', files: results };
	}

	logger.info('[integrity] Core file hashes verified', results.map(({ relPath }) => relPath));
	return { status: 'HEALTHY', files: results };
}

async function checkUrl(url) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);

	try {
		const response = await fetch(url, { signal: controller.signal });
		return { url, ok: response.ok, status: response.status };
	} catch (error) {
		return { url, ok: false, error: error.message };
	} finally {
		clearTimeout(timeout);
	}
}

export function scheduleIntegrityMonitor({ manifestPath = DEFAULT_MANIFEST, files = [], healthChecks = [], intervalMs = 15 * 60 * 1000 } = {}) {
	if (!files.length) {
		return null;
	}

	let timer = null;

	const run = async () => {
		try {
			await verifyCoreIntegrity({ manifestPath, files });

			if (healthChecks.length > 0) {
				const results = await Promise.all(healthChecks.map(checkUrl));
				const unhealthy = results.filter((result) => !result.ok);
				if (unhealthy.length > 0) {
					logger.warn('[integrity] health check degraded', unhealthy);
				}
			}
		} catch (error) {
			logger.warn('[integrity] monitor error', error.message);
		}
	};

	run();
	timer = setInterval(run, intervalMs);
	timer.unref?.();

	return timer;
}