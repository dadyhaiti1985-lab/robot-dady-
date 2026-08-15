/**
 * Coinbase Dual Authentication Utility
 *
 * Supports:
 *  - CDP Cloud API Keys (organizations/…) → ES256 JWT
 *  - Legacy API Keys → HMAC-SHA256
 */

import crypto from 'crypto';
import logger from './logger.js';

/**
 * Detect if the key is a Coinbase CDP (Cloud) key.
 * CDP keys have the format: organizations/{org_id}/apiKeys/{key_id}
 */
export function isCdpKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.startsWith('organizations/');
}

/**
 * Extract the FIRST complete PEM block from a string, returning it as a clean PEM.
 * This prevents "too long" ASN.1 errors caused by concatenated PEM blocks.
 */
function extractFirstPemBlock(raw) {
  const match = raw.match(/(-----BEGIN[^-]+-----[\s\S]+?-----END[^-]+-----)/);
  return match ? match[1].trim() : null;
}

/**
 * Sanitize raw base64: strip non-base64 characters, fix padding.
 */
function sanitizeBase64(b64) {
  // Keep only valid base64 chars
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  // Fix padding
  const mod = clean.length % 4;
  if (mod === 2) return clean + '==';
  if (mod === 3) return clean + '=';
  return clean;
}

/**
 * Wrap clean base64 bytes in a PEM block with 64-char line breaks.
 */
function wrapPem(type, b64) {
  const lines = b64.match(/.{1,64}/g) || [b64];
  return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
}

/**
 * Normalize a private key to a single, clean PEM block.
 * Handles: multi-block concatenated PEM, escaped \n, raw base64.
 */
function normalizePemKey(raw) {
  let key = (raw || '').trim();

  // Replace literal \n escape sequences with real newlines
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }

  if (key.includes('-----BEGIN')) {
    // Extract ONLY the first PEM block (prevents "too long" from concatenated blocks)
    const firstBlock = extractFirstPemBlock(key);
    if (firstBlock) {
      // Re-clean the base64 body of that single block to remove any embedded junk
      const bodyMatch = firstBlock.match(/-----BEGIN[^-]+-----([\s\S]+?)-----END[^-]+-----/);
      const headerMatch = firstBlock.match(/-----BEGIN ([^-]+)-----/);
      if (bodyMatch && headerMatch) {
        const type = headerMatch[1].trim();
        const cleanB64 = sanitizeBase64(bodyMatch[1].replace(/\s+/g, ''));
        logger.info(`[coinbase-auth] normalizePemKey: type="${type}" b64len=${cleanB64.length}`);
        return wrapPem(type, cleanB64);
      }
      return firstBlock;
    }
  }

  // Raw base64 — strip whitespace, sanitize, wrap in PKCS#8
  const b64 = sanitizeBase64(key.replace(/\s+/g, ''));
  logger.info(`[coinbase-auth] normalizePemKey: raw base64 b64len=${b64.length}`);
  return wrapPem('PRIVATE KEY', b64);
}

/**
 * Extract raw base64 body from the FIRST PEM block only (strips header/footer + whitespace).
 */
function pemToBase64(pem) {
  const match = pem.match(/-----BEGIN[^-]+-----([\s\S]+?)-----END[^-]+-----/);
  if (match) {
    return sanitizeBase64(match[1].replace(/\s+/g, ''));
  }
  return sanitizeBase64(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''));
}

/**
 * Try multiple PEM/DER formats to parse a private key.
 * Covers: SEC1 PEM, PKCS#8 PEM, SEC1 DER, PKCS#8 DER, plus header-swapped variants.
 */
