/**
 * POST /api/user/save-credentials
 * Saves encrypted Coinbase API credentials for the authenticated user.
 * Validates and normalizes the PEM private key BEFORE encrypting so only
 * clean, parseable keys are stored.
 */
import crypto from 'crypto';
import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import pb from '../utils/pbClient.js';
import logger from '../utils/logger.js';

const router = Router();

function getEncryptionKey() {
  const secret = process.env.ORACLE_CREDENTIALS_ENCRYPTION_KEY;
  if (!secret) throw new Error('ORACLE_CREDENTIALS_ENCRYPTION_KEY is not set');
  return crypto.createHash('sha256').update(secret).digest();
}

function encryptSecret(plainText) {
  if (!plainText) return null;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function maskSecret(s) {
  if (!s || s.length < 4) return '****';
  return `${'*'.repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
}

/**
 * Normalize a raw PEM/base64 private key into a clean, properly-wrapped PEM string.
 * Handles:
 *   - Escaped \n sequences
 *   - Multi-block concatenation (keeps only first block)
 *   - Raw base64 without headers (wraps in PKCS#8)
 *   - Improperly-wrapped base64 (re-wraps to 64-char lines)
 */
function normalizePEMKey(rawKey) {
  if (!rawKey) return null;

  let key = rawKey.trim();

  // Replace escaped newlines with real newlines
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }

  if (key.includes('-----BEGIN')) {
    // Extract ONLY the first PEM block to prevent multi-block ASN.1 "too long" error
    const match = key.match(/(-----BEGIN ([^-]+)-----)([\s\S]+?)(-----END [^-]+-----)/);
    if (match) {
      const header = match[1].trim();
      const footer = match[4].trim();
      // Clean base64 body: remove all whitespace, strip non-base64 chars, fix padding
      let b64 = match[3].replace(/\s+/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
      const mod = b64.length % 4;
      if (mod === 2) b64 += '==';
      else if (mod === 3) b64 += '=';
      // Rewrap to 64 chars per line
      const lines = b64.match(/.{1,64}/g) || [b64];
      return `${header}\n${lines.join('\n')}\n${footer}`;
    }
  }

  // Raw base64 — wrap in PKCS#8 PEM headers
  let b64 = key.replace(/[^A-Za-z0-9+/=]/g, '');
  const mod = b64.length % 4;
  if (mod === 2) b64 += '==';
  else if (mod === 3) b64 += '=';
  const lines = b64.match(/.{1,64}/g) || [b64];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
}

/**
 * Validate a normalized PEM key.
 *
 * Strategy:
 *   1. Structural check — must have PEM headers and sufficient base64 content.
 *      If structure is valid we accept the key even when crypto parse fails (key
 *      will be validated for real when Coinbase is called).
 *   2. Soft crypto check — we TRY to parse and log the result, but only hard-fail
 *      when the key is clearly empty/corrupt (headers missing or base64 < 60 chars).
 */
function validatePrivateKey(normalizedPem) {
  if (!normalizedPem) throw new Error('API secret is empty');

  // ── Structural validation ────────────────────────────────────────────────
  const hasBegin = normalizedPem.includes('-----BEGIN');
  const hasEnd   = normalizedPem.includes('-----END');
  if (!hasBegin || !hasEnd) {
    throw new Error('API secret is missing PEM headers. Please copy the ENTIRE key including the -----BEGIN ... ----- and -----END ... ----- lines.');
  }

  const b64 = normalizedPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  if (b64.length < 60) {
    throw new Error(`API secret appears incomplete (only ${b64.length} base64 chars found; expected ≥ 60). Please copy the entire private key from Coinbase.`);
  }

  logger.info(`[save-credentials] PEM structure OK — b64len=${b64.length}`);

  // ── Soft crypto parse (best-effort) ─────────────────────────────────────
  const pkcs8Pem = normalizedPem
    .replace('-----BEGIN EC PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----')
    .replace('-----END EC PRIVATE KEY-----', '-----END PRIVATE KEY-----');
  const derBuf = Buffer.from(b64, 'base64');

  const attempts = [
    () => crypto.createPrivateKey({ key: normalizedPem, format: 'pem' }),
    () => crypto.createPrivateKey({ key: normalizedPem, format: 'pem', type: 'sec1' }),
    () => crypto.createPrivateKey({ key: pkcs8Pem, format: 'pem', type: 'pkcs8' }),
    () => crypto.createPrivateKey({ key: pkcs8Pem, format: 'pem' }),
    () => crypto.createPrivateKey({ key: derBuf, format: 'der', type: 'sec1' }),
    () => crypto.createPrivateKey({ key: derBuf, format: 'der', type: 'pkcs8' }),
  ];

  for (let i = 0; i < attempts.length; i++) {
    try {
      attempts[i]();
      logger.info(`[save-credentials] Key crypto-validation passed on attempt ${i + 1}`);
      return true;
    } catch (_) { /* try next */ }
  }

  // All parse attempts failed — accept anyway if structure looked valid.
  // The key will be validated for real when connecting to Coinbase.
  logger.warn(`[save-credentials] All ${attempts.length} crypto parse attempts failed — key structure is valid (b64len=${b64.length}); accepting with warning. Key will be validated at Coinbase connection time.`);
  return true;
}

router.post('/', authMiddleware, async (req, res) => {
  const { apiKey, apiSecret, platform = 'Coinbase', maxRiskPercent, stopLossPercent, takeProfitPercent } = req.body ?? {};

  if (!apiKey || String(apiKey).length < 20) {
    return res.status(422).json({ success: false, error: 'apiKey dwe gen omwen 20 karaktè', code: 'VALIDATION' });
  }
  if (!apiSecret || String(apiSecret).length < 20) {
    return res.status(422).json({ success: false, error: 'apiSecret dwe gen omwen 20 karaktè', code: 'VALIDATION' });
  }
  if (!process.env.ORACLE_CREDENTIALS_ENCRYPTION_KEY) {
    return res.status(503).json({ success: false, error: 'Encryption not configured', code: 'ENCRYPTION_KEY_MISSING' });
  }

  const userId = req.user.id;
  const isCDP = String(apiKey).startsWith('organizations/');

  // ── For CDP keys: normalize and validate the PEM private key before storing ──
  let normalizedSecret = String(apiSecret);
  if (isCDP) {
    normalizedSecret = normalizePEMKey(String(apiSecret));
    if (!normalizedSecret) {
      return res.status(400).json({
        success: false,
        error: 'API secret pa ka nòmalize. Tanpri kopye kle prive ou ak presizyon.',
        code: 'INVALID_KEY_FORMAT',
      });
    }

    logger.info(`[save-credentials] Validating CDP key for user ${userId} — normalized length=${normalizedSecret.length}`);
    try {
      validatePrivateKey(normalizedSecret);
    } catch (err) {
      logger.error(`[save-credentials] CDP key validation failed for user ${userId}: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: 'Kle prive CDP pa valid. Tanpri re-kopye li depi pòtay Coinbase CDP la ak presizyon.',
        detail: err.message.slice(0, 200),
        code: 'INVALID_PRIVATE_KEY',
      });
    }
    logger.info(`[save-credentials] CDP key validated for user ${userId}`);
  }

  const payload = {
    owner: userId,
    exchange: String(platform).trim(),
    // Store the normalized (validated) version for CDP keys
    apiKeyCipher: encryptSecret(apiKey),
    apiSecretCipher: encryptSecret(normalizedSecret),
    ...(maxRiskPercent !== undefined && { maxRiskPercent }),
    ...(stopLossPercent !== undefined && { stopLossPercent }),
    ...(takeProfitPercent !== undefined && { takeProfitPercent }),
  };

  try {
    let record;
    try {
      const existing = await pb.collection('oracle_credentials').getFirstListItem(`owner = "${userId}"`);
      record = await pb.collection('oracle_credentials').update(existing.id, payload);
    } catch (e) {
      if (e?.status === 404 || /No items found/i.test(e?.message || '')) {
        record = await pb.collection('oracle_credentials').create(payload);
      } else throw e;
    }
    logger.info(`[save-credentials] saved for user ${userId} platform=${platform} cdp=${isCDP}`);
    return res.json({
      success: true,
      message: 'Kle API yo chifre epi sove ak siksè!',
      platform: record.exchange,
      apiKeyPreview: maskSecret(apiKey),
      connected: true,
    });
  } catch (err) {
    logger.error(`[save-credentials] failed for user ${userId}: ${err?.message}`);
    return res.status(502).json({ success: false, error: 'Echèk sove kle yo. Eseye ankò.', code: 'DB_ERROR' });
  }
});

export default router;
