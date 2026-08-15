import React, { useState } from 'react';
import { Zap, TrendingUp, TrendingDown, ChevronDown, AlertTriangle } from 'lucide-react';

const ASSETS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'BNB/USD', 'GOLD', 'EUR/USD', 'GBP/USD'];
const ORDER_TYPES = ['Market', 'Limit', 'Stop', 'Stop-Limit'];
const LEVERAGES = ['1x', '2x', '5x', '10x', '20x', '50x', '100x'];

export default function TradeExecutionPanel() {
  const [asset, setAsset] = useState('BTC/USD');
  const [orderType, setOrderType] = useState('Market');
  const [lotSize, setLotSize] = useState('0.01');
  const [leverage, setLeverage] = useState('10x');
  const [tp, setTp] = useState('71200');
  const [sl, setSl] = useState('65800');
  const [riskPct, setRiskPct] = useState('2');

  const price = 67245;
  const spread = 12.4;
  const margin = ((price * parseFloat(lotSize || 0)) / parseInt(leverage)).toFixed(2);
  const riskUsd = ((price * parseFloat(lotSize || 0)) * (parseFloat(riskPct) / 100)).toFixed(2);

  return (
    <section id="trading" className="rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827' }}>
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1E2A3B]">
        <Zap className="w-4 h-4 text-[#FBBF24]" />
        <h2 className="text-sm font-bold text-white">Trade Execution</h2>
        <div className="ml-auto text-xs text-[#8899AA] font-mono">
          {asset} · <span className="text-white">$67,245</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {/* Asset */}
        <div>
          <label htmlFor="trade-asset" className="text-[10px] text-[#4B5E74] uppercase tracking-wider block mb-1.5">Asset</label>
          <div className="relative">
            <select
              id="trade-asset"
              name="tradeAsset"
              value={asset}
              onChange={e => setAsset(e.target.value)}
              className="w-full h-9 bg-[#0E1628] border border-[#1E2A3B] rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#2563EB]/60 appearance-none pr-8"
            >
              {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4B5E74] pointer-events-none" />
          </div>
        </div>

        {/* Price + Spread */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#4B5E74] uppercase tracking-wider block mb-1.5">Current Price</label>
            <div className="h-9 bg-[#0E1628] border border-[#1E2A3B] rounded-lg px-3 flex items-center text-sm font-mono text-[#10B981]">
              ${price.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[#4B5E74] uppercase tracking-wider block mb-1.5">Spread</label>
            <div className="h-9 bg-[#0E1628] border border-[#1E2A3B] rounded-lg px-3 flex items-center text-sm font-mono text-[#FBBF24]">
              ${spread}
            </div>
          </div>
        </div>

        {/* Order Type + Leverage */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="trade-order-type" className="text-[10px] text-[#4B5E74] uppercase tracking-wider block mb-1.5">Order Type</label>
            <div className="relative">
              <select id="trade-order-type" name="tradeOrderType" value={orderType} onChange={e => setOrderType(e.target.value)}
                className="w-full h-9 bg-[#0E1628] border border-[#1E2A3B] rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#2563EB]/60 appearance-none pr-8">
                {ORDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4B5E74] pointer-events-none" />
            </div>
          </div>
          <div>
            <label htmlFor="trade-leverage" className="text-[10px] text-[#4B5E74] uppercase tracking-wider block mb-1.5">Leverage</label>
            <div className="relative">
              <select id="trade-leverage" name="tradeLeverage" value={leverage} onChange={e => setLeverage(e.target.value)}
                className="w-full h-9 bg-[#0E1628] border border-[#1E2A3B] rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#2563EB]/60 appearance-none pr-8">
                {LEVERAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4B5E74] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Lot Size + Risk */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="trade-lot-size" className="text-[10px] text-[#4B5E74] uppercase tracking-wider block mb-1.5">Lot Size</label>
            <input id="trade-lot-size" name="tradeLotSize" type="number" min="0.001" step="0.001" autoComplete="off" value={lotSize}
              onChange={e => setLotSize(e.target.value)}
              className="w-full h-9 bg-[#0E1628] border border-[#1E2A3B] rounded-lg px-3 text-sm text-white font-mono focus:outline-none focus:border-[#2563EB]/60" />
          </div>
          <div>
            <label htmlFor="trade-risk-pct" className="text-[10px] text-[#4B5E74] uppercase tracking-wider block mb-1.5">Risk %</label>
            <input id="trade-risk-pct" name="tradeRiskPct" type="number" min="0.1" max="5" step="0.1" autoComplete="off" value={riskPct}
              onChange={e => setRiskPct(e.target.value)}
              className="w-full h-9 bg-[#0E1628] border border-[#1E2A3B] rounded-lg px-3 text-sm text-white font-mono focus:outline-none focus:border-[#2563EB]/60" />
          </div>
        </div>

        {/* TP + SL */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="trade-take-profit" className="text-[10px] text-[#10B981] uppercase tracking-wider block mb-1.5">Take Profit</label>
            <input id="trade-take-profit" name="tradeTakeProfit" type="number" autoComplete="off" value={tp} onChange={e => setTp(e.target.value)}
              className="w-full h-9 bg-[#10B98110] border border-[#10B98130] rounded-lg px-3 text-sm text-[#10B981] font-mono focus:outline-none focus:border-[#10B981]/60" />
          </div>
          <div>
            <label htmlFor="trade-stop-loss" className="text-[10px] text-[#EF4444] uppercase tracking-wider block mb-1.5">Stop Loss</label>
            <input id="trade-stop-loss" name="tradeStopLoss" type="number" autoComplete="off" value={sl} onChange={e => setSl(e.target.value)}
              className="w-full h-9 bg-[#EF444410] border border-[#EF444430] rounded-lg px-3 text-sm text-[#EF4444] font-mono focus:outline-none focus:border-[#EF4444]/60" />
          </div>
        </div>

        {/* Margin info */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#1E2A3B] text-[11px]" style={{ background: '#0E1628' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
          <span className="text-[#8899AA]">Margin: <span className="text-white font-mono">${margin}</span></span>
          <span className="text-[#8899AA] ml-auto">Risk: <span className="text-[#FBBF24] font-mono">${riskUsd}</span></span>
        </div>

        {/* Buy / Sell buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            className="flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 20px #10B98144' }}>
            <TrendingUp className="w-4 h-4" /> BUY
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 0 20px #EF444444' }}>
            <TrendingDown className="w-4 h-4" /> SELL
          </button>
        </div>
      </div>
    </section>
  );
}
