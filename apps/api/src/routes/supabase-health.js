import logger from '../utils/logger.js';
import { supabase, supabaseKey, supabaseUrl } from '../lib/supabaseClient.js';

function maskUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return 'invalid-url';
  }
}

function keyFingerprint(value) {
  if (!value) return null;
  const str = String(value);
  const preview = str.slice(0, 6);
  return `${preview}... (${str.length} chars)`;
}

export default async function supabaseHealth(req, res) {
  const hasUrl = Boolean(supabaseUrl);
  const hasKey = Boolean(supabaseKey);
  const configured = hasUrl && hasKey && Boolean(supabase);

  // Optional lightweight network probe; non-fatal for env verification.
  let probe = { attempted: false, ok: false, status: 'not-run' };
  if (configured) {
    probe.attempted = true;
    try {
      const { error } = await supabase.auth.getSession();
      probe.ok = !error;
      probe.status = error ? `session-check-error: ${error.message}` : 'session-check-ok';
    } catch (error) {
      probe.ok = false;
      probe.status = error?.message || 'session-check-failed';
    }
  }

  if (!configured) {
    logger.warn('[supabase-health] Missing SUPABASE_URL or SUPABASE_KEY');
  }

  const statusCode = configured ? 200 : 503;
  return res.status(statusCode).json({
    success: configured,
    configured,
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: hasUrl,
      hasSupabaseKey: hasKey,
      supabaseUrlHost: maskUrl(supabaseUrl),
      supabaseKeyFingerprint: keyFingerprint(supabaseKey),
    },
    probe,
  });
}
