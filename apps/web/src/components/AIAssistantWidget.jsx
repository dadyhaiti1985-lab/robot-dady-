import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, Send, Sparkles, Mic, MicOff, Volume2, VolumeX,
  ChevronDown, ChevronUp, BarChart2, Trash2, Loader2, Clock,
  TrendingUp, ShieldAlert, Settings, HelpCircle,
} from 'lucide-react';
import { useIntegratedAi } from '@/hooks/use-integrated-ai';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

// ─── System prompt injected before every user message when analyzing market ───
const MARKET_ANALYSIS_PREFIX = `You are ORACLE Intelligence, an elite Master Trader, Portfolio Strategist, and Execution Risk Manager integrated into Oracle Trader Pro.
You speak both Haitian Creole and English fluently. Reply in the user's dominant language.
Use the supplied dashboard context to assess balance, risk, strategy posture, and market conditions.
When analyzing markets, explain support/resistance, trend direction, entry logic, stop-loss, take-profit, and the reason the bot should or should not act.
Keep the response concise, execution-focused, and capital-preserving.`;

const SUGGESTIONS = [
  { text: 'Ki jan mwen ka konekte Coinbase API mwen?', icon: Settings },
  { text: 'Explain Stop-Loss and Take-Profit', icon: HelpCircle },
  { text: 'Analyze current market status', icon: BarChart2 },
  { text: 'Ki jan bot la travay otomatikman?', icon: TrendingUp },
];

