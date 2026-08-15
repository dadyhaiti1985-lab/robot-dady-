/**
 * RAF Throttling Utilities
 * Throttles event handlers using requestAnimationFrame for smooth 60fps performance.
 */

export function throttleMouseMove(callback) {
  let ticking = false;
  return (event) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(event);
        ticking = false;
      });
      ticking = true;
    }
  };
}

export function throttleScroll(callback) {
  let ticking = false;
  return (event) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(event);
        ticking = false;
      });
      ticking = true;
    }
  };
}

export function throttleResize(callback) {
  let ticking = false;
  return (event) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(event);
        ticking = false;
      });
      ticking = true;
    }
  };
}

export function throttleChartInteraction(callback) {
  let ticking = false;
  return (...args) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Creates a debounced function that fires after the last call + delay using RAF.
 */
export function rafDebounce(callback, delayMs = 100) {
  let timeoutId = null;
  let rafId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    cancelAnimationFrame(rafId);
    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(() => callback(...args));
    }, delayMs);
  };
}
