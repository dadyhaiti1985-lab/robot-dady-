/**
 * News Filter
 * Blocks trades during high-impact economic news events.
 */

export class NewsFilter {
  /**
   * @param {Array<{timestamp, impact, title}>} newsEvents
   * @param {number} timeBuffer - minutes before/after event to block
   * @returns {boolean} true if trade should be blocked
   */
  shouldBlockTrade(newsEvents = [], timeBuffer = 30) {
    if (!newsEvents || newsEvents.length === 0) return false;
    const now = Date.now();
    const bufferMs = timeBuffer * 60 * 1000;

    return newsEvents.some(event => {
      if (event.impact !== 'HIGH' && event.impact !== 'high') return false;
      const eventTime = new Date(event.timestamp || event.time || event.date).getTime();
      if (isNaN(eventTime)) return false;
      return Math.abs(now - eventTime) <= bufferMs;
    });
  }

  /**
   * Get the nearest upcoming high-impact event.
   * @param {Array} newsEvents
   * @returns {{ event, minutesUntil } | null}
   */
  getNearestEvent(newsEvents = []) {
    const now = Date.now();
    const upcoming = newsEvents
      .filter(e => (e.impact === 'HIGH' || e.impact === 'high'))
      .map(e => {
        const t = new Date(e.timestamp || e.time || e.date).getTime();
        return { event: e, ms: t - now };
      })
      .filter(e => !isNaN(e.ms))
      .sort((a, b) => Math.abs(a.ms) - Math.abs(b.ms));

    if (upcoming.length === 0) return null;
    const nearest = upcoming[0];
    return { event: nearest.event, minutesUntil: Math.round(nearest.ms / 60000) };
  }
}

export default NewsFilter;
