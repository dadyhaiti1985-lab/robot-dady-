import React, { useState, useEffect } from 'react';
import { Brain, Wifi, Globe, TrendingUp, Zap, Target, Shield, BarChart2, Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ROBOT_IMG = 'https://images.hostinger.com/2bff4d75-9c5c-4f74-8795-d2ec3c553c4a.png';

const ROBOT_STATES = [
  { label: 'Scanning Markets', color: '#2563EB', icon: Globe },
  { label: 'Analyzing Patterns', color: '#FBBF24', icon: BarChart2 },
  { label: 'Finding Opportunities', color: '#10B981', icon: Target },
  { label: 'Executing Strategy', color: '#10B981', icon: Zap },
];

const SIGNAL_DOTS = Array.from({ length: 12 });

export default function HeroSection({ botActive, onToggleBot, toggling, balance, isAdmin }) {
  const [confidence, setConfidence] = useState(87);
  const [opportunity, setOpportunity] = useState(72);
  const [robotStateIdx, setRobotStateIdx] = useState(0);
  const [scanAngle, setScanAngle] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => {
      setConfidence(v => Math.min(99, Math.max(60, v + (Math.random() > 0.5 ? 1 : -1))));
      setOpportunity(v => Math.min(95, Math.max(45, v + Math.floor((Math.random() - 0.5) * 3))));
    }, 2000);
    const t2 = setInterval(() => setRobotStateIdx(i => (i + 1) % ROBOT_STATES.length), 3000);
    const t3 = setInterval(() => setScanAngle(a => (a + 3) % 360), 50);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, []);

  const robotState = ROBOT_STATES[robotStateIdx];

  return (
    <section id="hero" className="rounded-2xl border border-[#1E2A3B] overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #090E1A 0%, #0F1729 50%, #0A1628 100%)' }}>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#1E2A3B 1px, transparent 1px), linear-gradient(90deg, #1E2A3B 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      {/* Blue glow top-left */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #2563EB, transparent)', transform: 'translate(-30%, -30%)' }} />

      {/* Green glow bottom-right */}
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #10B981, transparent)', transform: 'translate(30%, 30%)' }} />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left: AI Engine Status */}
        <div className="lg:col-span-2 p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563EB22, #10B98122)', border: '1px solid #2563EB44', boxShadow: '0 0 24px #2563EB33' }}>
                <Brain className="w-7 h-7 text-[#2563EB]" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#090E1A] animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Oracle AI Engine</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ background: '#10B98120', color: '#10B981', border: '1px solid #10B98140' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  ACTIVE
                </span>
                <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full"
                  style={{ background: '#2563EB20', color: '#2563EB', border: '1px solid #2563EB40' }}>
                  <Wifi className="w-3 h-3" /> Market Connected
                </span>
                <span className="text-xs text-[#4B5E74]">Scanning Global Markets...</span>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'AI Confidence', value: `${confidence}%`, icon: Brain, color: '#2563EB', bar: confidence },
              { label: 'Opportunity', value: `${opportunity}%`, icon: Target, color: '#FBBF24', bar: opportunity },
              { label: 'Risk Level', value: 'Medium', icon: Shield, color: '#F59E0B', bar: 45 },
              { label: 'Sentiment', value: 'Bullish', icon: TrendingUp, color: '#10B981', bar: 68 },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3 border border-[#1E2A3B]"
                style={{ background: '#111827' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                  <span className="text-[10px] text-[#4B5E74] uppercase tracking-wide">{m.label}</span>
                </div>
                <p className="text-lg font-bold text-white font-mono mb-1.5">{m.value}</p>
                <div className="h-1 rounded-full bg-[#1E2A3B] overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: m.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.bar}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4 justify-between"
            style={{ background: '#10B98110', border: '1px solid #10B98130' }}>
            <div>
              <p className="text-[11px] text-[#8899AA] uppercase tracking-wider mb-0.5">AI Recommendation</p>
              <p className="text-xl font-bold font-mono" style={{ color: '#10B981', textShadow: '0 0 12px #10B98166' }}>
                STRONG BUY — BTC/USD
              </p>
              <p className="text-xs text-[#8899AA] mt-0.5">Target: $71,200 · SL: $65,800 · R/R: 1:2.8</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: '#10B98120', color: '#10B981', border: '1px solid #10B98140' }}>
              <Zap className="w-3.5 h-3.5" />
              HIGH CONFIDENCE
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onToggleBot}
            disabled={toggling}
            className="flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-70"
            style={{
              background: botActive
                ? 'linear-gradient(135deg, #EF444490, #DC262690)'
                : 'linear-gradient(135deg, #2563EB, #10B981)',
              boxShadow: botActive
                ? '0 0 30px #EF444466, 0 4px 16px #00000060'
                : '0 0 30px #2563EB66, 0 4px 16px #00000060',
              minWidth: 240
            }}>
            {toggling
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              : botActive
                ? <><div className="w-3 h-3 rounded-sm bg-white" /> STOP AI TRADING</>
                : <><Play className="w-5 h-5 fill-white" /> START AI TRADING</>
            }
          </button>
        </div>

        {/* Right: Robot */}
        <div className="hidden lg:flex flex-col items-center justify-center p-6 relative">
          {/* Scanning circle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="260" height="260" className="opacity-20">
              <circle cx="130" cy="130" r="110" fill="none" stroke="#2563EB" strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="130" cy="130" r="85" fill="none" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 6" />
              {SIGNAL_DOTS.map((_, i) => {
                const angle = ((i / 12) * 360 + scanAngle) * (Math.PI / 180);
                const r = 110;
                return (
                  <circle key={i} cx={130 + r * Math.cos(angle)} cy={130 + r * Math.sin(angle)}
                    r={i % 3 === 0 ? 2 : 1} fill={i % 3 === 0 ? '#2563EB' : '#10B981'} />
                );
              })}
            </svg>
          </div>

          {/* Robot image */}
          <motion.img
            src={ROBOT_IMG}
            alt="Oracle AI Robot"
            className="relative z-10 w-52 h-auto drop-shadow-2xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* State badge */}
          <motion.div
            key={robotStateIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: `${robotState.color}20`, color: robotState.color, border: `1px solid ${robotState.color}40` }}>
            <robotState.icon className="w-3.5 h-3.5" />
            {robotState.label}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
