import { supabase, supabaseKey, supabaseUrl } from '../lib/supabaseClient.js';

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/$/, '');
}

export default async (_req, res) => {
  const hasUrl = Boolean(supabaseUrl);
  const hasKey = Boolean(supabaseKey);
  const hasClient = Boolean(supabase);

  if (!hasUrl || !hasKey) {
    return res.status(503).json({
      status: 'missing-env',
      message: 'SUPABASE_URL and/or SUPABASE_KEY are not set in process.env',
      env: {
        hasSupabaseUrl: hasUrl,
        hasSupabaseKey: hasKey,
        hasClient,
      },
      timestamp: new Date().toISOString(),
    });
  }

  const endpoint = `${normalizeBaseUrl(supabaseUrl)}/rest/v1/`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      signal: AbortSignal.timeout(8_000),
    });

    const reachable = response.status < 500;
    return res.status(reachable ? 200 : 503).json({
      status: reachable ? 'ok' : 'upstream-error',
      message: reachable
        ? 'Supabase endpoint reachable and environment variables are available'
        : 'Supabase endpoint returned a server error',
      env: {
        hasSupabaseUrl: hasUrl,
        hasSupabaseKey: hasKey,
        hasClient,
      },
      supabase: {
        endpoint,
        httpStatus: response.status,
        ok: response.ok,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unreachable',
      message: error?.message || 'Failed to reach Supabase endpoint',
      env: {
        hasSupabaseUrl: hasUrl,
        hasSupabaseKey: hasKey,
        hasClient,
      },
      supabase: {
        endpoint,
      },
      timestamp: new Date().toISOString(),
    });
  }
};