function tryParsePrivateKey(pemKey) {
  // Build a PKCS#8 PEM variant (swap headers if SEC1)
  const pkcs8Pem = pemKey
    .replace(/-----BEGIN EC PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----')
    .replace(/-----END EC PRIVATE KEY-----/, '-----END PRIVATE KEY-----');

  // Extract DER bytes from the SINGLE cleaned block
  const b64 = pemToBase64(pemKey);
  const derBuf = Buffer.from(b64, 'base64');

  logger.info(`[coinbase-auth] tryParsePrivateKey: pemKey lines=${pemKey.split('\n').length} b64len=${b64.length} derBytes=${derBuf.length}`);

  // Sanity check: EC P-256 PKCS#8 DER is ~138 bytes; reject obviously oversized keys
  if (derBuf.length > 600) {
    logger.error(`[coinbase-auth] DER buffer too large (${derBuf.length} bytes) — key likely contains multiple concatenated blocks`);
    throw new Error(`CDP private key DER is ${derBuf.length} bytes (max 600). Key appears to be corrupted or concatenated. Please re-copy your Coinbase API secret.`);
  }

  // Also try extracting just the first 32 bytes as raw EC scalar (P-256 private key d)
  const rawScalar32 = derBuf.slice(0, 32);
  // Build a minimal SEC1 DER for a P-256 key from raw 32-byte scalar
  function buildSec1Der(scalar32) {
    // SEQUENCE { INTEGER 1, OCTET STRING (32 bytes), [0] OID P-256, [1] pub }
    // Minimal: version=1, privateKey=scalar
    const octetStr = Buffer.concat([Buffer.from([0x04, 0x20]), scalar32]);
    const versionTLV = Buffer.from([0x02, 0x01, 0x01]);
    const inner = Buffer.concat([versionTLV, octetStr]);
    return Buffer.concat([Buffer.from([0x30, inner.length]), inner]);
  }

  const attempts = [
    // 1. Auto-detect from PEM
    () => crypto.createPrivateKey({ key: pemKey, format: 'pem' }),
    // 2. Explicit PKCS#8 PEM (most common for CDP keys)
    () => crypto.createPrivateKey({ key: pkcs8Pem, format: 'pem', type: 'pkcs8' }),
    // 3. Explicit SEC1 PEM
    () => crypto.createPrivateKey({ key: pemKey, format: 'pem', type: 'sec1' }),
    // 4. Auto-detect swapped PKCS#8 PEM
    () => crypto.createPrivateKey({ key: pkcs8Pem, format: 'pem' }),
    // 5. DER as PKCS#8
    () => crypto.createPrivateKey({ key: derBuf, format: 'der', type: 'pkcs8' }),
    // 6. DER as SEC1
    () => crypto.createPrivateKey({ key: derBuf, format: 'der', type: 'sec1' }),
    // 7. Treat first 32 bytes as raw EC scalar, reconstruct minimal SEC1 DER
    () => {
      if (derBuf.length < 32) throw new Error('key too short for raw scalar');
      return crypto.createPrivateKey({ key: buildSec1Der(rawScalar32), format: 'der', type: 'sec1' });
    },
  ];

  let lastErr;
  for (let i = 0; i < attempts.length; i++) {
    try {
      const k = attempts[i]();
      logger.info(`[coinbase-auth] tryParsePrivateKey: succeeded on attempt ${i + 1}`);
      return k;
    } catch (e) {
      logger.info(`[coinbase-auth] tryParsePrivateKey: attempt ${i + 1} failed — ${e.message}`);
      lastErr = e;
    }
  }
  throw new Error(`CDP private key parse failed (tried ${attempts.length} formats). Key appears corrupted — please re-copy your Coinbase API secret from the Coinbase CDP portal. Last error: ${lastErr.message}`);
}

/**
 * Generate a CDP JWT (ES256) for Coinbase Advanced Trade API.
 *
 * Coinbase CDP private keys are PEM-encoded EC private keys (prime256v1 / P-256).
 * The JWT is signed with ES256 (ECDSA + SHA-256).
 *
 * @param {string} apiKey   - The full CDP key name (organizations/…/apiKeys/…)
 * @param {string} apiSecret - PEM-encoded EC private key (begins with -----BEGIN EC PRIVATE KEY-----)
 * @param {string} uri      - The request URI scope, e.g. "GET api.coinbase.com/api/v3/brokerage/accounts"
 * @returns {string} Signed JWT token
 */
export function generateCDPJWT(apiKey, apiSecret, uri) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'ES256',
    kid: apiKey,
    typ: 'JWT',
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const payload = {
    sub: apiKey,
    iss: 'cdp',
    nbf: now,
    exp: now + 120,
    ...(uri ? { uri } : {}),
  };

  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const signingInput = `${b64(header)}.${b64(payload)}`;

  const pemKey = normalizePemKey(apiSecret);
  logger.info(`[coinbase-auth] Key header: "${pemKey.split('\n')[0]}" lines=${pemKey.split('\n').length}`);

  let privateKey;
  try {
    privateKey = tryParsePrivateKey(pemKey);
  } catch (parseErr) {
    logger.error(`[coinbase-auth] Key parse failed. header="${pemKey.split('\n')[0]}" b64len=${pemToBase64(pemKey).length} err=${parseErr.message}`);
    throw parseErr;
  }
  const sign = crypto.createSign('SHA256');
  sign.update(signingInput);
  const derSignature = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });

  const jwtToken = `${signingInput}.${derSignature.toString('base64url')}`;

  logger.info(`[coinbase-auth] CDP JWT generated — kid=${apiKey.slice(0, 40)}... exp=${payload.exp}`);
  return jwtToken;
}

/**
 * Build HMAC-SHA256 auth headers for Coinbase Legacy API Keys.
 *
 * @param {string} apiKey
 * @param {string} apiSecret
 * @param {string} method  - HTTP method (GET, POST, …)
 * @param {string} path    - Request path, e.g. /api/v3/brokerage/accounts
 * @param {string} [body]  - Request body string (empty for GET)
 * @returns {Object} Headers object
 */
export function buildLegacyHmacHeaders(apiKey, apiSecret, method, path, body = '') {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = timestamp + method.toUpperCase() + path + body;
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');

  logger.info(`[coinbase-auth] HMAC built — timestamp=${timestamp} path=${path} sig_len=${signature.length}`);

  return {
    'CB-ACCESS-KEY': apiKey,
    'CB-ACCESS-SIGN': signature,
    'CB-ACCESS-TIMESTAMP': timestamp,
    'Content-Type': 'application/json',
    'User-Agent': 'Oracle-Trader-Pro/1.0',
  };
}

/**
 * Build the appropriate Coinbase auth headers based on key type.
 *
 * @param {string} apiKey
 * @param {string} apiSecret
 * @param {string} method
 * @param {string} path
 * @param {string} [body]
 * @returns {Object} Headers object
 */
export function buildCoinbaseHeaders(apiKey, apiSecret, method, path, body = '') {
  if (isCdpKey(apiKey)) {
    // Coinbase JWT uri scope must NOT include query parameters — strip them
    const pathOnly = path.split('?')[0];
    const uri = `${method.toUpperCase()} api.coinbase.com${pathOnly}`;
    const jwt = generateCDPJWT(apiKey, apiSecret, uri);
    return {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Oracle-Trader-Pro/1.0',
    };
  }
  return buildLegacyHmacHeaders(apiKey, apiSecret, method, path, body);
}
