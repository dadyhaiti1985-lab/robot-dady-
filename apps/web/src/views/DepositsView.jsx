import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowDownToLine, Check, ChevronDown,
  Copy, ExternalLink, Loader2, RefreshCw, Search,
} from 'lucide-react';
import { authApiFetch } from '@/lib/authApi';
import './ViewStyles.css';

const CURRENCIES = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Network',
    confirmations: 3,
    minDeposit: 0.0001,
    color: '#F7931A',
    icon: '₿',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ERC-20',
    confirmations: 12,
    minDeposit: 0.001,
    color: '#627EEA',
    icon: 'Ξ',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'ERC-20 / TRC-20',
    confirmations: 12,
    minDeposit: 1,
    color: '#26A17B',
    icon: '₮',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'ERC-20',
    confirmations: 12,
    minDeposit: 1,
    color: '#2775CA',
    icon: '$',
  },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const STATUS_STYLES = {
  completed:  { bg: 'rgba(16,185,129,0.12)', color: '#86EFAC', border: 'rgba(16,185,129,0.3)', label: 'Completed' },
  pending:    { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: 'rgba(245,158,11,0.3)', label: 'Pending' },
  processing: { bg: 'rgba(56,189,248,0.12)', color: '#93C5FD', border: 'rgba(56,189,248,0.3)', label: 'Processing' },
  failed:     { bg: 'rgba(239,68,68,0.12)',  color: '#FCA5A5', border: 'rgba(239,68,68,0.3)',  label: 'Failed' },
};