export default function AIAssistantWidget({ selectedPair, selectedTimeframe, capital }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const { messages, isStreaming, sendMessage, clearMessages } = useIntegratedAi();
  const { isAuthenticated } = useAuth();

  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open && !minimized) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  // TTS: speak last assistant message
  useEffect(() => {
    if (!ttsEnabled || isStreaming) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || !last.content) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(last.content.slice(0, 500));
      utter.lang = last.content.match(/[àèòùÈÀÒÙ]/) ? 'fr-HT' : 'en-US';
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.onstart = () => setTtsPlaying(true);
      utter.onend = () => setTtsPlaying(false);
      utter.onerror = () => setTtsPlaying(false);
      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
  }, [messages, isStreaming, ttsEnabled]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'fr-HT'; // Haitian Creole / French fallback

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          setInput((prev) => prev + e.results[i][0].transcript);
          setTranscript('');
        } else {
          interim += e.results[i][0].transcript;
          setTranscript(interim);
        }
      }
    };
    rec.onend = () => {
      setIsListening(false);
      setTranscript('');
    };
    rec.onerror = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleSend = (text) => {
    const msg = (text ?? input).trim();
    if (!msg || isStreaming || analyzing) return;
    setInput('');
    const fullMsg = `${MARKET_ANALYSIS_PREFIX}\n\n[Dashboard Context]\nPair: ${selectedPair}\nTimeframe: ${selectedTimeframe}\nCapital: $${capital}\n[/Dashboard Context]\n\nUser: ${msg}`;
    sendMessage(fullMsg, []);
  };

  const analyzeMarket = async () => {
    setAnalyzing(true);
    try {
      const res = await apiServerClient.fetch('/ai/analyze-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({
          symbol: selectedPair ?? 'BTC-USD',
          timeframe: selectedTimeframe ?? '4H',
          capital: Number(capital ?? 1000),
        }),
      });

      let analysisText = '';
      if (res.ok) {
        const data = await res.json();
        analysisText = `Analyze this market data for ${selectedPair} (${selectedTimeframe}) and provide a clear, human-friendly explanation in Haitian Creole. Include: market trend, what the bot should do, entry/SL/TP levels, and key indicators. Data: ${JSON.stringify(data)}`;
      } else {
        analysisText = `Explain the current market conditions for ${selectedPair} on the ${selectedTimeframe} timeframe with $${capital} capital. Provide entry, stop-loss and take-profit levels. Respond in Haitian Creole.`;
      }
      const fullMsg = `${MARKET_ANALYSIS_PREFIX}\n\n${analysisText}`;
      sendMessage(fullMsg, []);
    } catch {
      const fallback = `${MARKET_ANALYSIS_PREFIX}\n\nAnalyze ${selectedPair ?? 'BTC-USD'} market for ${selectedTimeframe ?? '4H'} timeframe with $${capital ?? 1000} capital. Give entry/SL/TP and trend explanation in Haitian Creole.`;
      sendMessage(fallback, []);
    } finally {
      setAnalyzing(false);
    }
  };

  const fmtTime = (idx) => {
    const now = new Date();
    // rough — messages don't carry timestamps
    now.setSeconds(now.getSeconds() - (messages.length - idx) * 30);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-emerald text-background flex items-center justify-center glow-green hover:scale-105 active:scale-95 transition-transform shadow-xl"
          aria-label="Ouvri Asistan IA"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-cyan pulse-dot border-2 border-background" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="widget"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={`fixed z-50 right-3 sm:right-5 bottom-3 sm:bottom-5 w-[94vw] max-w-[420px] glass-card flex flex-col overflow-hidden glow-green shadow-2xl transition-all duration-300 ${
              minimized ? 'h-[56px]' : 'h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 h-14 shrink-0 border-b border-border bg-sidebar">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald" />
              </div>
              <div className="leading-none min-w-0 flex-1">
                <div className="text-sm font-bold tracking-tight truncate">AI Assistant / Market Guide</div>
                <div className="text-[10px] font-mono-metrics text-emerald flex items-center gap-1">
                  {isStreaming || analyzing
                    ? <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Thinking...</>
                    : ttsPlaying
                    ? <><Volume2 className="w-2.5 h-2.5 animate-pulse" /> Speaking...</>
                    : <><span className="w-1.5 h-1.5 rounded-full bg-emerald pulse-dot" /> ORACLE ONLINE</>
                  }
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* TTS toggle */}
                <button
                  onClick={() => {
                    setTtsEnabled((v) => !v);
                    if (ttsPlaying) { window.speechSynthesis?.cancel(); setTtsPlaying(false); }
                  }}
                  title={ttsEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4 text-cyan" /> : <VolumeX className="w-4 h-4" />}
                </button>
                {/* Clear */}
                <button
                  onClick={clearMessages}
                  title="Efase konvèsasyon"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {/* Minimize */}
                <button
                  onClick={() => setMinimized((v) => !v)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body — hidden when minimized */}
            {!minimized && (
              <>
                {/* Analyze Market button */}
                <div className="px-3 pt-2.5 pb-1.5 shrink-0">
                  <button
                    onClick={analyzeMarket}
                    disabled={isStreaming || analyzing}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber/10 border border-amber/40 text-amber text-xs font-semibold hover:bg-amber/20 transition-colors disabled:opacity-50"
                  >
                    {analyzing
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Ap Analize Mache a...</>
                      : <><BarChart2 className="w-3.5 h-3.5" /> Analyze Market Status — {selectedPair ?? 'BTC-USD'}</>}
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-3 scrollbar-hide">
                  {!isAuthenticated && (
                    <div className="p-2.5 rounded-lg bg-amber/5 border border-amber/25 text-xs text-amber flex items-start gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Konekte pou sove istwa konvèsasyon ou. (Sign in to save chat history.)</span>
                    </div>
                  )}

                  {messages.length === 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan" />
                        Poze yon kesyon oswa chwazi yon sijèsyon:
                      </p>
                      {SUGGESTIONS.map(({ text, icon: Icon }) => (
                        <button
                          key={text}
                          onClick={() => handleSend(text)}
                          disabled={isStreaming}
                          className="w-full text-left text-xs px-3 py-2.5 rounded-lg bg-card/60 border border-border/60 hover:border-primary/40 transition-colors flex items-center gap-2"
                        >
                          <Icon className="w-3.5 h-3.5 text-cyan shrink-0" />
                          {text}
                        </button>
                      ))}
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[88%] rounded-xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-primary/15 border border-primary/30 text-foreground'
                          : 'bg-card/70 border border-border/60 text-foreground/90'
                      }`}>
                        {m.role === 'assistant' && (
                          <div className="flex items-center gap-1 mb-1 text-[9px] text-emerald font-mono-metrics">
                            <Bot className="w-2.5 h-2.5" /> QuantMaster AI
                          </div>
                        )}
                        {m.content || (isStreaming && i === messages.length - 1
                          ? <span className="inline-block w-2 h-3.5 bg-emerald/70 animate-pulse align-middle" />
                          : '')}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 px-1">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                        <span className="text-[9px] font-mono-metrics text-muted-foreground/50">{fmtTime(i)}</span>
                      </div>
                    </div>
                  ))}

                  <div ref={endRef} />
                </div>

                {/* Real-time transcript */}
                {(isListening || transcript) && (
                  <div className="mx-3 mb-1 px-3 py-1.5 rounded-lg bg-cyan/5 border border-cyan/30 text-xs text-cyan font-mono-metrics flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 animate-pulse shrink-0" />
                    <span className="truncate">{transcript || 'Ap koute...'}</span>
                  </div>
                )}

                {/* Input bar */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="p-2.5 border-t border-border flex gap-2 shrink-0"
                >
                  <button
                    type="button"
                    onClick={toggleMic}
                    title={isListening ? 'Kanpe mikwofòn' : 'Pale ak IA (Creole/English)'}
                    className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                      isListening
                        ? 'bg-rose/20 border border-rose/50 text-rose animate-pulse'
                        : 'bg-card/60 border border-border text-muted-foreground hover:text-cyan hover:border-cyan/40'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    id="ai-assistant-chat-input"
                    name="aiAssistantMessage"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ekri oswa pale nan Creole / English..."
                    disabled={isStreaming || analyzing}
                    autoComplete="off"
                    className="flex-1 bg-card/60 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 min-w-0"
                  />

                  <button
                    type="submit"
                    disabled={isStreaming || analyzing || !input.trim()}
                    className="w-10 h-10 shrink-0 rounded-lg bg-emerald text-background flex items-center justify-center hover:bg-emerald/90 disabled:opacity-40 transition-colors"
                  >
                    {isStreaming
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
