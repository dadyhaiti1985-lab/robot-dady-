import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import './ViewStyles.css';

export default function TradingView() {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [selectedPair, setSelectedPair] = useState('BTC/USD');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryStr);
    const pair = params.get('pair');
    if (pair) setSelectedPair(decodeURIComponent(pair));
  }, []);

  const handleSubmitOrder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error('Please enter a valid limit price');
      return;
    }
    try {
      setIsSubmitting(true);
      const signalData = {
        pair: selectedPair,
        type: side,
        confidence: 75,
        entryPrice: orderType === 'limit' ? parseFloat(limitPrice) : 0,
        stopLoss: 0,
        takeProfit: 0,
        quantity: parseFloat(quantity),
        candleTime: new Date().toISOString(),
      };
      const response = await fetch('/hcgi/api/ai-signals/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ signal: signalData }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`${side.toUpperCase()} order placed for ${selectedPair}`);
        setQuantity('');
        setLimitPrice('');
      } else {
        toast.error(data.message || 'Order rejected');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Trading</h1>
        <p>Execute trades with real-time market data and live order placement</p>
      </div>

      <div className="trading-layout">
        <div className="chart-area">
          <div className="chart-placeholder">
            <p style={{ fontSize: 48, marginBottom: 12 }}>📊</p>
            <p style={{ fontSize: 16, marginBottom: 6 }}>Live Candlestick Chart</p>
            <p style={{ fontSize: 13 }}>Full chart available on dashboard</p>
          </div>
        </div>

        <div className="order-panel">
          <h3>Place Order</h3>

          <div className="form-group">
            <label htmlFor="trading-side">Side</label>
            <div className="button-group">
              <button
                id="trading-side-buy"
                className={`btn ${side === 'buy' ? 'active' : ''}`}
                onClick={() => setSide('buy')}
                style={side === 'buy' ? { background: 'rgba(16,185,129,0.2)', color: '#10b981', borderColor: 'rgba(16,185,129,0.4)' } : {}}
              >
                BUY
              </button>
              <button
                id="trading-side-sell"
                className={`btn ${side === 'sell' ? 'active' : ''}`}
                onClick={() => setSide('sell')}
                style={side === 'sell' ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' } : {}}
              >
                SELL
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Order Type</label>
            <div className="button-group">
              <button
                className={`btn ${orderType === 'market' ? 'active' : ''}`}
                onClick={() => setOrderType('market')}
              >
                Market
              </button>
              <button
                className={`btn ${orderType === 'limit' ? 'active' : ''}`}
                onClick={() => setOrderType('limit')}
              >
                Limit
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="trading-symbol">Symbol</label>
            <input
              id="trading-symbol"
              name="trading-symbol"
              type="text"
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value.toUpperCase())}
              placeholder="BTC/USD"
            />
          </div>

          <div className="form-group">
            <label htmlFor="trading-quantity">Quantity</label>
            <input id="trading-quantity" name="trading-quantity" type="number" placeholder="0.00" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>

          {orderType === 'limit' && (
            <div className="form-group">
              <label htmlFor="trading-price">Limit Price</label>
              <input id="trading-price" name="trading-price" type="number" placeholder="0.00" min="0" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
            </div>
          )}

          <button className={`btn-submit ${side}`} onClick={handleSubmitOrder} disabled={isSubmitting}>{isSubmitting ? 'Placing Order...' : `${side.toUpperCase()} NOW`}</button>
        </div>
      </div>

      <div className="positions-section">
        <h3>Open Positions</h3>
        <p className="empty-state">No open positions — place a trade above to get started</p>
      </div>
    </div>
  );
}
