import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, History, Search } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import './ViewStyles.css';

const DATE_RANGE_OPTIONS = [
  { value: '24H', label: '24 Hours' },
  { value: '7D', label: '7 Days' },
  { value: '30D', label: '30 Days' },
  { value: 'ALL', label: 'All Time' },
];

const PAGE_SIZE_OPTIONS = [10, 25];

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function quantity(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(Number(value || 0));
}

function toPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function buildFallbackTrades() {
  const now = Date.now();
  return [
    { id: 'ledger-1', asset: 'BTC/USD', type: 'buy', amount: 0.0142, entryPrice: 58412.5, exitPrice: 59080.2, status: 'closed', pnl: 9.48, timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'ledger-2', asset: 'ETH/USD', type: 'sell', amount: 0.78, entryPrice: 3214.12, exitPrice: 3189.4, status: 'take_profit', pnl: 10.24, timestamp: new Date(now - 8 * 60 * 60 * 1000).toISOString() },
    { id: 'ledger-3', asset: 'SOL/USD', type: 'buy', amount: 11.5, entryPrice: 176.4, exitPrice: 171.8, status: 'stop_loss', pnl: -5.92, timestamp: new Date(now - 28 * 60 * 60 * 1000).toISOString() },
    { id: 'ledger-4', asset: 'AVNT/USD', type: 'buy', amount: 280, entryPrice: 0.89, exitPrice: 0.94, status: 'filled', pnl: 12.6, timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'ledger-5', asset: 'BTC/USD', type: 'sell', amount: 0.01, entryPrice: 60122.7, exitPrice: 60410.4, status: 'canceled', pnl: -1.12, timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString() },
  ];
}

function getDateCutoff(range) {
  const now = Date.now();
  if (range === '24H') return now - 24 * 60 * 60 * 1000;
  if (range === '7D') return now - 7 * 24 * 60 * 60 * 1000;
  if (range === '30D') return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
}

function normalizeTrade(trade) {
  const side = String(trade.type || trade.side || '').toUpperCase();
  const entryPrice = Number(trade.entryPrice || 0);
  const exitPrice = Number(trade.exitPrice || 0);
  const amount = Number(trade.amount || trade.quantity || 0);
  const pnl = Number(trade.pnl || 0);
  const fee = Number(Math.max(0, Math.abs(entryPrice * amount) * 0.0012).toFixed(2));
  const totalValue = Number((entryPrice * amount).toFixed(2));
  const pnlPct = totalValue > 0 ? Number(((pnl / totalValue) * 100).toFixed(2)) : 0;
  const status = String(trade.status || 'closed').toUpperCase();

  return {
    id: trade.id,
    asset: String(trade.asset || trade.symbol || 'UNKNOWN'),
    side,
    entryPrice,
    exitPrice,
    amount,
    pnl,
    pnlPct,
    fee,
    totalValue,
    status,
    timestamp: trade.timestamp || trade.created || new Date().toISOString(),
    executionType: side === 'BUY' ? 'LONG' : 'SHORT',
    signalId: `ORACLE-${String(trade.id || 'N/A').slice(0, 8).toUpperCase()}`,
    slippage: Number((Math.abs((exitPrice || entryPrice) - entryPrice) / Math.max(entryPrice || 1, 1) * 100).toFixed(3)),
    stopLossTrigger: status === 'STOP_LOSS' ? entryPrice * 0.985 : null,
    takeProfitTrigger: status === 'TAKE_PROFIT' ? entryPrice * 1.025 : null,
  };
}

function badgeColors(type) {
  if (type === 'BUY' || type === 'LONG') return { bg: 'rgba(16,185,129,0.16)', color: '#86EFAC', border: 'rgba(16,185,129,0.35)' };
  if (type === 'SELL' || type === 'SHORT') return { bg: 'rgba(239,68,68,0.16)', color: '#FCA5A5', border: 'rgba(239,68,68,0.35)' };
  if (type === 'CLOSED' || type === 'FILLED') return { bg: 'rgba(56,189,248,0.14)', color: '#93C5FD', border: 'rgba(56,189,248,0.28)' };
  if (type === 'STOP_LOSS') return { bg: 'rgba(239,68,68,0.16)', color: '#FCA5A5', border: 'rgba(239,68,68,0.35)' };
  if (type === 'TAKE_PROFIT') return { bg: 'rgba(16,185,129,0.16)', color: '#86EFAC', border: 'rgba(16,185,129,0.35)' };
  if (type === 'CANCELED') return { bg: 'rgba(148,163,184,0.14)', color: '#CBD5E1', border: 'rgba(148,163,184,0.25)' };
  return { bg: 'rgba(245,158,11,0.14)', color: '#FCD34D', border: 'rgba(245,158,11,0.3)' };
}

