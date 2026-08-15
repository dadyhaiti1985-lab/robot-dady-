/**
 * Performance Monitor
 * Tracks FPS, render time, state update frequency, and memory usage.
 * Only active in development mode.
 */

const isDev = import.meta.env.DEV;

class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.renderTimes = [];
    this.stateUpdateCount = 0;
    this.workerTimes = [];
    this.rafId = null;
    this.listeners = new Set();
    this._running = false;
  }

  start() {
    if (!isDev || this._running) return;
    this._running = true;
    this._tick();
  }

  stop() {
    this._running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  _tick() {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;
      this._notify();
    }
    if (this._running) {
      this.rafId = requestAnimationFrame(() => this._tick());
    }
  }

  recordRender(durationMs) {
    this.renderTimes.push(durationMs);
    if (this.renderTimes.length > 60) this.renderTimes.shift();
  }

  recordStateUpdate() {
    this.stateUpdateCount++;
  }

  monitorCandleMemory(candleManager) {
    if (!isDev || !candleManager) return;
    const memoryUsage = candleManager.getMemoryUsage();
    const candleCount = candleManager.getLength();
    // eslint-disable-next-line no-console
    console.log(`[Candle Memory] Count: ${candleCount}, Usage: ${memoryUsage} bytes`);
    if (memoryUsage > 50000) {
      // eslint-disable-next-line no-console
      console.warn('[Candle Memory] High candle memory usage detected');
    }
  }

  recordWorkerTime(durationMs) {
    this.workerTimes.push(durationMs);
    if (this.workerTimes.length > 20) this.workerTimes.shift();
    if (isDev && durationMs > 50) {
      // eslint-disable-next-line no-console
      console.warn(`[Perf] Worker took ${durationMs.toFixed(1)}ms (target <50ms)`);
    }
  }

  recordSetTimeout(durationMs) {
    if (isDev && durationMs > 100) {
      // eslint-disable-next-line no-console
      console.warn(`[Perf] setTimeout handler took ${durationMs.toFixed(1)}ms (target <100ms)`);
    }
  }

  getMetrics() {
    const avgRender = this.renderTimes.length
      ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
      : 0;
    const avgWorker = this.workerTimes.length
      ? this.workerTimes.reduce((a, b) => a + b, 0) / this.workerTimes.length
      : 0;
    const memory = performance.memory
      ? {
          usedJSHeapMB: (performance.memory.usedJSHeapSize / 1048576).toFixed(1),
          totalJSHeapMB: (performance.memory.totalJSHeapSize / 1048576).toFixed(1),
        }
      : null;
    return {
      fps: this.fps,
      avgRenderMs: avgRender.toFixed(2),
      avgWorkerMs: avgWorker.toFixed(2),
      stateUpdates: this.stateUpdateCount,
      memory,
    };
  }

  logMetrics() {
    if (!isDev) return;
    const m = this.getMetrics();
    // eslint-disable-next-line no-console
    console.log(
      `[Perf] FPS: ${m.fps} | Render: ${m.avgRenderMs}ms | Worker: ${m.avgWorkerMs}ms | StateUpdates: ${m.stateUpdates}`,
      m.memory ? `| Heap: ${m.memory.usedJSHeapMB}MB / ${m.memory.totalJSHeapMB}MB` : ''
    );
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    const metrics = this.getMetrics();
    if (isDev && metrics.fps > 0 && metrics.fps < 55) {
      // eslint-disable-next-line no-console
      console.warn(`[Perf] Low FPS detected: ${metrics.fps}`);
    }
    this.listeners.forEach(fn => fn(metrics));
  }
}

export const perfMonitor = new PerformanceMonitor();

if (isDev) {
  perfMonitor.start();
  // Log every 10 seconds in dev
  setInterval(() => perfMonitor.logMetrics(), 10000);
}

export default perfMonitor;
