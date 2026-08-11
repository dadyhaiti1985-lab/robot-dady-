import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Globe, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { useIntegratedAi } from '@/hooks/use-integrated-ai';

const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ht', label: 'HT', full: 'Kreyòl' },
  { code: 'fr', label: 'FR', full: 'Français' },
];

const SUGGESTIONS = {
  en: [
    'Analyze current market conditions',
    'What is my win rate?',
    'Explain my P&L',
    'Should I start the trading bot?',
    'Risk management tips',
  ],
  ht: [
    'Analize kondisyon mache aktyèl yo',
    'Ki to viktwa mwen an?',
    'Eksplike P&L mwen an',
    'Èske mwen dwe kòmanse robo a?',
    'Konsèy jesyon risk',
  ],
  fr: [
    'Analyser les conditions du marché',
    'Quel est mon taux de réussite?',
    'Expliquer mon P&L',
    'Dois-je démarrer le bot?',
    'Conseils de gestion des risques',
  ],
};

const LANG_PREFIX = {
  en: 'Please respond in English. ',
  ht: 'Tanpri reponn an Kreyòl ayisyen. ',
  fr: 'Veuillez répondre en français. ',
};

export default function AIChatWindow({ open, balance, botActive, trades = [] }) {
  const { messages, isStreaming, sendMessage, clearMessages } = useIntegratedAi();
  const [input, setInput] = useState('');
  const [lang, setLang] = useState(() => localStorage.getItem('oracle_ai_lang') || 'en');
  const [showLangs, setShowLangs] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  function setLanguage(code) {
    setLang(code);
    localStorage.setItem('oracle_ai_lang', code);
    setShowLangs(false);
  }

  const winRate = trades.length
    ? Math.round((trades.filter(t => Number(t.pnl ?? 0) > 0).length / trades.length) * 100)
    : 0;
  const totalPnl = trades.reduce((s, t) => s + Number(t.pnl ?? 0), 0);
  const recentSide = trades[0]?.type || trades[0]?.side || 'N/A';
  const recentAsset = trades[0]?.asset || trades[0]?.symbol || 'N/A';
  const averagePnl = trades.length ? totalPnl / trades.length : 0;

  function buildContext() {
    return `[USER TRADING CONTEXT]
Balance: $${(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Bot Status: ${botActive ? 'ACTIVE' : 'INACTIVE'}
Total Trades: ${trades.length}
Win Rate: ${winRate}%
Total P&L: $${totalPnl.toFixed(2)}
Recent Trades (last 5): ${trades.slice(0, 5).map(t => `${t.asset || t.symbol} ${t.type || t.side} P&L:${Number(t.pnl ?? 0).toFixed(2)}`).join(', ') || 'None'}
[STRATEGY PARAMETERS]
Default Risk Per Trade: 1%-2% of equity
Default Risk/Reward: 1:2 minimum
Execution Mode: ${botActive ? 'Bot is active' : 'Bot is inactive'}
Recent Bias: ${recentSide} on ${recentAsset}
Average Trade P&L: $${averagePnl.toFixed(2)}
[/STRATEGY PARAMETERS]

[INDICATOR SNAPSHOT]
Win Rate: ${winRate}%
Total P&L: $${totalPnl.toFixed(2)}
Recent Momentum: ${averagePnl >= 0 ? 'Positive' : 'Negative'}
[/INDICATOR SNAPSHOT]
[/USER TRADING CONTEXT]`;
  }

  async function handleSend(text) {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;
    setInput('');
    const prefix = LANG_PREFIX[lang] || '';
    const ctx = messages.length === 0 ? buildContext() + '\n\n' : '';
    await sendMessage(prefix + ctx + msg);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!open) return null;

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en;
  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex flex-col rounded-2xl border border-[#1E2A3B] overflow-hidden"
      style={{
        width: 380,
        maxWidth: 'calc(100vw - 32px)',
        height: 560,
        maxHeight: 'calc(100vh - 120px)',
        background: 'linear-gradient(160deg, rgba(17,24,39,0.97), rgba(9,14,26,0.98))',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 0 1px rgba(37,99,235,0.2), 0 32px 64px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2A3B]"
        style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.12), rgba(16,185,129,0.08))' }}>
        <div className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#111827]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white leading-none">Trading AI Assistant</p>
          <p className="text-[10px] text-[#10B981] mt-0.5">
            {isStreaming ? 'Thinking...' : 'Online · ORACLE Intelligence'}
          </p>
        </div>
        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-[#FBBF24]">
            <DollarSign className="w-3 h-3" />${(balance || 0).toFixed(0)}
          </span>
          <span className={`flex items-center gap-1 text-[10px] ${botActive ? 'text-[#10B981]' : 'text-[#4B5E74]'}`}>
            <Activity className="w-3 h-3" />{botActive ? 'BOT ON' : 'BOT OFF'}
          </span>
        </div>
        {/* Clear */}
        <button onClick={clearMessages} title="Clear chat"
          className="p-1.5 rounded-lg text-[#4B5E74] hover:text-[#EF4444] hover:bg-[#EF444415] transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(16,185,129,0.15))' }}>
              <TrendingUp className="w-8 h-8 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">ORACLE AI Ready</p>
              <p className="text-[11px] text-[#4B5E74] max-w-[260px]">
                Ask me about your portfolio, signals, risk management, or market conditions.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              {suggestions.map((s) => (
                <button key={s} onClick={() => handleSend(s)}
                  className="w-full text-left px-3 py-2 rounded-lg text-[11px] text-[#8899AA] hover:text-white hover:bg-[#1E2A3B] border border-[#1E2A3B] hover:border-[#2563EB]/40 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
              m.role === 'user'
                ? 'text-white rounded-br-sm'
                : 'text-[#E2E8F0] rounded-bl-sm'
            }`}
              style={m.role === 'user'
                ? { background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }
                : { background: 'rgba(30,42,59,0.8)', border: '1px solid rgba(30,42,59,0.8)' }}>
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
              {m.images?.map((url, j) => (
                <img key={j} src={url} alt="" className="mt-2 rounded-lg max-w-full" loading="lazy" />
              ))}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="px-3 py-2 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(30,42,59,0.8)', border: '1px solid rgba(30,42,59,0.8)' }}>
              <span className="flex gap-1">
                {[0,1,2].map(n => (
                  <span key={n} className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce"
                    style={{ animationDelay: `${n * 150}ms` }} />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#1E2A3B]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1E2A3B] focus-within:border-[#2563EB]/50 transition-colors"
          style={{ background: 'rgba(17,24,39,0.8)' }}>
          {/* Lang picker */}
          <div className="relative">
            <button onClick={() => setShowLangs(v => !v)}
              className="flex items-center gap-1 text-[10px] text-[#4B5E74] hover:text-[#8899AA] transition-colors">
              <Globe className="w-3 h-3" />
              <span className="uppercase font-mono">{lang}</span>
            </button>
            {showLangs && (
              <div className="absolute bottom-7 left-0 bg-[#111827] border border-[#1E2A3B] rounded-lg shadow-2xl z-10 py-1 min-w-[110px]">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLanguage(l.code)}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#1E2A3B] transition-colors ${lang === l.code ? 'text-[#2563EB]' : 'text-[#8899AA]'}`}>
                    {l.label} — {l.full}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label htmlFor="ai-chat-input" className="sr-only">Message</label>
          <input
            ref={inputRef}
            id="ai-chat-input"
            name="message"
            type="text"
            autoComplete="off"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={lang === 'ht' ? 'Poze yon kesyon...' : lang === 'fr' ? 'Posez une question...' : 'Ask a question...'}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-xs text-white placeholder-[#4B5E74] focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-90"
            style={{ background: input.trim() && !isStreaming ? 'linear-gradient(135deg, #2563EB, #10B981)' : 'transparent' }}>
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
