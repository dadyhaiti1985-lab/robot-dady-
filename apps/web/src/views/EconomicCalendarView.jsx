import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, Filter, Globe2, RefreshCw } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import './ViewStyles.css';

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'upcoming', label: 'Upcoming' },
];

const IMPACT_OPTIONS = [
  { value: 'all', label: 'All Impact' },
  { value: 'high', label: 'High Impact' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CURRENCY_OPTIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'Global', label: 'Global' },
];

const IMPACT_STYLES = {
  High: { bg: 'rgba(239,68,68,0.16)', color: '#FCA5A5', border: 'rgba(239,68,68,0.35)' },
  Medium: { bg: 'rgba(249,115,22,0.16)', color: '#FDBA74', border: 'rgba(249,115,22,0.35)' },
  Low: { bg: 'rgba(245,158,11,0.14)', color: '#FCD34D', border: 'rgba(245,158,11,0.32)' },
  Holiday: { bg: 'rgba(148,163,184,0.14)', color: '#CBD5E1', border: 'rgba(148,163,184,0.25)' },
};

function Flag({ code }) {
  const flags = {
    USD: 'US',
    EUR: 'EU',
    GBP: 'GB',
    JPY: 'JP',
    AUD: 'AU',
    CAD: 'CA',
    NZD: 'NZ',
    CHF: 'CH',
  };
  const country = flags[String(code || '').toUpperCase()] || 'UN';
  return <img alt={code} src={`https://flagsapi.com/${country}/flat/32.png`} style={{ width: 18, height: 18, borderRadius: 999, objectFit: 'cover' }} />;
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ color: '#8DA2BD', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ background: 'rgba(17,24,39,0.94)', border: '1px solid rgba(30,42,59,0.9)', color: '#F3F4F6', borderRadius: 12, padding: '12px 14px', outline: 'none' }}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export default function EconomicCalendarView() {
  const [range, setRange] = useState('week');
  const [impact, setImpact] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [data, setData] = useState({ events: [], riskStatus: null, source: 'fallback', updatedAt: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let timer = null;

    const load = async () => {
      try {
        const query = new URLSearchParams({ range, impact, currency });
        const response = await apiServerClient.fetch(`/economic-calendar?${query.toString()}`);
        const payload = await response.json();
        if (!active || !payload?.success) return;
        setData({
          events: Array.isArray(payload.events) ? payload.events : [],
          riskStatus: payload.riskStatus || null,
          source: payload.source || 'fallback',
          updatedAt: payload.updatedAt || null,
        });
      } catch (error) {
        if (!active) return;
        console.error('Failed to load economic calendar:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    timer = window.setInterval(load, 60_000);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [range, impact, currency]);

  const summary = useMemo(() => {
    const high = data.events.filter((event) => event.impact === 'High').length;
    const medium = data.events.filter((event) => event.impact === 'Medium').length;
    const low = data.events.filter((event) => event.impact === 'Low').length;
    return { high, medium, low };
  }, [data.events]);

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Economic Calendar</h1>
        <p>Upcoming economic events, macro risk releases, and high-impact data in real time</p>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(180px, 1fr)) auto',
          gap: 14,
          padding: 18,
          border: '1px solid rgba(30,42,59,0.9)',
          borderRadius: 18,
          background: 'linear-gradient(180deg, rgba(17,24,39,0.96), rgba(11,18,32,0.98))',
          alignItems: 'end',
        }}>
          <FilterSelect label="Date" value={range} onChange={setRange} options={RANGE_OPTIONS} />
          <FilterSelect label="Impact Level" value={impact} onChange={setImpact} options={IMPACT_OPTIONS} />
          <FilterSelect label="Currency / Region" value={currency} onChange={setCurrency} options={CURRENCY_OPTIONS} />
          <div style={{ justifySelf: 'end', display: 'grid', gap: 6 }}>
            <div style={{ color: '#8DA2BD', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>Feed Status</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '10px 12px', border: `1px solid ${data.source === 'live' ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)'}`, background: data.source === 'live' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: data.source === 'live' ? '#86EFAC' : '#FCD34D', fontWeight: 700, fontSize: 12 }}>
              <RefreshCw size={14} />
              {data.source === 'live' ? 'Live Macro Feed' : 'Fallback Macro Feed'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
          {[
            { label: 'High Impact', value: summary.high, color: '#FCA5A5' },
            { label: 'Medium Impact', value: summary.medium, color: '#FDBA74' },
            { label: 'Low Impact', value: summary.low, color: '#FCD34D' },
            { label: 'Updated', value: data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—', color: '#93C5FD' },
          ].map((item) => (
            <div key={item.label} className="stat-card">
              <h4>{item.label}</h4>
              <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {data.riskStatus && (
          <div style={{ border: `1px solid ${data.riskStatus.cautionMode ? 'rgba(239,68,68,0.35)' : 'rgba(30,42,59,0.9)'}`, borderRadius: 18, background: data.riskStatus.cautionMode ? 'linear-gradient(135deg, rgba(127,29,29,0.28), rgba(17,24,39,0.95))' : 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(11,18,32,0.98))', padding: 18, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: data.riskStatus.cautionMode ? 'rgba(239,68,68,0.18)' : 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.riskStatus.cautionMode ? <AlertTriangle size={18} color="#FCA5A5" /> : <CalendarClock size={18} color="#93C5FD" />}
              </div>
              <div>
                <div style={{ color: '#F3F4F6', fontWeight: 800 }}>{data.riskStatus.cautionMode ? 'Caution Mode Suggested' : 'Macro Window Clear'}</div>
                <div style={{ color: '#A7BED3', fontSize: 13, marginTop: 4 }}>{data.riskStatus.message}</div>
              </div>
            </div>
            <div style={{ color: '#8DA2BD', fontSize: 12 }}>Status flag exposed for strategy risk adjustment.</div>
          </div>
        )}

        <div className="orders-table" style={{ border: '1px solid rgba(30,42,59,0.9)', borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(180deg, rgba(17,24,39,0.96), rgba(11,18,32,0.98))' }}>
          <table>
            <thead>
              <tr>
                <th>Heure / Date</th>
                <th>Devise / Pè</th>
                <th>Événement / Event Name</th>
                <th>Impact Indicator</th>
                <th>Actual</th>
                <th>Forecast</th>
                <th>Previous</th>
              </tr>
            </thead>
            <tbody>
              {!loading && data.events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">No macro events matched the selected filters.</td>
                </tr>
              ) : null}
              {data.events.map((event) => {
                const impactStyle = IMPACT_STYLES[event.impact] || IMPACT_STYLES.Low;
                return (
                  <tr key={event.id}>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", color: '#D3DFEA' }}>{event.localTime}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Flag code={event.country} />
                        <div style={{ display: 'grid', gap: 2 }}>
                          <span style={{ color: '#F3F4F6', fontWeight: 700 }}>{event.country}</span>
                          <span style={{ color: '#8DA2BD', fontSize: 11 }}>{event.region}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'grid', gap: 3 }}>
                        <span style={{ color: '#F3F4F6', fontWeight: 700 }}>{event.event}</span>
                        <span style={{ color: '#8DA2BD', fontSize: 11 }}>{event.isUpcoming ? `${event.minutesUntil} min` : 'Released'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: impactStyle.bg, color: impactStyle.color, border: `1px solid ${impactStyle.border}`, fontSize: 11, fontWeight: 700 }}>
                        {event.impact}
                      </span>
                    </td>
                    <td style={{ color: event.actual === '—' ? '#8DA2BD' : '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{event.actual}</td>
                    <td style={{ color: '#D3DFEA', fontFamily: "'JetBrains Mono', monospace" }}>{event.forecast}</td>
                    <td style={{ color: '#D3DFEA', fontFamily: "'JetBrains Mono', monospace" }}>{event.previous}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
