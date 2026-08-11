import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Filter, RefreshCw, Search, ShieldAlert, WifiOff } from 'lucide-react';
import { authApiFetch } from '@/lib/authApi';
import './ViewStyles.css';

const INITIAL_ROWS = [
  {
    executionTime: '28/6/26 18:53:54',
    portfolio: 'DADY',
    instrument: 'BTC-USD',
    orderId: '7a5f2d4e-2b7a-4b3a-b6f1-8c3ad0e0a101',
    side: 'BUY',
    filledQuantity: '0,00011138 BTC',
    executionPrice: '58 908,98 $US',
    fees: '0,08 $US',
    type: 'Market',
    direction: 'Buy',
    platform: 'Coinbase',
    expiration: '—',
    payoutReturn: '—',
    source: 'mock',
  },
  {
    executionTime: '28/6/26 18:51:12',
    portfolio: 'Principal',
    instrument: 'DIA-USDC',
    orderId: 'b4d8fbe0-d6f1-43ea-8a8b-44c6f57f8c22',
    side: 'SELL',
    filledQuantity: '18,24000000 DIA',
    executionPrice: '4 218,10 $US',
    fees: '0,12 $US',
    type: 'Limit',
    direction: 'Sell',
    platform: 'Coinbase',
    expiration: '—',
    payoutReturn: '—',
    source: 'mock',
  },
  {
    executionTime: '28/6/26 18:49:39',
    portfolio: 'DADY',
    instrument: 'AVNT-USD',
    orderId: '1cc2e3ae-7d48-4f7a-81a9-e0f42d3c1c33',
    side: 'BUY',
    filledQuantity: '352,00000000 AVNT',
    executionPrice: '0,93 $US',
    fees: '0,05 $US',
    type: 'Market',
    direction: 'Buy',
    platform: 'Coinbase',
    expiration: '—',
    payoutReturn: '—',
    source: 'mock',
  },
  {
    executionTime: '28/6/26 18:47:20',
    portfolio: 'Binary Alpha',
    instrument: 'EUR/USD',
    orderId: 'po-98f3-77a2-call-001',
    side: 'CALL',
    filledQuantity: '$10.00',
    executionPrice: '1.08342',
    fees: '$0.00',
    type: 'Fixed Time',
    direction: 'HIGHER',
    platform: 'Pocket Option',
    expiration: '5m',
    payoutReturn: '+92% ($9.20)',
    source: 'mock',
  },
];

const FILTER_DEFAULTS = {
  search: '',
  portfolio: 'all',
  instrument: 'all',
  type: 'all',
  direction: 'all',
  platform: 'all',
};

