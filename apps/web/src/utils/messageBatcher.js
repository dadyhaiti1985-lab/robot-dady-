/**
 * Message Batching Utility
 * Batches rapid updates using requestIdleCallback + RAF to avoid blocking the main thread.
 */

const _ric = typeof requestIdleCallback === 'function'
  ? requestIdleCallback
  : (cb, opts) => setTimeout(() => cb({ timeRemaining: () => (opts && opts.timeout ? opts.timeout : 16), didTimeout: true }), opts && opts.timeout ? Math.min(opts.timeout, 16) : 16);

const _cic = typeof cancelIdleCallback === 'function'
  ? cancelIdleCallback
  : clearTimeout;

export class MessageBatcher {
  constructor(processor, batchSize = 50, timeoutMs = 16) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.timeoutMs = timeoutMs;
    this.buffer = [];
    this.isProcessing = false;
    this.idleId = null;
  }

  addMessage(message) {
    this.buffer.push(message);
    if (this.buffer.length >= this.batchSize) {
      this._cancelIdle();
      this._scheduleFlush();
    } else if (!this.idleId) {
      this.idleId = _ric(() => this._scheduleFlush(), { timeout: this.timeoutMs });
    }
  }

  _cancelIdle() {
    if (this.idleId !== null) {
      _cic(this.idleId);
      this.idleId = null;
    }
  }

  _scheduleFlush() {
    if (this.isProcessing || this.buffer.length === 0) return;
    requestAnimationFrame(() => {
      if (this.buffer.length === 0) { this.isProcessing = false; return; }
      this.isProcessing = true;
      const chunkSize = Math.min(this.batchSize, this.buffer.length);
      const updates = this.buffer.splice(0, chunkSize);
      try {
        if (this.processor) this.processor(updates);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[MessageBatcher] processor error:', err);
      }
      this.isProcessing = false;
      // Schedule remaining items during idle time
      if (this.buffer.length > 0) {
        this.idleId = _ric(() => this._scheduleFlush(), { timeout: this.timeoutMs });
      }
    });
  }

  flush() {
    this._cancelIdle();
    this._scheduleFlush();
  }

  clear() {
    this._cancelIdle();
    this.buffer = [];
    this.isProcessing = false;
  }

  destroy() {
    this.clear();
    this.processor = null;
  }
}

export function createBatcher(processor, batchSize = 50, timeoutMs = 16) {
  return new MessageBatcher(processor, batchSize, timeoutMs);
}