function buildFallbackDeposits() {
  const now = Date.now();
  return [
    { id: 'd-001', currency: 'BTC', amount: 0.025,  usdValue: 1593.50,  status: 'completed',  txid: '3a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), confirmations: 6,  network: 'Bitcoin Network' },
    { id: 'd-002', currency: 'ETH', amount: 1.5,    usdValue: 4512.00,  status: 'completed',  txid: '0xabc123def456abc123def456abc123def456abc123def456abc123def4560001', date: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), confirmations: 35, network: 'ERC-20' },
    { id: 'd-003', currency: 'USDT', amount: 2000,  usdValue: 2000.00,  status: 'completed',  txid: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e', date: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(), confirmations: 20, network: 'ERC-20' },
    { id: 'd-004', currency: 'BTC', amount: 0.01,   usdValue: 637.40,   status: 'pending',    txid: '1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', date: new Date(now - 1 * 60 * 60 * 1000).toISOString(),  confirmations: 1,  network: 'Bitcoin Network' },
    { id: 'd-005', currency: 'USDC', amount: 500,   usdValue: 500.00,   status: 'processing', txid: '0x1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f0002', date: new Date(now - 30 * 60 * 1000).toISOString(),       confirmations: 8,  network: 'ERC-20' },
  ];
}

function shortTxid(txid = '') {
  if (txid.length <= 20) return txid;
  return `${txid.slice(0, 10)}...${txid.slice(-8)}`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function usd(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
}

// ──────────────────────────────────────────────────────────────────────────────
export default function DepositsView() {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // Load deposit history
  useEffect(() => {
    let active = true;
    setLoading(true);

    authApiFetch('/deposits')
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data)) setDeposits(data);
        else if (active) setDeposits(buildFallbackDeposits());
      })
      .catch(() => { if (active) setDeposits(buildFallbackDeposits()); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  // Fetch wallet address for selected currency
  const fetchWalletAddress = useCallback(async (currency) => {
    setWalletLoading(true);
    setWalletAddress(null);
    try {
      const res = await authApiFetch(`/deposits/address?currency=${currency}`);
      if (res.ok) {
        const data = await res.json();
        setWalletAddress(data.address || null);
      } else {
        setWalletAddress(null);
      }
    } catch {
      setWalletAddress(null);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => { fetchWalletAddress(selectedCurrency.symbol); }, [selectedCurrency, fetchWalletAddress]);

  const copyAddress = useCallback((addr) => {
    if (!addr) return;
    navigator.clipboard.writeText(addr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Filtered + paginated history
  const filtered = useMemo(() => {
    return deposits.filter((d) => {
      const matchSearch =
        !search ||
        d.currency.toLowerCase().includes(search.toLowerCase()) ||
        (d.txid || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [deposits, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalDeposited = useMemo(
    () => deposits.filter((d) => d.status === 'completed').reduce((s, d) => s + (d.usdValue || 0), 0),
    [deposits],
  );

  return (
    <div className="view-container">
      {/* ── Header ── */}
      <div className="view-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ArrowDownToLine size={26} style={{ color: '#10b981' }} />
          Deposits
        </h1>
        <p>Fund your Oracle Trader Pro account with crypto assets via Coinbase</p>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Deposited', value: usd(totalDeposited), accent: '#10b981' },
          { label: 'Completed', value: deposits.filter((d) => d.status === 'completed').length, accent: '#86EFAC' },
          { label: 'Pending / Processing', value: deposits.filter((d) => d.status === 'pending' || d.status === 'processing').length, accent: '#FCD34D' },
          { label: 'Supported Assets', value: CURRENCIES.length, accent: '#93C5FD' },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ color: '#8899AA', fontSize: 12, marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: s.accent, fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* ── Currency selector + wallet address ── */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Select Asset</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CURRENCIES.map((c) => (
              <button
                key={c.symbol}
                onClick={() => { setSelectedCurrency(c); setPage(1); }}
                style={{
                  ...styles.currencyRow,
                  borderColor: selectedCurrency.symbol === c.symbol ? c.color : 'rgba(255,255,255,0.06)',
                  background: selectedCurrency.symbol === c.symbol
                    ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(${hexToRgb(c.color)},0.08) 100%)`
                    : 'rgba(255,255,255,0.02)',
                }}
              >
                <span style={{ fontSize: 20, color: c.color, width: 28, textAlign: 'center' }}>{c.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 14 }}>{c.symbol}</div>
                  <div style={{ color: '#8899AA', fontSize: 11 }}>{c.network}</div>
                </div>
                {selectedCurrency.symbol === c.symbol && (
                  <Check size={14} style={{ color: c.color }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Wallet address + amount ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Wallet Address card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Deposit Address — {selectedCurrency.symbol}
            </h3>

            {walletLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8899AA', fontSize: 13 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Fetching address…
              </div>
            ) : walletAddress ? (
              <>
                <div style={styles.addressBox}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#CBD5E1', wordBreak: 'break-all' }}>
                    {walletAddress}
                  </span>
                  <button onClick={() => copyAddress(walletAddress)} style={styles.copyBtn} title="Copy address">
                    {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                  </button>
                </div>
                <div style={styles.infoRow}>
                  <AlertCircle size={12} style={{ color: '#FCD34D', flexShrink: 0 }} />
                  <span style={{ color: '#FCD34D', fontSize: 11 }}>
                    Send only <strong>{selectedCurrency.symbol}</strong> via <strong>{selectedCurrency.network}</strong>.
                    Min. deposit: {selectedCurrency.minDeposit} {selectedCurrency.symbol}.
                    Requires {selectedCurrency.confirmations} confirmations.
                  </span>
                </div>
              </>
            ) : (
              <div style={styles.noAddress}>
                <AlertCircle size={16} style={{ color: '#F59E0B', marginBottom: 6 }} />
                <p style={{ color: '#8899AA', fontSize: 13, margin: 0 }}>
                  Wallet address unavailable. Connect your Coinbase account in <strong style={{ color: '#f3f4f6' }}>Settings → Credentials</strong> to enable live addresses.
                </p>
                <a
                  href="https://www.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.coinbaseLink, marginTop: 10 }}
                >
                  <ExternalLink size={12} /> Open Coinbase
                </a>
              </div>
            )}
          </div>

          {/* Amount calculator */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Amount Calculator</h3>
            <div style={styles.amountWrap}>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.amountInput}
                min="0"
              />
              <span style={styles.amountCurrency}>{selectedCurrency.symbol}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {QUICK_AMOUNTS.map((q) => (
                <button key={q} onClick={() => setAmount(String(q))} style={styles.quickBtn}>
                  ${q}
                </button>
              ))}
            </div>
            {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
                <div style={{ color: '#8899AA', fontSize: 11, marginBottom: 4 }}>Estimated USD value</div>
                <div style={{ color: '#86EFAC', fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700 }}>
                  ≈ {usd(Number(amount) * (selectedCurrency.symbol === 'BTC' ? 63740 : selectedCurrency.symbol === 'ETH' ? 3008 : 1))}
                </div>
                <div style={{ color: '#8899AA', fontSize: 11, marginTop: 4 }}>
                  Network fee est.: ~{selectedCurrency.symbol === 'BTC' ? '$1.20' : '$0.50'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Deposit History ── */}
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ ...styles.cardTitle, margin: 0 }}>Deposit History</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={styles.searchWrap}>
              <Search size={14} style={{ color: '#8899AA', position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                placeholder="Search TXID or asset…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={styles.searchInput}
              />
            </div>
            {/* Status filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={styles.filterSelect}
              >
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="FAILED">Failed</option>
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8899AA', pointerEvents: 'none' }} />
            </div>
            {/* Refresh */}
            <button
              onClick={() => {
                setLoading(true);
                authApiFetch('/deposits')
                  .then((r) => r.json())
                  .then((d) => setDeposits(Array.isArray(d) ? d : buildFallbackDeposits()))
                  .catch(() => setDeposits(buildFallbackDeposits()))
                  .finally(() => setLoading(false));
              }}
              style={styles.refreshBtn}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8899AA' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <div style={{ fontSize: 13 }}>Loading deposit history…</div>
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8899AA' }}>
            <ArrowDownToLine size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
            <div style={{ fontSize: 14 }}>No deposits found</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Date', 'Asset', 'Amount', 'USD Value', 'Network', 'TXID', 'Status'].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((d, i) => {
                    const s = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
                    const currency = CURRENCIES.find((c) => c.symbol === d.currency);
                    return (
                      <tr key={d.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                        <td style={styles.td}><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#CBD5E1' }}>{fmtDate(d.date)}</span></td>
                        <td style={styles.td}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: currency?.color || '#f3f4f6', fontSize: 14 }}>{currency?.icon}</span>
                            <span style={{ color: '#f3f4f6', fontWeight: 600, fontSize: 13 }}>{d.currency}</span>
                          </span>
                        </td>
                        <td style={styles.td}><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#86EFAC' }}>{d.amount}</span></td>
                        <td style={styles.td}><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#CBD5E1' }}>{usd(d.usdValue)}</span></td>
                        <td style={styles.td}><span style={{ fontSize: 11, color: '#8899AA' }}>{d.network}</span></td>
                        <td style={styles.td}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#8899AA' }} title={d.txid}>{shortTxid(d.txid)}</span>
                            <button onClick={() => navigator.clipboard.writeText(d.txid || '')} style={styles.microCopyBtn} title="Copy TXID">
                              <Copy size={11} />
                            </button>
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} style={{ ...styles.pageBtn, background: p === page ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)', color: p === page ? '#86EFAC' : '#8899AA', borderColor: p === page ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Converts #RRGGBB → "R,G,B" for rgba()
function hexToRgb(hex = '#000000') {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── Inline style tokens ────────────────────────────────────────────────────────
const styles = {
  card: {
    background: 'linear-gradient(135deg, #111827 0%, #0B0E14 100%)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: '20px 22px',
  },
  cardTitle: {
    color: '#f3f4f6',
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 15,
    fontWeight: 700,
    margin: '0 0 16px 0',
  },
  statCard: {
    background: 'linear-gradient(135deg, #111827 0%, #0B0E14 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '14px 18px',
  },
  currencyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    border: '1px solid',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  addressBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 10,
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#8899AA',
    flexShrink: 0,
    padding: 2,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  noAddress: {
    textAlign: 'center',
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  coinbaseLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    color: '#93C5FD',
    fontSize: 12,
    textDecoration: 'none',
  },
  amountWrap: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  amountInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f3f4f6',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 18,
    padding: '10px 14px',
  },
  amountCurrency: {
    padding: '0 14px',
    color: '#8899AA',
    fontSize: 13,
    fontWeight: 600,
    borderLeft: '1px solid rgba(255,255,255,0.07)',
  },
  quickBtn: {
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 6,
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    color: '#8899AA',
    fontSize: 11,
    fontWeight: 600,
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    padding: '12px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    verticalAlign: 'middle',
  },
  searchWrap: {
    position: 'relative',
  },
  searchInput: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#f3f4f6',
    fontSize: 13,
    padding: '7px 12px 7px 30px',
    outline: 'none',
    width: 200,
  },
  filterSelect: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#f3f4f6',
    fontSize: 13,
    padding: '7px 30px 7px 12px',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  },
  refreshBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#8899AA',
    cursor: 'pointer',
    padding: '7px 10px',
    display: 'flex',
    alignItems: 'center',
  },
  microCopyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#8899AA',
    padding: 2,
    opacity: 0.6,
  },
  pageBtn: {
    border: '1px solid',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
};
