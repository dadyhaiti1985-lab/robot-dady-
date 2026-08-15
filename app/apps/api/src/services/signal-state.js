/**
 * Signal State Manager
 * Tracks per-pair signal processing state to prevent duplicate execution
 */
import logger from '../utils/logger.js';

const signalStates = new Map();

export function initializeSignalState(userId, pair) {
  const key = `${userId}:${pair}`;
  if (!signalStates.has(key)) {
    signalStates.set(key, {
      userId,
      pair,
      lastSignal: null,
      lastSignalTime: null,
      signalProcessed: false,
      lastCandleTime: null,
    });
  }
  return signalStates.get(key);
}

export function getSignalState(userId, pair) {
  return signalStates.get(`${userId}:${pair}`) || initializeSignalState(userId, pair);
}

export function updateSignalState(userId, pair, updates) {
  const state = initializeSignalState(userId, pair);
  Object.assign(state, updates);
  signalStates.set(`${userId}:${pair}`, state);
  return state;
}

// Returns true if this is a NEW candle (new signal should be processed)
export function isNewSignal(userId, pair, currentCandleTime) {
  const state = getSignalState(userId, pair);
  if (state.lastCandleTime !== currentCandleTime) {
    logger.info(`[SignalState] New candle for ${pair}: ${currentCandleTime}`);
    return true;
  }
  logger.info(`[SignalState] Same candle for ${pair} — signal already processed`);
  return false;
}

export function markSignalProcessed(userId, pair, candleTime) {
  updateSignalState(userId, pair, {
    signalProcessed: true,
    lastSignalTime: Date.now(),
    lastCandleTime: candleTime,
  });
}

export function resetSignalState(userId, pair, newCandleTime) {
  updateSignalState(userId, pair, {
    lastSignal: null,
    signalProcessed: false,
    lastCandleTime: newCandleTime,
  });
}

export function clearAllSignalStates() {
  signalStates.clear();
  logger.info('[SignalState] All signal states cleared');
}

export function getAllSignalStates() {
  return Array.from(signalStates.entries()).map(([key, state]) => ({ key, ...state }));
}
