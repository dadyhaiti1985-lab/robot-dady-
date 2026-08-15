import React, { useState, useEffect } from 'react';
import { Wifi, Server, Brain, Shield, Zap, Activity } from 'lucide-react';

export default function FooterStatusBar() {
  const [latency, setLatency] = useState(12);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t1 = setInterval(() => setLatency(Math.floor(8 + Math.random() * 15)), 3000);
    const t2 = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const STATUS_ITEMS = [
    { icon: Brain, label: 'Oracle AI Online', color: '#10B981', pulse: true },
    { icon: Wifi, label: 'Market Connected', color: '#10B981', pulse: false },
    { icon: Activity, label: `${latency}ms`, color: '#2563EB', pulse: false },
    { icon: Server, label: '99.9% Uptime', color: '#10B981', pulse: false },
    { icon: Zap, label: 'AI Engine Active', color: '#FBBF24', pulse: true },
    { icon: Shield, label: 'Security Protected', color: '#10B981', pulse: false },
  ];

  return (
    <footer className="mt-6 rounded-xl border border-[#1E2A3B] px-4 py-2.5 flex flex-wrap items-center gap-4 justify-between"
      style={{ background: '#111827' }}>
      <div className="flex flex-wrap items-center gap-4">
        {STATUS_ITEMS.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            <div className="relative">
              <s.icon className="w-3 h-3" style={{ color: s.color }} />
              {s.pulse && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.color }} />}
            </div>
            <span style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="text-[11px] font-mono text-[#4B5E74]">
        {time.toLocaleTimeString()} UTC
      </div>
    </footer>
  );
}
