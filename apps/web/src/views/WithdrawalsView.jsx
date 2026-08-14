import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, AlertTriangle, ArrowUpFromLine, Check,
  ChevronDown, ClipboardPaste, Copy, Loader2, RefreshCw,
  Search, ShieldCheck, X,
} from 'lucide-react';
import { authApiFetch } from '@/lib/authApi';
import './ViewStyles.css';

const CURRENCIES = [
  { symbol: 'BTC',  name: 'Bitcoin',    network: 'Bitcoin Network', fee: 0.0001, minWithdraw: 0.0005,  color: '#F7931A', icon: '₿' },
  { symbol: 'ETH',  name: 'Ethereum',   network: 'ERC-20',          fee: 0.003,  minWithdraw: 0.01,    color: '#627EEA', icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether USD', network: 'ERC-20 / TRC-20', fee: 2.5,    minWithdraw: 10,      color: '#26A17B', icon: '₮' },
  { symbol: 'USDC', name: 'USD Coin',   network: 'ERC-20',          fee: 1.5,    minWithdraw: 10,      color: '#2775CA', icon: '$' },
];

// Approximate USD rates for UI calculator only
const USD_RATE = { BTC: 63740, ETH: 3008, USDT: 1, USDC: 1 };

const DEMO_BALANCES = { BTC: 0.0842, ETH: 1.24, USDT: 3200, USDC: 1850 };

const STATUS_STYLES = {
  completed:  { bg: 'rgba(16,185,129,0.12)',  color: '#86EFAC', border: 'rgba(16,185,129,0.3)',  label: 'Completed'  },
  pending:    { bg: 'rgba(245,158,11,0.12)',  color: '#FCD34D', border: 'rgba(245,158,11,0.3)',  label: 'Pending'    },
  processing: { bg: 'rgba(56,189,248,0.12)',  color: '#93C5FD', border: 'rgba(56,189,248,0.3)',  label: 'Processing' },
  rejected:   { bg: 'rgba(239,68,68,0.12)',   color: '#FCA5A5', border: 'rgba(239,68,68,0.3)',   label: 'Rejected'   },
};

function buildFallbackHistory() {
  const now = Date.now();
  return [
    { id: 'w-001', currency: 'BTC',  amount: 0.015, usdValue: 956.10,  status: 'completed',  txid: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', address: 'bc1qxy2kgd...fjhx0wlh', date: new Date(now - 1 * 86400000).toISOString(), network: 'Bitcoin Network' },
    { id: 'w-002', currency: 'ETH',  amount: 0.8,   usdValue: 2406.40, status: 'completed',  txid: '0xdead1234beef5678dead1234beef5678dead1234beef5678dead1234beef5678', address: '0xDeadBe...5678', date: new Date(now - 3 * 86400000).toISOString(), network: 'ERC-20' },
    { id: 'w-003', currency: 'USDT', amount: 1000,  usdValue: 1000.00, status: 'pending',    txid: '0xabc111def222abc111def222abc111def222abc111def222abc111def2220003', address: '0xAbC1...0003', date: new Date(now - 2 * 3600000).toISOString(),  network: 'ERC-20' },
    { id: 'w-004', currency: 'USDC', amount: 500,   usdValue: 500.00,  status: 'processing', txid: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0004', address: '0x9F8e...0004', date: new Date(now - 30 * 60000).toISOString(),   network: 'ERC-20' },
    { id: 'w-005', currency: 'ETH',  amount: 0.2,   usdValue: 601.60,  status: 'rejected',   txid: '',                                                                    address: '0xInvalidAddr...', date: new Date(now - 5 * 86400000).toISOString(), network: 'ERC-20' },
  ];
}

function shortAddr(addr = '') {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function usd(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
}

function hexToRgb(hex = '#000000') {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

// Basic address format validation
function isValidAddress(addr, symbol) {
  if (!addr || addr.trim().length < 10) return false;
  if (symbol === 'BTC') return /^(1|3|bc1)[a-zA-Z0-9]{20,80}$/.test(addr.trim());
  if (['ETH','USDT','USDC'].includes(symbol)) return /^0x[0-9a-fA-F]{40}$/.test(addr.trim());
  return addr.trim().length >= 20;
}

const PAGE_SIZE = 5;

// ──────────────────────────────────────────────────────────────────────────────
export default function WithdrawalsView() {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [address, setAddress] = useState('');
  const [amount, setAmount]   = useState('');
  const [balances, setBalances]   = useState(DEMO_BALANCES);
  const [history, setHistory]     = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { ok, msg }
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage]           = useState(1);
  const [copied, setCopied]       = useState(null);
  const addressRef = useRef(null);

  // Load history
  useEffect(() => {
    let active = true;
    setHistLoading(true);
    authApiFetch('/withdrawals')
      .then((r) => r.json())
      .then((d) => { if (active) setHistory(Array.isArray(d) ? d : buildFallbackHistory()); })
      .catch(() => { if (active) setHistory(buildFallbackHistory()); })
      .finally(() => { if (active) setHistLoading(false); });
    return () => { active = false; };
  }, []);

  // Load available balances
  useEffect(() => {
    authApiFetch('/user/balance')
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d === 'object' && !d.error) {
          setBalances((prev) => ({ ...prev, ...d }));
        }
      })
      .catch(() => {});
  }, []);

  const availBal  = balances[selectedCurrency.symbol] ?? 0;
  const amtNum    = parseFloat(amount) || 0;
  const netAmount = Math.max(0, amtNum - selectedCurrency.fee);
  const netUSD    = netAmount * (USD_RATE[selectedCurrency.symbol] || 1);

  const addrValid   = address.trim() === '' ? null : isValidAddress(address, selectedCurrency.symbol);
  const amountValid = amtNum === 0 ? null : (amtNum >= selectedCurrency.minWithdraw && amtNum <= availBal);
  const canSubmit   = addrValid && amountValid && !submitting;

  const setQuickAmount = useCallback((pct) => {
    const val = availBal * pct - selectedCurrency.fee;
    setAmount(val > 0 ? String(parseFloat(val.toFixed(8))) : '');
  }, [availBal, selectedCurrency.fee]);

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.trim());
    } catch { /* permission denied */ }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await authApiFetch('/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({ currency: selectedCurrency.symbol, address: address.trim(), amount: amtNum }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitResult({ ok: true, msg: `Withdrawal request submitted! Reference: ${data.id || 'N/A'}` });
        setAddress('');
        setAmount('');
        // Refresh history
        authApiFetch('/withdrawals').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setHistory(d); }).catch(() => {});
      } else {
        setSubmitResult({ ok: false, msg: data.error || 'Submission failed. Please try again.' });
      }
    } catch {
      setSubmitResult({ ok: false, msg: 'Network error. Check your connection.' });
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, selectedCurrency, address, amtNum]);

  const copyText = useCallback((text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }, []);

  const filtered = useMemo(() => history.filter((w) => {
    const matchSearch = !search || w.currency?.toLowerCase().includes(search.toLowerCase()) || (w.txid || '').toLowerCase().includes(search.toLowerCase()) || (w.address || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || w.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  }), [history, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalWithdrawn = useMemo(() => history.filter((w) => w.status === 'completed').reduce((s, w) => s + (w.usdValue || 0), 0), [history]);

  return (
    <div className="view-container">
      {/* ── Header ── */}
      <div className="view-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ArrowUpFromLine size={26} style={{ color: '#F59E0B' }} />
          Withdrawals
        </h1>
        <p>Withdraw crypto assets from your Oracle Trader Pro account</p>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Withdrawn',       value: usd(totalWithdrawn),                                                     accent: '#F59E0B' },
          { label: 'Completed',             value: history.filter((w) => w.status === 'completed').length,                  accent: '#86EFAC' },
          { label: 'Pending / Processing',  value: history.filter((w) => w.status === 'pending' || w.status === 'processing').length, accent: '#FCD34D' },
          { label: `${selectedCurrency.symbol} Balance`, value: `${availBal} ${selectedCurrency.symbol}`, accent: selectedCurrency.color },
        ].map((s) => (
          <div key={s.label} style={S.statCard}>
            <div style={{ color: '#8899AA', fontSize: 12, marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: s.accent, fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, marginBottom: 32 }}>
        {/* ── Currency selector ── */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Select Asset</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CURRENCIES.map((c) => (
              <button key={c.symbol} onClick={() => { setSelectedCurrency(c); setAmount(''); setSubmitResult(null); }}
                style={{ ...S.currencyRow, borderColor: selectedCurrency.symbol === c.symbol ? c.color : 'rgba(255,255,255,0.06)', background: selectedCurrency.symbol === c.symbol ? `linear-gradient(135deg,rgba(0,0,0,0.4),rgba(${hexToRgb(c.color)},0.08))` : 'rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: 20, color: c.color, width: 28, textAlign: 'center' }}>{c.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 14 }}>{c.symbol}</div>
                  <div style={{ color: '#8899AA', fontSize: 11 }}>{c.network}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#CBD5E1' }}>{balances[c.symbol] ?? 0}</div>
                  <div style={{ color: '#8899AA', fontSize: 10 }}>Available</div>
                </div>
                {selectedCurrency.symbol === c.symbol && <Check size={13} style={{ color: c.color, flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Withdrawal Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Destination address */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>Destination Address</h3>
            <div style={{ ...S.inputRow, borderColor: addrValid === false ? 'rgba(239,68,68,0.5)' : addrValid === true ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)' }}>
              <input
                ref={addressRef}
                placeholder={`Enter ${selectedCurrency.symbol} address (${selectedCurrency.network})`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={S.addrInput}
              />
              <button onClick={() => { setAddress(''); setSubmitResult(null); }} style={S.iconBtn} title="Clear" disabled={!address}>
                <X size={13} style={{ opacity: address ? 1 : 0.3 }} />
              </button>
              <button onClick={paste} style={{ ...S.iconBtn, borderLeft: '1px solid rgba(255,255,255,0.07)' }} title="Paste from clipboard">
                <ClipboardPaste size={13} />
              </button>
            </div>
            {addrValid === false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: '#FCA5A5', fontSize: 11 }}>
                <AlertCircle size={11} /> Invalid {selectedCurrency.symbol} address format
              </div>
            )}
            {addrValid === true && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: '#86EFAC', fontSize: 11 }}>
                <ShieldCheck size={11} /> Address format valid
              </div>
            )}
          </div>

          {/* Amount */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ ...S.cardTitle, margin: 0 }}>Amount</h3>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#8899AA' }}>
                Available: <span style={{ color: selectedCurrency.color }}>{availBal} {selectedCurrency.symbol}</span>
              </span>
            </div>

            <div style={{ ...S.inputRow, borderColor: amountValid === false ? 'rgba(239,68,68,0.5)' : amountValid === true ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)' }}>
              <input
                type="number"
                placeholder="0.00000000"
                value={amount}
                min="0"
                onChange={(e) => setAmount(e.target.value)}
                style={{ ...S.addrInput, fontFamily: 'JetBrains Mono, monospace', fontSize: 16 }}
              />
              <span style={{ padding: '0 14px', color: selectedCurrency.color, fontSize: 13, fontWeight: 700, borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                {selectedCurrency.symbol}
              </span>
            </div>

            {/* Quick percentage buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {[['25%', 0.25], ['50%', 0.5], ['75%', 0.75], ['MAX', 1]].map(([label, pct]) => (
                <button key={label} onClick={() => setQuickAmount(pct)} style={S.quickBtn}>{label}</button>
              ))}
            </div>

            {amountValid === false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, color: '#FCA5A5', fontSize: 11 }}>
                <AlertCircle size={11} />
                {amtNum < selectedCurrency.minWithdraw
                  ? `Minimum withdrawal: ${selectedCurrency.minWithdraw} ${selectedCurrency.symbol}`
                  : 'Insufficient balance'}
              </div>
            )}

            {/* Fee / net summary */}
            {amtNum > 0 && (
              <div style={{ marginTop: 14, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  ['Withdrawal amount', `${amtNum} ${selectedCurrency.symbol}`],
                  ['Network fee',       `${selectedCurrency.fee} ${selectedCurrency.symbol}`, '#FCD34D'],
                  ['Net you receive',   `${netAmount > 0 ? netAmount.toFixed(8) : 0} ${selectedCurrency.symbol} (≈ ${usd(netUSD)})`, '#86EFAC'],
                ].map(([lbl, val, col]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#8899AA', fontSize: 12 }}>{lbl}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: col || '#CBD5E1' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit result */}
          {submitResult && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', borderRadius: 10, background: submitResult.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${submitResult.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              {submitResult.ok ? <Check size={15} style={{ color: '#86EFAC', flexShrink: 0, marginTop: 1 }} /> : <AlertTriangle size={15} style={{ color: '#FCA5A5', flexShrink: 0, marginTop: 1 }} />}
              <span style={{ fontSize: 13, color: submitResult.ok ? '#86EFAC' : '#FCA5A5' }}>{submitResult.msg}</span>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              ...S.submitBtn,
              background: canSubmit ? 'linear-gradient(135deg, #B45309 0%, #D97706 100%)' : 'rgba(255,255,255,0.06)',
              color: canSubmit ? '#fff' : '#8899AA',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              borderColor: canSubmit ? 'rgba(217,119,6,0.5)' : 'rgba(255,255,255,0.07)',
            }}
          >
            {submitting ? (
              <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
            ) : (
              <><ArrowUpFromLine size={15} /> Confirm Withdrawal</>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8899AA', fontSize: 11 }}>
            <ShieldCheck size={12} style={{ color: '#4ADE80' }} />
            Withdrawals are verified via your connected Coinbase account. Large amounts may require 2FA confirmation.
          </div>
        </div>
      </div>

      {/* ── Withdrawal History ── */}
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ ...S.cardTitle, margin: 0 }}>Withdrawal History</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ color: '#8899AA', position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input placeholder="Search address or TXID…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ ...S.searchInput, paddingLeft: 28 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={S.filterSelect}>
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#8899AA', pointerEvents: 'none' }} />
            </div>
            <button onClick={() => {
              setHistLoading(true);
              authApiFetch('/withdrawals').then((r) => r.json()).then((d) => setHistory(Array.isArray(d) ? d : buildFallbackHistory())).catch(() => setHistory(buildFallbackHistory())).finally(() => setHistLoading(false));
            }} style={S.refreshBtn} title="Refresh">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {histLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8899AA' }}>
            <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <div style={{ fontSize: 13 }}>Loading history…</div>
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8899AA' }}>
            <ArrowUpFromLine size={30} style={{ marginBottom: 10, opacity: 0.25 }} />
            <div style={{ fontSize: 14 }}>No withdrawals found</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>{['Date', 'Asset', 'Amount', 'USD Value', 'Destination', 'TXID', 'Status'].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {paginated.map((w, i) => {
                    const st  = STATUS_STYLES[w.status] || STATUS_STYLES.pending;
                    const cur = CURRENCIES.find((c) => c.symbol === w.currency);
                    return (
                      <tr key={w.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                        <td style={S.td}><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#CBD5E1' }}>{fmtDate(w.date)}</span></td>
                        <td style={S.td}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: cur?.color || '#f3f4f6', fontSize: 14 }}>{cur?.icon}</span>
                            <span style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 13 }}>{w.currency}</span>
                          </span>
                        </td>
                        <td style={S.td}><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#FBBF24' }}>{w.amount}</span></td>
                        <td style={S.td}><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#CBD5E1' }}>{usd(w.usdValue)}</span></td>
                        <td style={S.td}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#8899AA' }} title={w.address}>{shortAddr(w.address || '')}</span>
                            {w.address && <button onClick={() => copyText(w.address, `addr-${w.id}`)} style={S.microCopyBtn} title="Copy address">{copied === `addr-${w.id}` ? <Check size={10} style={{ color: '#86EFAC' }} /> : <Copy size={10} />}</button>}
                          </span>
                        </td>
                        <td style={S.td}>
                          {w.txid ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#8899AA' }} title={w.txid}>{shortAddr(w.txid)}</span>
                              <button onClick={() => copyText(w.txid, `txid-${w.id}`)} style={S.microCopyBtn} title="Copy TXID">{copied === `txid-${w.id}` ? <Check size={10} style={{ color: '#86EFAC' }} /> : <Copy size={10} />}</button>
                            </span>
                          ) : <span style={{ color: '#8899AA', fontSize: 11 }}>—</span>}
                        </td>
                        <td style={S.td}>
                          <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} style={{ ...S.pageBtn, background: p === page ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.04)', color: p === page ? '#FCD34D' : '#8899AA', borderColor: p === page ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)' }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Style tokens ───────────────────────────────────────────────────────────────
const S = {
  card:        { background: 'linear-gradient(135deg,#111827 0%,#0B0E14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px' },
  cardTitle:   { color: '#f3f4f6', fontFamily: 'Space Grotesk,sans-serif', fontSize: 15, fontWeight: 700, margin: '0 0 16px 0' },
  statCard:    { background: 'linear-gradient(135deg,#111827 0%,#0B0E14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px' },
  currencyRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' },
  inputRow:    { display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.35)', border: '1px solid', borderRadius: 8, overflow: 'hidden' },
  addrInput:   { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f3f4f6', fontSize: 13, padding: '10px 12px', fontFamily: 'inherit' },
  iconBtn:     { background: 'none', border: 'none', cursor: 'pointer', color: '#8899AA', padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center' },
  quickBtn:    { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, color: '#FCD34D', fontSize: 12, fontWeight: 600, padding: '5px 12px', cursor: 'pointer' },
  submitBtn:   { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 10, border: '1px solid', fontSize: 14, fontWeight: 700, transition: 'all 0.2s', fontFamily: 'Space Grotesk,sans-serif' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:          { textAlign: 'left', color: '#8899AA', fontSize: 11, fontWeight: 600, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td:          { padding: '12px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
  searchInput: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f3f4f6', fontSize: 13, padding: '7px 12px', outline: 'none', width: 210 },
  filterSelect:{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f3f4f6', fontSize: 13, padding: '7px 28px 7px 12px', outline: 'none', appearance: 'none', cursor: 'pointer' },
  refreshBtn:  { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#8899AA', cursor: 'pointer', padding: '7px 10px', display: 'flex', alignItems: 'center' },
  microCopyBtn:{ background: 'none', border: 'none', cursor: 'pointer', color: '#8899AA', padding: 2, opacity: 0.65 },
  pageBtn:     { border: '1px solid', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' },
};
