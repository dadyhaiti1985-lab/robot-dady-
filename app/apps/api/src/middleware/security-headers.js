/**
 * Security headers middleware
 * Adds CSP and other headers to reduce tracking overhead and prevent HTTP 431 errors
 */
export default function securityHeaders(req, res, next) {
  // Strip any oversized incoming custom headers to prevent 431 propagation
  const MAX_HEADER_VALUE = 8192;
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string' && value.length > MAX_HEADER_VALUE) {
      delete req.headers[key];
    }
  }

  // Content-Security-Policy: block Hostinger tracking
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https://api.coinbase.com wss: ws:",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "frame-src 'none'",
      "object-src 'none'",
    ].join('; ')
  );

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');

  next();
}
