import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * Catches any JS error thrown by a child component tree and renders a
 * recovery UI instead of a white/blank screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback label:
 *   <ErrorBoundary label="Trading View">
 *     <TradingView />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const label = this.props.label || 'this section';
    const msg   = this.state.error?.message || 'Unknown error';

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        padding: '40px 24px',
        gap: 16,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #111827 0%, #0B0E14 100%)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 14,
        margin: 24,
      }}>
        <AlertTriangle size={36} style={{ color: '#F59E0B' }} />
        <h2 style={{ color: '#f3f4f6', fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, margin: 0 }}>
          Paj sa a gen yon ti pwoblèm chajman
        </h2>
        <p style={{ color: '#8899AA', fontSize: 13, maxWidth: 420, margin: 0 }}>
          <strong style={{ color: '#CBD5E1' }}>{label}</strong> rankontre yon erè inatandi.
          Ou ka rechaje paj la pou eseye ankò.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre style={{ color: '#FCA5A5', fontSize: 11, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '8px 12px', maxWidth: '100%', overflowX: 'auto', textAlign: 'left', margin: 0 }}>
            {msg}
          </pre>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#86EFAC', fontSize: 13, fontWeight: 600, padding: '8px 16px', cursor: 'pointer' }}
          >
            <RefreshCw size={13} /> Eseye Ankò
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 8, color: '#93C5FD', fontSize: 13, fontWeight: 600, padding: '8px 16px', cursor: 'pointer' }}
          >
            <RefreshCw size={13} /> Rechaje Paj
          </button>
        </div>
      </div>
    );
  }
}