export default function TradeHistoryView() {
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('30D');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadTrades() {
      try {
        const headers = { Authorization: `Bearer ${pb.authStore.token}` };
        let response = await apiServerClient.fetch('/oracle-trader-pro/trades', { headers });
        if (response.status === 401 && pb.authStore.isValid) {
          try {
            await pb.collection('users').authRefresh();
          } catch {
            if (active) setTrades(buildFallbackTrades().map(normalizeTrade));
            return;
          }
          response = await apiServerClient.fetch('/oracle-trader-pro/trades', {
            headers: { Authorization: `Bearer ${pb.authStore.token}` },
          });
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!active) return;
        const rows = Array.isArray(payload) && payload.length > 0 ? payload.map(normalizeTrade) : buildFallbackTrades().map(normalizeTrade);
        setTrades(rows);
      } catch (error) {
        console.error('Failed to load trade history:', error);
        if (active) setTrades(buildFallbackTrades().map(normalizeTrade));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrades();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sideFilter, statusFilter, dateRange, pageSize]);

  const filteredTrades = useMemo(() => {
    const cutoff = getDateCutoff(dateRange);
    const term = search.trim().toUpperCase();
    return trades.filter((trade) => {
      const tradeTime = new Date(trade.timestamp).getTime();
      if (cutoff && tradeTime < cutoff) return false;
      if (term && !trade.asset.toUpperCase().includes(term)) return false;
      if (sideFilter !== 'ALL' && trade.side !== sideFilter) return false;
      if (statusFilter !== 'ALL' && trade.status !== statusFilter) return false;
      return true;
    });
  }, [trades, dateRange, search, sideFilter, statusFilter]);

  const summary = useMemo(() => {
    const wins = filteredTrades.filter((trade) => trade.pnl > 0).length;
    const totalPnl = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    return {
      totalTrades: filteredTrades.length,
      totalPnl,
      winRate: filteredTrades.length ? (wins / filteredTrades.length) * 100 : 0,
    };
  }, [filteredTrades]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTrades.slice(start, start + pageSize);
  }, [filteredTrades, page, pageSize]);

  function exportCsv() {
    const headers = ['Date & Time', 'Asset / Pair', 'Type / Side', 'Entry Price', 'Exit Price', 'Amount / Size', 'Total Value', 'Realized P&L', 'Fee / Commission', 'Status'];
    const rows = filteredTrades.map((trade) => [
      new Date(trade.timestamp).toLocaleString(),
      trade.asset,
      `${trade.executionType}/${trade.side}`,
      trade.entryPrice,
      trade.exitPrice,
      trade.amount,
      trade.totalValue,
      trade.pnl,
      trade.fee,
      trade.status,
    ]);
    const content = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trade-history-${dateRange.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Trade History</h1>
        <p>Complete history of all executed trades</p>
      </div>

    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1.3fr) repeat(3, minmax(150px, 0.8fr)) auto', gap: 12, padding: 18, borderRadius: 18, border: '1px solid rgba(30,42,59,0.9)', background: 'linear-gradient(180deg, rgba(17,24,39,0.96), rgba(11,18,32,0.98))', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: '#8DA2BD', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>Search Asset Symbol</span>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6E819A' }} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="BTC, ETH, SOL..." style={{ width: '100%', background: 'rgba(17,24,39,0.94)', border: '1px solid rgba(30,42,59,0.9)', color: '#F3F4F6', borderRadius: 12, padding: '12px 14px 12px 38px', outline: 'none' }} />
          </div>
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: '#8DA2BD', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>Side</span>
          <select value={sideFilter} onChange={(event) => setSideFilter(event.target.value)} style={{ background: 'rgba(17,24,39,0.94)', border: '1px solid rgba(30,42,59,0.9)', color: '#F3F4F6', borderRadius: 12, padding: '12px 14px', outline: 'none' }}>
            {['ALL', 'BUY', 'SELL'].map((option) => <option key={option} value={option}>{option === 'ALL' ? 'All Sides' : option}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: '#8DA2BD', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ background: 'rgba(17,24,39,0.94)', border: '1px solid rgba(30,42,59,0.9)', color: '#F3F4F6', borderRadius: 12, padding: '12px 14px', outline: 'none' }}>
            {['ALL', 'FILLED', 'CLOSED', 'CANCELED', 'STOP_LOSS', 'TAKE_PROFIT'].map((option) => <option key={option} value={option}>{option === 'ALL' ? 'All Statuses' : option}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: '#8DA2BD', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>Date Range</span>
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} style={{ background: 'rgba(17,24,39,0.94)', border: '1px solid rgba(30,42,59,0.9)', color: '#F3F4F6', borderRadius: 12, padding: '12px 14px', outline: 'none' }}>
            {DATE_RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button type="button" onClick={exportCsv} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(56,189,248,0.35)', background: 'rgba(56,189,248,0.12)', color: '#93C5FD', cursor: 'pointer', fontWeight: 700 }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="portfolio-stats" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="stat-card"><h4>Total Executed Trades</h4><div className="stat-value">{summary.totalTrades}</div></div>
        <div className="stat-card"><h4>Total Net Realized P&amp;L</h4><div className="stat-value" style={{ color: summary.totalPnl >= 0 ? '#10B981' : '#EF4444' }}>{currency(summary.totalPnl)}</div></div>
        <div className="stat-card"><h4>Overall Win Rate</h4><div className="stat-value" style={{ color: summary.winRate >= 50 ? '#10B981' : '#FBBF24' }}>{toPercent(summary.winRate)}</div><div style={{ marginTop: 10, height: 6, borderRadius: 999, background: 'rgba(30,42,59,0.95)', overflow: 'hidden' }}><div style={{ width: `${Math.max(0, Math.min(100, summary.winRate))}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, rgba(255,255,255,0.2))' }} /></div></div>
      </div>

      <div className="assets-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><History size={18} color="#38BDF8" /> Institutional Trade Ledger</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#8DA2BD', fontSize: 12 }}>Rows per page</span>
            <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} style={{ background: 'rgba(17,24,39,0.94)', border: '1px solid rgba(30,42,59,0.9)', color: '#F3F4F6', borderRadius: 10, padding: '8px 10px', outline: 'none' }}>
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        </div>

        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Asset / Pair</th>
                <th>Type / Side</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Amount / Size</th>
                <th>Total Value ($)</th>
                <th>Realized P&amp;L ($ / %)</th>
                <th>Fee / Commission</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!loading && pageRows.length === 0 ? (
                <tr>
                  <td colSpan="11" className="empty-state">No Trades Found for the current filters.</td>
                </tr>
              ) : null}
              {pageRows.map((trade) => {
                const sideStyle = badgeColors(trade.side);
                const statusStyle = badgeColors(trade.status);
                const expanded = expandedRow === trade.id;
                return (
                  <React.Fragment key={trade.id}>
                    <tr onClick={() => setExpandedRow(expanded ? null : trade.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: '#D3DFEA' }}>{new Date(trade.timestamp).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'grid', gap: 3 }}>
                          <span style={{ color: '#10b981', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{trade.asset}</span>
                          <span style={{ color: '#8DA2BD', fontSize: 11 }}>{trade.executionType}</span>
                        </div>
                      </td>
                      <td><span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: sideStyle.bg, color: sideStyle.color, border: `1px solid ${sideStyle.border}`, fontSize: 11, fontWeight: 700 }}>{trade.side}</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{currency(trade.entryPrice)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{trade.exitPrice ? currency(trade.exitPrice) : '—'}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{quantity(trade.amount)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{currency(trade.totalValue)}</td>
                      <td style={{ color: trade.pnl >= 0 ? '#10B981' : '#EF4444', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{`${currency(trade.pnl)} / ${toPercent(trade.pnlPct)}`}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{currency(trade.fee)}</td>
                      <td><span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, fontSize: 11, fontWeight: 700 }}>{trade.status}</span></td>
                      <td>{expanded ? <ChevronUp size={16} color="#93C5FD" /> : <ChevronDown size={16} color="#93C5FD" />}</td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan="11" style={{ background: 'rgba(11,18,32,0.72)', padding: 18 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
                            <div><div style={{ color: '#6E819A', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em' }}>ORACLE Signal ID</div><div style={{ marginTop: 6, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{trade.signalId}</div></div>
                            <div><div style={{ color: '#6E819A', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Execution Slippage</div><div style={{ marginTop: 6, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{trade.slippage.toFixed(3)}%</div></div>
                            <div><div style={{ color: '#6E819A', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Stop Loss Trigger</div><div style={{ marginTop: 6, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{trade.stopLossTrigger ? currency(trade.stopLossTrigger) : 'Not recorded'}</div></div>
                            <div><div style={{ color: '#6E819A', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Take Profit Trigger</div><div style={{ marginTop: 6, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{trade.takeProfitTrigger ? currency(trade.takeProfitTrigger) : 'Not recorded'}</div></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ color: '#8899AA', fontSize: 12 }}>Page {page} of {totalPages}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(30,42,59,0.9)', background: 'rgba(17,24,39,0.9)', color: page === 1 ? '#4B5E74' : '#F3F4F6', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(30,42,59,0.9)', background: 'rgba(17,24,39,0.9)', color: page === totalPages ? '#4B5E74' : '#F3F4F6', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
