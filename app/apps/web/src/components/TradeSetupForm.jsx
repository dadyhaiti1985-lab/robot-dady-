import React, { useState } from 'react';

const ASSETS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'BNB-USD', 'AVAX-USD', 'MATIC-USD', 'LINK-USD'];
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];

const defaultForm = {
  asset: 'BTC-USD',
  timeframe: '4H',
  signal: 'BUY',
  confluenceScore: '',
  riskPct: '1',
  entry: '',
  stopLoss: '',
  takeProfit: '',
};

export default function TradeSetupForm({ onEvaluate, newsEvents = [] }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    const num = v => Number(v);
    if (!form.entry || num(form.entry) <= 0) e.entry = 'Entry > 0 required';
    if (!form.stopLoss || num(form.stopLoss) <= 0) e.stopLoss = 'Stop Loss > 0 required';
    if (!form.takeProfit || num(form.takeProfit) <= 0) e.takeProfit = 'Take Profit > 0 required';
    if (num(form.stopLoss) === num(form.entry)) e.stopLoss = 'SL ≠ Entry';
    if (num(form.takeProfit) === num(form.entry)) e.takeProfit = 'TP ≠ Entry';
    if (!form.confluenceScore || num(form.confluenceScore) < 0 || num(form.confluenceScore) > 100) e.confluenceScore = '0–100';
    if (!form.riskPct || num(form.riskPct) < 0.5 || num(form.riskPct) > 5) e.riskPct = '0.5–5%';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onEvaluate({
      asset: form.asset,
      timeframe: form.timeframe,
      signal: form.signal,
      confluenceScore: Number(form.confluenceScore),
      riskPct: Number(form.riskPct),
      entry: Number(form.entry),
      stopLoss: Number(form.stopLoss),
      takeProfit: Number(form.takeProfit),
    }, newsEvents);
  };

  const field = (label, key, type = 'number', placeholder = '') => {
    const fieldId = `trade-${key.toLowerCase()}`;
    return (
      <div>
        <label htmlFor={fieldId} className="block text-[11px] text-[#8899AA] mb-1 font-mono uppercase">{label}</label>
        <input
          id={fieldId}
          name={key}
          type={type}
          step="any"
          autoComplete="off"
          value={form[key]}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#0B0E14] border rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#2563EB] transition-colors ${
            errors[key] ? 'border-[#EF4444]' : 'border-[#1E2A3B]'
          }`}
        />
        {errors[key] && <p className="text-[#EF4444] text-[10px] mt-0.5">{errors[key]}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#1E2A3B] p-4 space-y-3" style={{ background: '#111827' }}>
      <span className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest">Trade Setup Evaluator</span>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="trade-asset-sel" className="block text-[11px] text-[#8899AA] mb-1 font-mono uppercase">Asset</label>
          <select id="trade-asset-sel" name="asset" value={form.asset} onChange={e => set('asset', e.target.value)}
            className="w-full bg-[#0B0E14] border border-[#1E2A3B] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#2563EB]">
            {ASSETS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="trade-timeframe-sel" className="block text-[11px] text-[#8899AA] mb-1 font-mono uppercase">Timeframe</label>
          <select id="trade-timeframe-sel" name="timeframe" value={form.timeframe} onChange={e => set('timeframe', e.target.value)}
            className="w-full bg-[#0B0E14] border border-[#1E2A3B] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#2563EB]">
            {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[#8899AA] mb-1 font-mono uppercase" id="trade-signal-label">Signal</label>
        <div role="group" aria-labelledby="trade-signal-label" className="flex gap-2">
          {['BUY', 'SELL'].map(s => (
            <button key={s} type="button"
              onClick={() => set('signal', s)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                form.signal === s
                  ? s === 'BUY' ? 'bg-[#10B981] text-black' : 'bg-[#EF4444] text-white'
                  : 'bg-[#0B0E14] border border-[#1E2A3B] text-[#8899AA] hover:text-white'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Confluence Score (0–100)', 'confluenceScore', 'number', '80')}
        {field('Risk % (0.5–5)', 'riskPct', 'number', '1')}
      </div>

      {field('Entry Price', 'entry', 'number', '67200')}

      <div className="grid grid-cols-2 gap-3">
        {field('Stop Loss', 'stopLoss', 'number', '65000')}
        {field('Take Profit', 'takeProfit', 'number', '71000')}
      </div>

      <button type="submit"
        className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-colors">
        Evaluate Trade Setup
      </button>
    </form>
  );
}
