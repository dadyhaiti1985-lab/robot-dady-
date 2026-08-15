/**
 * CandleDataManager
 * Efficient candle data management with memory limit, deduplication, validation,
 * compression (recent vs. archived), and batching support.
 *
 * Candle format (compact):
 *   { t: timestamp, o: open, h: high, l: low, c: close, v: volume }
 */

export class CandleDataManager {
  /**
   * @param {number} maxCandles   - Total candles to keep (default 200)
   * @param {number} compressThreshold - Recent candles kept "hot" (default 50)
   */
  constructor(maxCandles = 200, compressThreshold = 50) {
    this.maxCandles = maxCandles;
    this.compressThreshold = compressThreshold;
    // Hot candles (recent) — fast access
    this._hot = [];
    // Archived candles (older, up to maxCandles - compressThreshold)
    this._archive = [];
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  validateCandle(candle) {
    if (!candle || candle.t == null || candle.o == null ||
        candle.h == null || candle.l == null || candle.c == null) {
      throw new Error('Invalid candle: missing required fields (t,o,h,l,c)');
    }
    if (candle.h < candle.l) throw new Error('Invalid candle: high < low');
    if (candle.o < candle.l || candle.o > candle.h)
      throw new Error('Invalid candle: open outside high/low range');
    if (candle.c < candle.l || candle.c > candle.h)
      throw new Error('Invalid candle: close outside high/low range');
    return true;
  }

  // ── Mutation ─────────────────────────────────────────────────────────────────

  addCandle(candle) {
    try { this.validateCandle(candle); } catch { return; }

    // Deduplication: same timestamp → update last hot candle
    const last = this._hot[this._hot.length - 1];
    if (last && last.t === candle.t) {
      this._hot[this._hot.length - 1] = candle;
      return;
    }

    this._hot.push(candle);

    // Move oldest hot candle to archive when hot exceeds threshold
    if (this._hot.length > this.compressThreshold) {
      const oldest = this._hot.shift();
      this._archive.push(oldest);

      // Trim archive to allowed size
      const archiveMax = this.maxCandles - this.compressThreshold;
      if (this._archive.length > archiveMax) {
        this._archive.shift(); // Efase sa ki pi ansyen an
      }
    }
  }

  addCandles(newCandles) {
    if (!Array.isArray(newCandles)) return;
    newCandles.forEach(c => this.addCandle(c));
  }

  clear() {
    this._hot = [];
    this._archive = [];
  }

  // ── Access ───────────────────────────────────────────────────────────────────

  getCandles() {
    return [...this._archive, ...this._hot];
  }

  getLatestCandle() {
    return this._hot[this._hot.length - 1] ?? this._archive[this._archive.length - 1] ?? null;
  }

  getOldestCandle() {
    return this._archive[0] ?? this._hot[0] ?? null;
  }

  getLength() {
    return this._archive.length + this._hot.length;
  }

  // ── Memory ───────────────────────────────────────────────────────────────────

  /** Estimated bytes (~200 bytes per candle object) */
  getMemoryUsage() {
    return this.getLength() * 200;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a "fat" candle object to the compact { t,o,h,l,c,v } format.
 */
export function normalizeCandle(candle) {
  return {
    t: candle.t ?? candle.timestamp ?? Date.now(),
    o: candle.o ?? candle.open,
    h: candle.h ?? candle.high,
    l: candle.l ?? candle.low,
    c: candle.c ?? candle.close,
    v: candle.v ?? candle.volume ?? 0,
  };
}

/**
 * Per-asset candle manager registry.
 * Usage:
 *   import { getCandleManager } from '@/utils/candleDataManager';
 *   const mgr = getCandleManager('BTC-USD');
 *   mgr.addCandle(candle);
 */
const _registry = new Map();

export function getCandleManager(asset, maxCandles = 200) {
  if (!_registry.has(asset)) {
    _registry.set(asset, new CandleDataManager(maxCandles));
  }
  return _registry.get(asset);
}

export function clearCandleManager(asset) {
  if (_registry.has(asset)) _registry.get(asset).clear();
}

export function clearAllCandleManagers() {
  _registry.forEach(mgr => mgr.clear());
  _registry.clear();
}

export default CandleDataManager;
