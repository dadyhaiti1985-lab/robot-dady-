import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, EyeOff, Landmark, RefreshCw, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { authApiFetch } from '@/lib/authApi';
import './ViewStyles.css';

const FALLBACK_DATA = {
  live: false,
  balance: {
    total: 108.8,
    available: 108.8,
    currency: 'USD',
    change24h: -0.18,
    change24hPct: -0.17,
  },
  portfolioSummary: {
    totalBalanceUsd: 108.8,
    change24hUsd: -0.18,
    change24hPct: -0.17,
    marginRate: 0,
    openOrders: { total: 2, buy: 1, sell: 1 },
  },
  portfolioBuckets: [
    { id: 'principal', label: 'Principal (Par défaut)', name: 'Principal', isDefault: true, totalUsd: 14.1, allocationPct: 12.96 },
    { id: 'dady', label: 'DADY', name: 'DADY', isDefault: false, totalUsd: 94.71, allocationPct: 87.04 },
  ],
  treasury: [
    { portfolioId: 'principal', name: 'USD', symbol: 'USD', balanceUsd: 14.1, availableUsd: 14.1, quantity: 14.1, currentPrice: 1, averageEntryPrice: 1, allocationPct: 12.96, allocationPctPortfolio: 100, pnlUsd: 0, pnlPct: 0, principalBalanceUsd: 14.1, derivativesBalanceUsd: 0, predictionsBalanceUsd: 0, yieldPct: null },
    { portfolioId: 'dady', name: 'USDC', symbol: 'USDC', balanceUsd: 0, availableUsd: 0, quantity: 0, currentPrice: 1, averageEntryPrice: 1, allocationPct: 0, allocationPctPortfolio: 0, pnlUsd: 0, pnlPct: 0, principalBalanceUsd: 0, derivativesBalanceUsd: 0, predictionsBalanceUsd: 0, yieldPct: 0 },
  ],
  cryptoAssets: [
    { portfolioId: 'dady', name: 'BTC', symbol: 'BTC', balanceUsd: 13.37, availableUsd: 13.37, quantity: 0.00022638, currentPrice: 59074.12, averageEntryPrice: 58780.44, allocationPct: 12.29, allocationPctPortfolio: 14.12, pnlUsd: 0.07, pnlPct: 0.5 },
    { portfolioId: 'dady', name: 'ETH', symbol: 'ETH', balanceUsd: 81.34, availableUsd: 81.34, quantity: 0.0254, currentPrice: 3202.11, averageEntryPrice: 3198.04, allocationPct: 74.76, allocationPctPortfolio: 85.88, pnlUsd: 0.1, pnlPct: 0.13 },
    { portfolioId: 'dady', name: 'AVNT', symbol: 'AVNT', balanceUsd: 14.12, availableUsd: 14.12, quantity: 15.18, currentPrice: 0.93, averageEntryPrice: 0.9, allocationPct: 12.98, allocationPctPortfolio: 14.91, pnlUsd: 0.46, pnlPct: 3.33 },
  ],
  derivativeSections: {
    derivatives: { totalUsd: 0, count: 0 },
    equities: { totalUsd: 94.71, count: 3 },
    predictions: { totalUsd: 0, count: 0 },
  },
};

const TABS = ['Aperçu', 'Performance', 'Transactions', 'Frais'];

function usd(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
}

function number(value, digits = 8) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(Number(value || 0));
}

function pnlLabel(value, pct) {
  const signed = Number(value || 0);
  const signedPct = Number(pct || 0);
  return `${signed >= 0 ? '+' : ''}${usd(signed)} / ${signedPct >= 0 ? '+' : ''}${signedPct.toFixed(2)}%`;
}

