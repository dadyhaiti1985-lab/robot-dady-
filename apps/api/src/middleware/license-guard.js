/*
 * PROPRIETARY INTELLECTUAL PROPERTY NOTICE
 * ORACLE TRADER PRO / DADY DESTIN — ALL RIGHTS RESERVED.
 * Unauthorized deployment, copying, or execution is prohibited.
 */

import crypto from 'node:crypto';
import process from 'node:process';
import pb from '../utils/pbClient.js';
import logger from '../utils/logger.js';

const LOCKED_STATE = {
	checked: false,
	locked: false,
	reason: null,
	matchedHost: null,
	matchedSource: null,
};

function normalizeHost(value) {
	return String(value || '')
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, '')
		.replace(/\/.*$/, '')
		.replace(/:\d+$/, '');
}

function getConfiguredHosts() {
	return String(process.env.AUTHORIZED_DEPLOYMENT_HOSTS || process.env.WEBSITE_DOMAIN || '')
		.split(',')
		.map(normalizeHost)
		.filter(Boolean);
}

function getRuntimeHosts() {
	return [
		process.env.WEBSITE_DOMAIN,
		process.env.PUBLIC_APP_DOMAIN,
		process.env.DEPLOYMENT_HOST,
		process.env.HOSTNAME,
	]
		.map(normalizeHost)
		.filter(Boolean);
}

function hashLicense(value) {
	return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function shouldEnforce() {
	return process.env.LICENSE_GUARD_ENFORCE === 'true' || process.env.NODE_ENV === 'production';
}

function lockExecution(reason, source = 'runtime') {
	if (LOCKED_STATE.locked) {
		return LOCKED_STATE;
	}

	LOCKED_STATE.checked = true;
	LOCKED_STATE.locked = true;
	LOCKED_STATE.reason = reason;
	LOCKED_STATE.matchedSource = source;

	process.env.COINBASE_API_KEY = '';
	process.env.COINBASE_API_SECRET = '';
	process.env.COINBASE_API_PASSPHRASE = '';
	process.env.INTEGRATED_AI_API_KEY = '';

	logger.error(`[SECURITY_ALERT] Unauthorized domain detected. Execution locked. reason=${reason} source=${source}`);
	return LOCKED_STATE;
}

async function validateAgainstPocketBaseRegistry({ runtimeHosts, licenseHash }) {
	try {
		const records = await pb.collection('license_registry').getFullList({
			filter: `active = true`,
		});

		for (const record of records) {
			const recordHost = normalizeHost(record.host || record.domain || record.hostname);
			const recordHash = String(record.licenseHash || record.license_hash || '').trim();
			if (!recordHost || !recordHash) continue;
			if (runtimeHosts.includes(recordHost) && recordHash === licenseHash) {
				return { ok: true, host: recordHost, source: 'pocketbase' };
			}
		}
	} catch (error) {
		logger.warn(`[license-guard] PocketBase registry unavailable: ${error?.message || error}`);
	}

	return { ok: false };
}

async function evaluateAuthorization({ requestHost = null } = {}) {
	const runtimeHosts = Array.from(new Set([...getRuntimeHosts(), normalizeHost(requestHost)].filter(Boolean)));
	const configuredHosts = getConfiguredHosts();
	const configuredLicenseHash = String(process.env.LICENSE_GUARD_HASH || '').trim();
	const configuredLicenseKey = String(process.env.LICENSE_GUARD_KEY || '').trim();
	const runtimeLicenseHash = configuredLicenseKey ? hashLicense(configuredLicenseKey) : '';

	if (!shouldEnforce()) {
		return { ok: true, host: runtimeHosts[0] || 'localhost', source: 'development-bypass' };
	}

	if (runtimeHosts.length === 0) {
		return { ok: false, reason: 'No runtime host detected' };
	}

	if (!configuredLicenseHash || !runtimeLicenseHash || configuredLicenseHash !== runtimeLicenseHash) {
		return { ok: false, reason: 'License hash validation failed' };
	}

	const registryResult = await validateAgainstPocketBaseRegistry({ runtimeHosts, licenseHash: runtimeLicenseHash });
	if (registryResult.ok) {
		return registryResult;
	}

	if (configuredHosts.length > 0) {
		const matchedHost = runtimeHosts.find((host) => configuredHosts.includes(host));
		if (matchedHost) {
			return { ok: true, host: matchedHost, source: 'env-hosts' };
		}
		return { ok: false, reason: `Host not authorized (${runtimeHosts.join(', ')})` };
	}

	return { ok: false, reason: 'No authorized deployment hosts configured' };
}

export async function runLicenseGuardStartupCheck() {
	if (LOCKED_STATE.checked) {
		return LOCKED_STATE;
	}

	const result = await evaluateAuthorization();
	LOCKED_STATE.checked = true;

	if (!result.ok) {
		lockExecution(result.reason, 'startup');
		if (shouldEnforce()) {
			process.exit(1);
		}
		return LOCKED_STATE;
	}

	LOCKED_STATE.locked = false;
	LOCKED_STATE.reason = null;
	LOCKED_STATE.matchedHost = result.host;
	LOCKED_STATE.matchedSource = result.source;
	logger.info(`[license-guard] Authorized deployment host=${result.host} source=${result.source}`);
	return LOCKED_STATE;
}

export function ensureLicenseUnlocked() {
	return !LOCKED_STATE.locked;
}

export async function licenseGuardMiddleware(req, res, next) {
	if (LOCKED_STATE.locked) {
		return res.status(423).json({
			success: false,
			error: 'Execution locked by license guard.',
			code: 'LICENSE_LOCKED',
		});
	}

	const result = await evaluateAuthorization({ requestHost: req.hostname || req.headers.host });
	if (!result.ok) {
		lockExecution(result.reason, 'request');
		return res.status(423).json({
			success: false,
			error: 'Execution locked by license guard.',
			code: 'LICENSE_LOCKED',
		});
	}

	return next();
}

export default licenseGuardMiddleware;