function formatShortId(orderId) {
  const value = String(orderId || '');
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function rowMatchesFilter(row, filters) {
  const searchTerm = filters.search.trim().toLowerCase();
  if (searchTerm) {
    const searchable = [
      row.instrument,
      row.portfolio,
      row.orderId,
      row.side,
      row.direction,
      row.directionLabel,
      row.type,
      row.executionPrice,
      row.fees,
      row.expiration,
      row.payoutReturn,
      row.platform,
    ]
      .join(' ')
      .toLowerCase();
    if (!searchable.includes(searchTerm)) {
      return false;
    }
  }

  if (filters.portfolio !== 'all' && row.portfolio !== filters.portfolio) return false;
  if (filters.instrument !== 'all' && row.instrument !== filters.instrument) return false;
  if (filters.type !== 'all' && row.type !== filters.type) return false;
  if (filters.direction !== 'all' && row.direction !== filters.direction) return false;
  if (filters.platform !== 'all' && row.platform !== filters.platform) return false;

  return true;
}

function normalizePlatform(value, source) {
  const candidate = String(value || '').trim().toLowerCase();
  if (candidate.includes('pocket')) return 'Pocket Option';
  if (candidate.includes('coinbase')) return 'Coinbase';

  const normalizedSource = String(source || '').toLowerCase();
  if (normalizedSource.includes('pocket')) return 'Pocket Option';
  return 'Coinbase';
}

function normalizeDirectionToken(value) {
  const token = String(value || '').trim().toUpperCase();
  if (['HIGHER', 'CALL'].includes(token)) return 'HIGHER';
  if (['LOWER', 'PUT'].includes(token)) return 'LOWER';
  if (token === 'SELL') return 'SELL';
  return 'BUY';
}

function formatDurationFromSeconds(secondsValue) {
  if (!Number.isFinite(secondsValue) || secondsValue <= 0) return '—';
  if (secondsValue < 60) return `${Math.round(secondsValue)}s`;
  if (secondsValue % 60 === 0 && secondsValue < 3600) return `${Math.round(secondsValue / 60)}m`;

  const total = Math.round(secondsValue);
  const hours = String(Math.floor(total / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function normalizeExpiration(value) {
  if (value === null || value === undefined) return '—';

  if (typeof value === 'number') {
    return formatDurationFromSeconds(value);
  }

  const raw = String(value).trim();
  if (!raw) return '—';

  const numeric = Number(raw);
  if (Number.isFinite(numeric) && /^\d+(\.\d+)?$/.test(raw)) {
    return formatDurationFromSeconds(numeric);
  }

  return raw;
}

function normalizePayoutReturn(row) {
  if (row?.payoutReturn !== undefined && row?.payoutReturn !== null && String(row.payoutReturn).trim()) {
    return String(row.payoutReturn).trim();
  }

  const outcome = String(row?.outcome || row?.result || '').trim().toUpperCase();
  const payoutPercent = Number(row?.payoutPercent ?? row?.payout_percent ?? row?.fixedYield ?? row?.yieldPercent ?? row?.profitPercent);
  const stakeValue = Number(row?.stake ?? row?.amount ?? row?.investmentAmount ?? row?.filledAmount ?? 0);

  if (outcome === 'LOSS') {
    return '$0.00';
  }

  if (Number.isFinite(payoutPercent)) {
    const payoutAmount = stakeValue > 0 ? (stakeValue * payoutPercent) / 100 : null;
    const percentLabel = `${payoutPercent >= 0 ? '+' : ''}${payoutPercent.toFixed(payoutPercent % 1 === 0 ? 0 : 2)}%`;
    if (payoutAmount !== null) {
      return `${percentLabel} ($${payoutAmount.toFixed(2)})`;
    }
    return percentLabel;
  }

  const rawProfit = row?.profit ?? row?.pnl ?? row?.returnAmount;
  if (rawProfit !== undefined && rawProfit !== null && String(rawProfit).trim()) {
    const numericProfit = Number(rawProfit);
    if (Number.isFinite(numericProfit)) {
      return numericProfit > 0 ? `+$${numericProfit.toFixed(2)}` : `$${numericProfit.toFixed(2)}`;
    }
    return String(rawProfit);
  }

  return '—';
}

function normalizeOrderRow(rawRow) {
  const row = rawRow || {};
  const platform = normalizePlatform(row.platform || row.exchange || row.broker || row.venue, row.source);
  const normalizedDirection = normalizeDirectionToken(row.direction || row.side || row.signal);
  const normalizedSide = normalizeDirectionToken(row.side || row.direction || row.signal);

  const directionLabel = normalizedDirection === 'HIGHER'
    ? 'HIGHER / CALL'
    : normalizedDirection === 'LOWER'
      ? 'LOWER / PUT'
      : normalizedDirection;

  return {
    ...row,
    platform,
    side: normalizedSide,
    direction: normalizedDirection,
    directionLabel,
    expiration: normalizeExpiration(row.expiration ?? row.duration ?? row.expiry ?? row.expiryTime ?? row.contractDurationSeconds),
    payoutReturn: normalizePayoutReturn(row),
  };
}

function getDirectionBadgeStyle(direction) {
  const token = normalizeDirectionToken(direction);
  if (token === 'SELL' || token === 'LOWER') {
    return {
      color: '#FCA5A5',
      background: 'rgba(239,68,68,0.16)',
      border: '1px solid rgba(239,68,68,0.35)',
    };
  }

  return {
    color: '#86EFAC',
    background: 'rgba(16,185,129,0.16)',
    border: '1px solid rgba(16,185,129,0.35)',
  };
}

function getPayoutTone(value) {
  const payoutValue = String(value || '').trim();
  if (payoutValue === '$0.00' || payoutValue.startsWith('-')) return '#FCA5A5';
  if (payoutValue !== '—' && payoutValue !== '') return '#86EFAC';
  return '#F3F4F6';
}

function getSourceLabel(source) {
  if (source === 'coinbase-live') return 'Live Coinbase fills';
  if (source === 'pocketbase') return 'PocketBase historical logs';
  return 'Simulated fills';
}

function getSourceTone(source) {
  if (source === 'coinbase-live') return { border: 'rgba(16,185,129,0.35)', text: '#86EFAC', bg: 'rgba(16,185,129,0.12)' };
  if (source === 'pocketbase') return { border: 'rgba(59,130,246,0.3)', text: '#93C5FD', bg: 'rgba(59,130,246,0.12)' };
  return { border: 'rgba(251,191,36,0.3)', text: '#FDE68A', bg: 'rgba(251,191,36,0.12)' };
}

function CopyButton({ value, copied, onCopy }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: '1px solid rgba(30, 42, 59, 0.9)',
        background: 'rgba(17,24,39,0.72)',
        color: '#B6C7D9',
        borderRadius: 10,
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 600,
        transition: 'all 160ms ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
        event.currentTarget.style.color = '#F3F4F6';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = 'rgba(30, 42, 59, 0.9)';
        event.currentTarget.style.color = '#B6C7D9';
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#8DA2BD', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          background: 'rgba(17, 24, 39, 0.92)',
          border: '1px solid rgba(30, 42, 59, 0.9)',
          borderRadius: 12,
          color: '#F3F4F6',
          padding: '12px 14px',
          outline: 'none',
          minWidth: 160,
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function OrdersView() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('mock');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState('');

  useEffect(() => {
    let active = true;
    let intervalId = null;

    const loadFills = async () => {
      try {
        const response = await authApiFetch('/coinbase/fills?limit=60');
        const payload = await response.json();

        if (!active) return;

        const nextRows = Array.isArray(payload?.records) && payload.records.length > 0
          ? payload.records.map(normalizeOrderRow)
          : INITIAL_ROWS.map(normalizeOrderRow);
        setRows(nextRows);
        setSource(payload?.source || 'mock');
        setLastUpdated(payload?.updatedAt ? new Date(payload.updatedAt) : new Date());
      } catch {
        if (!active) return;
        setRows(INITIAL_ROWS.map(normalizeOrderRow));
        setSource('mock');
        setLastUpdated(new Date());
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFills();
    intervalId = window.setInterval(loadFills, 30000);

    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  const filteredRows = useMemo(() => rows.filter((row) => rowMatchesFilter(row, filters)), [rows, filters]);

  const filterOptions = useMemo(() => {
    const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));

    return {
      portfolios: uniqueSorted(rows.map((row) => row.portfolio)),
      instruments: uniqueSorted(rows.map((row) => row.instrument)),
      types: uniqueSorted(rows.map((row) => row.type)),
      platforms: uniqueSorted(rows.map((row) => row.platform)),
    };
  }, [rows]);

  const handleCopyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrderId(orderId);
      window.setTimeout(() => setCopiedOrderId(''), 1800);
    } catch {
      setCopiedOrderId('');
    }
  };

  const sourceTone = getSourceTone(source);

  return (
    <div className="view-container">
      <div className="view-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h1>Orders</h1>
            <p>Ordres exécutés / Filled Orders synchronized with Coinbase and PocketBase history</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${sourceTone.border}`, background: sourceTone.bg, color: sourceTone.text, borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 700 }}>
              {source === 'coinbase-live' ? <RefreshCw size={14} /> : source === 'pocketbase' ? <ShieldAlert size={14} /> : <WifiOff size={14} />}
              {getSourceLabel(source)}
            </div>
            {lastUpdated ? (
              <div style={{ color: '#8DA2BD', fontSize: 12 }}>
                Last sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1.2fr) repeat(5, minmax(140px, 0.75fr))',
          gap: 14,
          alignItems: 'end',
          padding: 18,
          borderRadius: 18,
          border: '1px solid rgba(30, 42, 59, 0.9)',
          background: 'linear-gradient(180deg, rgba(17,24,39,0.96), rgba(11,18,32,0.98))',
        }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#8DA2BD', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Search asset/market</span>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5E7088' }} />
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="BTC-USD, ETH, AVNT..."
                style={{
                  width: '100%',
                  background: 'rgba(17, 24, 39, 0.92)',
                  border: '1px solid rgba(30, 42, 59, 0.9)',
                  borderRadius: 12,
                  color: '#F3F4F6',
                  padding: '12px 14px 12px 38px',
                  outline: 'none',
                }}
              />
            </div>
          </label>

          <SelectField
            label="Portfolio/Profile"
            value={filters.portfolio}
            onChange={(value) => setFilters((current) => ({ ...current, portfolio: value }))}
            options={[{ value: 'all', label: 'All portfolios' }, ...filterOptions.portfolios.map((portfolio) => ({ value: portfolio, label: portfolio }))]}
          />

          <SelectField
            label="Instrument"
            value={filters.instrument}
            onChange={(value) => setFilters((current) => ({ ...current, instrument: value }))}
            options={[{ value: 'all', label: 'All instruments' }, ...filterOptions.instruments.map((instrument) => ({ value: instrument, label: instrument }))]}
          />

          <SelectField
            label="Type"
            value={filters.type}
            onChange={(value) => setFilters((current) => ({ ...current, type: value }))}
            options={[{ value: 'all', label: 'All types' }, ...filterOptions.types.map((type) => ({ value: type, label: type }))]}
          />

          <SelectField
            label="Direction"
            value={filters.direction}
            onChange={(value) => setFilters((current) => ({ ...current, direction: value }))}
            options={[
              { value: 'all', label: 'All directions' },
              { value: 'BUY', label: 'BUY' },
              { value: 'SELL', label: 'SELL' },
              { value: 'HIGHER', label: 'HIGHER / CALL' },
              { value: 'LOWER', label: 'LOWER / PUT' },
            ]}
          />

          <SelectField
            label="Platform"
            value={filters.platform}
            onChange={(value) => setFilters((current) => ({ ...current, platform: value }))}
            options={[{ value: 'all', label: 'All Platforms' }, ...filterOptions.platforms.map((platform) => ({ value: platform, label: platform }))]}
          />
        </div>

        <div style={{
          border: '1px solid rgba(30, 42, 59, 0.9)',
          borderRadius: 20,
          overflow: 'hidden',
          background: 'rgba(11,18,32,0.96)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid rgba(30, 42, 59, 0.9)' }}>
            <div>
              <div style={{ color: '#F3F4F6', fontWeight: 700, fontSize: 15 }}>Unified Execution Ledger (Coinbase + Pocket Option)</div>
              <div style={{ color: '#8DA2BD', fontSize: 12, marginTop: 4 }}>Crypto spot/margin fills plus binary fixed-time executions</div>
            </div>
            <div style={{ color: '#8DA2BD', fontSize: 12 }}>
              Showing <span style={{ color: '#F3F4F6', fontWeight: 700 }}>{filteredRows.length}</span> of <span style={{ color: '#F3F4F6', fontWeight: 700 }}>{rows.length}</span>
            </div>
          </div>

          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Heure d'exécution</th>
                  <th>Mes actifs / Profil</th>
                  <th>Nom</th>
                  <th>ID de l'ordre</th>
                  <th>Sens</th>
                  <th>Montant</th>
                  <th>Expiration</th>
                  <th>Payout / Return</th>
                  <th>Prix d'exécution</th>
                  <th>Frais</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const badgeStyle = getDirectionBadgeStyle(row.direction || row.side);
                  return (
                    <tr key={`${row.orderId}-${row.executionTime}-${row.instrument}`}>
                      <td style={{ color: '#B6C7D9', fontFamily: "'JetBrains Mono', monospace" }}>{row.executionTime}</td>
                      <td>
                        <div style={{ display: 'grid', gap: 3 }}>
                          <span style={{ color: '#F3F4F6', fontWeight: 700 }}>{row.portfolio}</span>
                          <span style={{ color: '#8DA2BD', fontSize: 11 }}>{row.platform} • {row.source === 'coinbase-live' ? 'Coinbase Live' : row.source === 'pocketbase' ? 'PocketBase' : 'Simulated'}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: '#86EFAC', fontWeight: 700 }}>{row.instrument}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: '#E5EEF8', fontFamily: "'JetBrains Mono', monospace" }}>{formatShortId(row.orderId)}</span>
                          <CopyButton value={row.orderId} copied={copiedOrderId === row.orderId} onCopy={handleCopyOrderId} />
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            borderRadius: 999,
                            fontWeight: 700,
                            fontSize: 12,
                            ...badgeStyle,
                          }}
                        >
                          {row.directionLabel || row.direction || row.side}
                        </span>
                      </td>
                      <td style={{ color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{row.filledQuantity}</td>
                      <td style={{ color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{row.expiration || '—'}</td>
                      <td style={{ color: getPayoutTone(row.payoutReturn), fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{row.payoutReturn || '—'}</td>
                      <td style={{ color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{row.executionPrice}</td>
                      <td style={{ color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{row.fees}</td>
                    </tr>
                  );
                })}
                {!loading && filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ padding: '28px 18px', color: '#8DA2BD', textAlign: 'center' }}>
                      No matching fills for the selected filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
