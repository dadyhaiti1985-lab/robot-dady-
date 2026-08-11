import React from 'react';
import { Bot, X, MessageSquare } from 'lucide-react';

export default function AIAssistantButton({ open, onClick, unread = 0 }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Close AI Assistant' : 'Open AI Assistant'}
      className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95"
      style={{
        background: open
          ? 'linear-gradient(135deg, #1E2A3B, #111827)'
          : 'linear-gradient(135deg, #2563EB, #10B981)',
        boxShadow: open
          ? '0 0 0 1px rgba(37,99,235,0.4), 0 8px 32px rgba(0,0,0,0.6)'
          : '0 0 0 1px rgba(16,185,129,0.5), 0 0 24px rgba(37,99,235,0.5), 0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Pulse ring */}
      {!open && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}
        />
      )}

      {open ? (
        <X className="w-5 h-5 text-white" />
      ) : (
        <Bot className="w-6 h-6 text-white" />
      )}

      {/* Unread badge */}
      {!open && unread > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#090E1A]">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}
