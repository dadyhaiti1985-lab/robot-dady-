import React from 'react';

const statusColors = {
  ARMED_AND_READY: { border: '#10B981', bg: '#10B98115', badge: 'bg-[#10B98120] text-[#10B981]' },
  WAITING: { border: '#FBBF24', bg: '#FBBF2415', badge: 'bg-[#FBBF2420] text-[#FBBF24]' },
  RISK_LOCK: { border: '#EF4444', bg: '#EF444415', badge: 'bg-[#EF444420] text-[#EF4444]' },
  NEWS_PAUSED: { border: '#FBBF24', bg: '#FBBF2415', badge: 'bg-[#FBBF2420] text-[#FBBF24]' },
};

function Row({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#1E2A3B] last:border-0">
      <span className="text-[11px] text-[#8899AA]">{label}</span>
      <span className={`text-[11px] font-mono font-semibold ${
        ok === true ? 'text-[#10B981]' : ok === false ? 'text-[#EF4444]' : 'text-white'
      }`}>{value}</span>
    </div>
  );
}

export default function TradeDecisionPanel({ decision }) {
  if (!decision) {
    return (
      <div className="rounded-xl border border-[#1E2A3B] p-4" style={{ background: '#111827' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest">Trade Decision Engine</span>
        </div>
        <p className="text-[#4B5E74] text-sm text-center py-6">Submit a trade setup to see the decision report.</p>
      </div>
    );
  }

  const colors = statusColors[decision.status] || statusColors.WAITING;
  const r = decision.report;

  return (
    <div className="rounded-xl border p-4 space-y-3"
      style={{ background: '#111827', borderColor: colors.border }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest">Trade Decision Engine</span>
          <p className="text-white font-bold text-sm mt-0.5">{decision.botStatusIndicator}</p>
          <p className="text-[#8899AA] text-[11px] mt-0.5">{decision.message}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${colors.badge}`}>
          {decision.status.replace(/_/g, ' ')}
        </span>
      </div>

      {r && (
        <>
          <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
            <Row label="Asset" value={r.asset} />
            <Row label="Timeframe" value={r.timeframe} />
            <Row label="Signal" value={r.signal}
              ok={r.signal === 'BUY' ? true : r.signal === 'SELL' ? false : undefined} />
            <Row label="Entry Price" value={`$${Number(r.entry).toLocaleString()}`} />
            <Row label="Stop Loss" value={`$${Number(r.stopLoss).toLocaleString()}`} ok={false} />
            <Row label="Take Profit" value={`$${Number(r.takeProfit).toLocaleString()}`} ok={true} />
          </div>

          <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
            <Row label="Confluence Score"
              value={`${r.confluenceScore}/100`}
              ok={r.confluenceScore > 75} />
            <Row label="Risk/Reward" value={r.rrRatio}
              ok={parseFloat((r.rrRatio || '').split(':')[1]) >= 2.0} />
            <Row label="Risk %" value={`${r.riskPct}%`} />
            <Row label="Position Size (USD)" value={`$${r.positionSizeUSD}`} />
            <Row label="Position Size (Units)" value={r.positionSizeUnits} />
          </div>

          <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
            <Row label="News Check" value={r.newsCheck} ok={r.newsCheck === 'Passed'} />
            <Row label="Risk Check" value={r.riskCheck} ok={r.riskCheck === 'Passed'} />
          </div>

          <div className={`rounded-lg px-4 py-3 text-center font-bold text-sm tracking-wider ${
            r.decision === 'EXECUTE TRADE'
              ? 'bg-[#10B98120] text-[#10B981] border border-[#10B98140]'
              : 'bg-[#EF444420] text-[#EF4444] border border-[#EF444440]'
          }`}>
            {r.decision === 'EXECUTE TRADE' ? '✅ EXECUTE TRADE' : '❌ REJECTED'}
          </div>
        </>
      )}
    </div>
  );
}