function ActionButton({ label }) {
  return (
    <button
      type="button"
      style={{
        border: '1px solid rgba(30, 42, 59, 0.9)',
        borderRadius: 12,
        background: 'rgba(17,24,39,0.95)',
        color: '#F3F4F6',
        fontWeight: 700,
        fontSize: 13,
        padding: '12px 14px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function SectionCard({ title, subtitle, children, extra }) {
  return (
    <section style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(11,18,32,0.98))', border: '1px solid rgba(30, 42, 59, 0.9)', borderRadius: 20, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, color: '#F3F4F6', fontFamily: "'Space Grotesk', sans-serif", fontSize: 18 }}>{title}</h3>
          {subtitle ? <p style={{ margin: '6px 0 0 0', color: '#8899AA', fontSize: 13 }}>{subtitle}</p> : null}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

export default function PortfolioView() {
  const [data, setData] = useState(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('all');
  const [activeTab, setActiveTab] = useState('Aperçu');
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const [collapsed, setCollapsed] = useState({ derivatives: false, equities: true, predictions: true });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let active = true;
    let timer = null;

    const load = async () => {
      try {
        const res = await authApiFetch('/user/balance');
        const payload = await res.json().catch(() => null);
        if (!active || !payload) return;

        if (res.ok && payload.success && payload.balance) {
          setData({
            ...FALLBACK_DATA,
            ...payload,
            balance: { ...FALLBACK_DATA.balance, ...payload.balance },
            portfolioSummary: { ...FALLBACK_DATA.portfolioSummary, ...payload.portfolioSummary },
            portfolioBuckets: Array.isArray(payload.portfolioBuckets) && payload.portfolioBuckets.length ? payload.portfolioBuckets : FALLBACK_DATA.portfolioBuckets,
            treasury: Array.isArray(payload.treasury) ? payload.treasury : FALLBACK_DATA.treasury,
            cryptoAssets: Array.isArray(payload.cryptoAssets) && payload.cryptoAssets.length ? payload.cryptoAssets : FALLBACK_DATA.cryptoAssets,
            derivativeSections: { ...FALLBACK_DATA.derivativeSections, ...payload.derivativeSections },
          });
          setLastUpdated(new Date());
        }
      } catch {
        if (!active) return;
        setData(FALLBACK_DATA);
        setLastUpdated(new Date());
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    timer = window.setInterval(load, 30000);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  const portfolioBuckets = data.portfolioBuckets || [];
  const portfolioSummary = data.portfolioSummary || FALLBACK_DATA.portfolioSummary;
  const selectedPortfolio = selectedPortfolioId === 'all'
    ? null
    : portfolioBuckets.find((bucket) => bucket.id === selectedPortfolioId) || null;

  const filteredTreasury = useMemo(() => {
    const rows = (data.treasury || []).filter((row) => selectedPortfolioId === 'all' || row.portfolioId === selectedPortfolioId);
    return hideSmallBalances ? rows.filter((row) => row.balanceUsd >= 1) : rows;
  }, [data.treasury, hideSmallBalances, selectedPortfolioId]);

  const filteredCryptoAssets = useMemo(() => {
    const rows = (data.cryptoAssets || []).filter((row) => selectedPortfolioId === 'all' || row.portfolioId === selectedPortfolioId);
    return hideSmallBalances ? rows.filter((row) => row.balanceUsd >= 1) : rows;
  }, [data.cryptoAssets, hideSmallBalances, selectedPortfolioId]);

  const tabsSummary = {
    Aperçu: `${filteredCryptoAssets.length} crypto(s) • ${filteredTreasury.length} trésorerie`,
    Performance: `${pnlLabel(portfolioSummary.change24hUsd, portfolioSummary.change24hPct)} sur 1j`,
    Transactions: `${portfolioSummary.openOrders?.total || 0} ordre(s) ouvert(s)`,
    Frais: 'Aperçu des coûts et frais de conversion',
  };

  const topLabel = selectedPortfolio ? selectedPortfolio.label : 'Tous les portefeuilles';
  const balanceTotal = selectedPortfolio ? selectedPortfolio.totalUsd : (portfolioSummary.totalBalanceUsd || data.balance.total || 0);
  const changeValue = data.balance.change24h ?? portfolioSummary.change24hUsd ?? 0;
  const changePct = data.balance.change24hPct ?? portfolioSummary.change24hPct ?? 0;

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Portfolio</h1>
        <p>Synchronization en temps réel avec Coinbase Advanced Trade pour Principal, DADY, trésorerie et crypto-actifs</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
        <aside style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(11,18,32,0.98))', border: '1px solid rgba(30,42,59,0.9)', borderRadius: 20, padding: 20, boxShadow: '0 18px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#A7BED3', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            <Wallet size={16} />
            Solde total
          </div>
          <div style={{ marginTop: 16, color: '#F3F4F6', fontSize: 34, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{usd(portfolioSummary.totalBalanceUsd || data.balance.total || 0)}</div>
          <div style={{ marginTop: 10, color: changeValue >= 0 ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            {changeValue >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{`${changeValue >= 0 ? '+' : ''}${usd(changeValue)} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%) 1j`}</span>
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ color: '#8DA2BD', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10 }}>Portefeuilles</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedPortfolioId('all')}
                style={{ textAlign: 'left', border: '1px solid rgba(30,42,59,0.9)', background: selectedPortfolioId === 'all' ? 'rgba(37,99,235,0.16)' : 'rgba(17,24,39,0.86)', color: '#F3F4F6', borderRadius: 14, padding: 14, cursor: 'pointer' }}
              >
                <div style={{ fontWeight: 700 }}>Tous les portefeuilles</div>
                <div style={{ marginTop: 6, color: '#A7BED3', fontSize: 12 }}>{usd(portfolioSummary.totalBalanceUsd || data.balance.total || 0)}</div>
              </button>
              {portfolioBuckets.map((bucket) => (
                <button
                  key={bucket.id}
                  type="button"
                  onClick={() => setSelectedPortfolioId(bucket.id)}
                  style={{ textAlign: 'left', border: '1px solid rgba(30,42,59,0.9)', background: selectedPortfolioId === bucket.id ? 'rgba(16,185,129,0.16)' : 'rgba(17,24,39,0.86)', color: '#F3F4F6', borderRadius: 14, padding: 14, cursor: 'pointer' }}
                >
                  <div style={{ fontWeight: 700 }}>{bucket.label}</div>
                  <div style={{ marginTop: 6, color: '#A7BED3', fontSize: 12 }}>{usd(bucket.totalUsd)} • {bucket.allocationPct.toFixed(2)}%</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
            <div style={{ border: '1px solid rgba(30,42,59,0.9)', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.82)' }}>
              <div style={{ color: '#8DA2BD', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Taux de marge</div>
              <div style={{ marginTop: 8, color: '#F3F4F6', fontWeight: 800, fontSize: 24, fontFamily: "'JetBrains Mono', monospace" }}>{portfolioSummary.marginRate.toFixed(2)}%</div>
            </div>
            <div style={{ border: '1px solid rgba(30,42,59,0.9)', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.82)' }}>
              <div style={{ color: '#8DA2BD', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Ordres ouverts</div>
              <div style={{ marginTop: 8, color: '#F3F4F6', fontWeight: 800, fontSize: 24, fontFamily: "'JetBrains Mono', monospace" }}>{portfolioSummary.openOrders?.total || 0}</div>
              <div style={{ marginTop: 6, color: '#A7BED3', fontSize: 12 }}>{portfolioSummary.openOrders?.buy || 0} achat • {portfolioSummary.openOrders?.sell || 0} vente</div>
            </div>
            <div style={{ color: '#8DA2BD', fontSize: 12 }}>
              {loading ? 'Synchronisation…' : lastUpdated ? `Dernière mise à jour: ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Mode local actif'}
            </div>
          </div>
        </aside>

        <div style={{ display: 'grid', gap: 20 }}>
          <SectionCard
            title={topLabel}
            subtitle="Vue consolidée de la balance, des sous-portefeuilles, des cryptos et de la trésorerie"
            extra={<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><ActionButton label="Dépôt" /><ActionButton label="Retirer" /><ActionButton label="Transférer" /><ActionButton label="Convertir" /></div>}
          >
            <div className="portfolio-stats" style={{ marginBottom: 18 }}>
              <div className="stat-card">
                <h4>Solde total</h4>
                <div className="stat-value">{usd(balanceTotal)}</div>
              </div>
              <div className="stat-card">
                <h4>Disponible</h4>
                <div className="stat-value">{usd(data.balance.available || 0)}</div>
              </div>
              <div className="stat-card">
                <h4>Rendement 1j</h4>
                <div className={`stat-value ${changeValue >= 0 ? 'positive' : ''}`} style={{ color: changeValue >= 0 ? '#10B981' : '#EF4444' }}>{`${changeValue >= 0 ? '+' : ''}${usd(changeValue)}`}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    border: '1px solid rgba(30,42,59,0.9)',
                    borderRadius: 999,
                    background: activeTab === tab ? 'rgba(16,185,129,0.16)' : 'rgba(17,24,39,0.82)',
                    color: activeTab === tab ? '#D1FAE5' : '#A7BED3',
                    padding: '10px 14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 14, color: '#8899AA', fontSize: 13 }}>{tabsSummary[activeTab]}</div>
          </SectionCard>

          <SectionCard
            title="Trésorerie"
            subtitle="USD et stablecoins répartis par portefeuille et usage"
            extra={
              <button
                type="button"
                onClick={() => setHideSmallBalances((value) => !value)}
                style={{ border: '1px solid rgba(30,42,59,0.9)', borderRadius: 12, background: hideSmallBalances ? 'rgba(239,68,68,0.14)' : 'rgba(17,24,39,0.85)', color: '#F3F4F6', padding: '10px 12px', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700 }}
              >
                <EyeOff size={15} />
                Masquer les petits soldes
              </button>
            }
          >
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredTreasury.map((asset) => (
                <div key={`${asset.portfolioId}-${asset.symbol}`} style={{ border: '1px solid rgba(30,42,59,0.72)', borderRadius: 16, padding: 16, background: 'rgba(11,18,32,0.8)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#F3F4F6', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</div>
                      <div style={{ color: '#8DA2BD', fontSize: 12 }}>{portfolioBuckets.find((bucket) => bucket.id === asset.portfolioId)?.label || asset.portfolioId}</div>
                    </div>
                    <div style={{ color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{usd(asset.balanceUsd)}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 14, color: '#A7BED3', fontSize: 12 }}>
                    <div><div style={{ color: '#6E819A', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.14em' }}>Solde principal</div><div style={{ marginTop: 6, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{usd(asset.principalBalanceUsd)}</div></div>
                    <div><div style={{ color: '#6E819A', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.14em' }}>Solde dérivés</div><div style={{ marginTop: 6, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{usd(asset.derivativesBalanceUsd)}</div></div>
                    <div><div style={{ color: '#6E819A', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.14em' }}>Solde prédictions</div><div style={{ marginTop: 6, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{usd(asset.predictionsBalanceUsd)}</div></div>
                    <div><div style={{ color: '#6E819A', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.14em' }}>Rendement / Alloc.</div><div style={{ marginTop: 6, color: '#F3F4F6', fontFamily: "'JetBrains Mono', monospace" }}>{asset.yieldPct === null ? `${asset.allocationPct.toFixed(2)}%` : `${asset.yieldPct.toFixed(2)}% • ${asset.allocationPct.toFixed(2)}%`}</div></div>
                  </div>
                </div>
              ))}
              {filteredTreasury.length === 0 ? <div className="empty-state">Aucun solde de trésorerie pour ce filtre.</div> : null}
            </div>
          </SectionCard>

          <SectionCard title="Actifs crypto" subtitle="Solde, prix courant, allocation et rendements par actif">
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Solde ($)</th>
                    <th>Disponible ($)</th>
                    <th>Montant</th>
                    <th>Prix actuel ($)</th>
                    <th>Prix initial moy. ($)</th>
                    <th>Allocation (%)</th>
                    <th>Rendements ($ / % P&amp;L)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCryptoAssets.map((asset) => (
                    <tr key={`${asset.portfolioId}-${asset.symbol}`}>
                      <td>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <span style={{ color: '#10B981', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{asset.symbol}</span>
                          <span style={{ color: '#8DA2BD', fontSize: 11 }}>{portfolioBuckets.find((bucket) => bucket.id === asset.portfolioId)?.label || asset.portfolioId}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{usd(asset.balanceUsd)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{usd(asset.availableUsd)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{`${number(asset.quantity)} ${asset.symbol}`}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{usd(asset.currentPrice)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{usd(asset.averageEntryPrice)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace" }}>{asset.allocationPct.toFixed(2)}%</td>
                      <td style={{ color: asset.pnlUsd >= 0 ? '#10B981' : '#EF4444', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{pnlLabel(asset.pnlUsd, asset.pnlPct)}</td>
                    </tr>
                  ))}
                  {filteredCryptoAssets.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-state">Aucun actif crypto visible pour ce filtre.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { key: 'derivatives', label: 'Produits dérivés', meta: data.derivativeSections?.derivatives || { totalUsd: 0, count: 0 } },
              { key: 'equities', label: 'Actions', meta: data.derivativeSections?.equities || { totalUsd: 0, count: 0 } },
              { key: 'predictions', label: 'Trading de prédictions', meta: data.derivativeSections?.predictions || { totalUsd: 0, count: 0 } },
            ].map((section) => (
              <div key={section.key} style={{ border: '1px solid rgba(30,42,59,0.9)', borderRadius: 18, background: 'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(11,18,32,0.98))', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setCollapsed((current) => ({ ...current, [section.key]: !current[section.key] }))}
                  style={{ width: '100%', padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: '#F3F4F6', cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}><Landmark size={16} />{section.label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#A7BED3', fontSize: 12 }}>{usd(section.meta.totalUsd)} • {section.meta.count} ligne(s) {collapsed[section.key] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</span>
                </button>
                {!collapsed[section.key] ? (
                  <div style={{ padding: '0 18px 18px 18px', color: '#8DA2BD', fontSize: 13 }}>
                    {section.meta.totalUsd > 0 ? `Exposition active détectée: ${usd(section.meta.totalUsd)} répartis sur ${section.meta.count} ligne(s).` : 'Aucune exposition détectée actuellement sur cette section.'}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
