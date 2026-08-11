import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ShieldAlert } from 'lucide-react';
import { useIntegratedAi } from '@/hooks/use-integrated-ai';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function AiTradingAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isStreaming, sendMessage } = useIntegratedAi();
  const { isAuthenticated } = useAuth();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    const t = input.trim();
    if (!t || isStreaming) return;
    setInput('');
    sendMessage(t, []);
  };

  const suggestions = [
    'Ki jan mache BTC-USD ye kounye a?',
    'Explain the current strategy',
    'Èske gen yon bon setup pou achte?',
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-emerald text-background flex items-center justify-center glow-green hover:scale-105 active:scale-95 transition-transform"
          aria-label="Louvri Asistan IA"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-cyan pulse-dot border-2 border-background" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-[400px] h-[560px] max-h-[80vh] glass-card flex flex-col overflow-hidden glow-green">
          <div className="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b border-border bg-sidebar">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-emerald" />
            </div>
            <div className="leading-none">
              <div className="text-sm font-bold tracking-tight">ASISTAN IA</div>
              <div className="text-[10px] font-mono-metrics text-emerald flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald pulse-dot" /> ORACLE ONLINE
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
            {!isAuthenticated && (
              <div className="p-3 rounded-lg bg-amber/5 border border-amber/25 text-xs text-amber flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Konekte pou konvèsasyon w yo sove. (Sign in to persist your chat history.)</span>
              </div>
            )}
            {messages.length === 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-cyan" /> Poze yon kesyon sou mache a
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { if (!isStreaming) sendMessage(s, []); }}
                    className="w-full text-left text-xs px-3 py-2.5 rounded-lg bg-card/60 border border-border/60 hover:border-primary/40 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary/15 border border-primary/30 text-foreground'
                    : 'bg-card/70 border border-border/60 text-foreground/90'
                }`}>
                  {m.content || (isStreaming && i === messages.length - 1 ? <span className="inline-block w-2 h-4 bg-emerald/70 animate-pulse" /> : '')}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="p-3 border-t border-border flex gap-2 shrink-0">
            <input
              id="ai-trading-chat-input"
              name="aiTradingChatMessage"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ekri yon mesaj..."
              disabled={isStreaming}
              autoComplete="off"
              className="flex-1 bg-card/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="w-10 h-10 shrink-0 rounded-lg bg-emerald text-background flex items-center justify-center hover:bg-emerald/90 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
